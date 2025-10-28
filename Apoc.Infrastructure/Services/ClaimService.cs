using Apoc.Application.Contracts;
using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Apoc.Infrastructure.Data;
using Apoc.Infrastructure.OTP;
using Apoc.Infrastructure.Sequencing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Services;

/// <summary>
/// Servicio principal para la gestión de reclamaciones.
/// Incluye validación OTP con expiración y bloqueo temporal,
/// así como validación asíncrona real mediante IDocumentValidator.
/// </summary>
public sealed class ClaimService : IClaimService
{
    private readonly AppDbContext _db;
    private readonly IOtpSender _otpSender;
    private readonly IDocketGenerator _docketGen;
    private readonly IClaimNotifier _notifier;
    private readonly IDocumentValidator _validator;
    private readonly ILogger<ClaimService> _log;

    // Almacenamiento temporal de OTP (in-memory)
    private readonly Dictionary<Guid, (string code, DateTime expires, int tries, DateTime? lockedUntil)> _otp = new();

    public ClaimService(
        AppDbContext db,
        IOtpSender otpSender,
        IDocketGenerator docketGen,
        IClaimNotifier notifier,
        IDocumentValidator validator,
        ILogger<ClaimService> log)
    {
        _db = db;
        _otpSender = otpSender;
        _docketGen = docketGen;
        _notifier = notifier;
        _validator = validator;
        _log = log;
    }

    // INICIO DE RECLAMACIÓN + GENERACIÓN OTP
    public async Task<Claim> StartAsync(Claim seed, CancellationToken ct)
    {
        var code = Random.Shared.Next(100000, 999999).ToString();

        _otp[seed.Id] = (code, DateTime.UtcNow.AddMinutes(3), 0, null);
        await _otpSender.SendAsync("email", "user@example.com", code, ct);

        _db.Claims.Add(seed);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("Claim {ClaimId} iniciada. OTP enviado ({Code}).", seed.Id, code);
        await _notifier.StatusChangedAsync(seed.Id, seed.Status.ToString(), null, ct);

        return seed;
    }

    // VALIDAR OTP CON EXPIRACIÓN, INTENTOS Y BLOQUEO
    public async Task<bool> ValidateOtpAsync(Guid id, string code, CancellationToken ct)
    {
        if (!_otp.TryGetValue(id, out var otpData))
        {
            _log.LogWarning("OTP no encontrado para {ClaimId}", id);
            return false;
        }

        if (otpData.lockedUntil is not null && otpData.lockedUntil > DateTime.UtcNow)
        {
            _log.LogWarning("Claim {ClaimId} bloqueada hasta {Locked}", id, otpData.lockedUntil);
            return false;
        }

        if (otpData.expires < DateTime.UtcNow)
        {
            _log.LogWarning("OTP expirado para {ClaimId}", id);
            return false;
        }

        var ok = otpData.code == code;
        if (!ok)
        {
            var tries = otpData.tries + 1;
            var locked = tries >= 3 ? DateTime.UtcNow.AddMinutes(10) : null;

            _otp[id] = (otpData.code, otpData.expires, tries, locked);
            _log.LogWarning("OTP inválido ({Tries}/3) para {ClaimId}", tries, id);
            return false;
        }

        // OTP válido
        _otp.Remove(id);

        var claim = await _db.Claims.FindAsync([id], ct);
        if (claim is null) return false;

        claim.Status = ClaimStatus.DocsValidating;
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("OTP validado correctamente para {ClaimId}", id);
        await _notifier.StatusChangedAsync(id, claim.Status.ToString(), null, ct);

        return true;
    }

    // REENVÍO OTP CON BLOQUEO TEMPORAL
    public async Task ResendOtpAsync(Guid id, CancellationToken ct)
    {
        if (!_otp.TryGetValue(id, out var otpData))
            throw new InvalidOperationException("Claim no tiene OTP previo.");

        if (otpData.lockedUntil is not null && otpData.lockedUntil > DateTime.UtcNow)
            throw new InvalidOperationException("Reenvío bloqueado temporalmente.");

        var newCode = Random.Shared.Next(100000, 999999).ToString();
        _otp[id] = (newCode, DateTime.UtcNow.AddMinutes(3), 0, null);

        await _otpSender.SendAsync("email", "user@example.com", newCode, ct);
        _log.LogInformation("Reenvío OTP para {ClaimId}: {Code}", id, newCode);
    }

    // GENERAR RADICADO (DOCKET)
    public async Task<string> FileAsync(Guid id, CancellationToken ct)
    {
        var claim = await _db.Claims.FindAsync([id], ct) ?? throw new KeyNotFoundException();

        claim.Status = ClaimStatus.Filed;
        claim.DocketNumber = await _docketGen.NextAsync(claim.Insurer, claim.Line, ct);

        await _db.SaveChangesAsync(ct);
        await _notifier.StatusChangedAsync(id, claim.Status.ToString(), claim.DocketNumber, ct);

        _log.LogInformation("Claim {ClaimId} archivada con radicado {Docket}", id, claim.DocketNumber);
        return claim.DocketNumber!;
    }

    // CONSULTAR RECLAMACIÓN EXISTENTE
    public Task<Claim?> FindAsync(string claimantDoc, string victimDoc, string docket, CancellationToken ct)
        => _db.Claims.FirstOrDefaultAsync(c =>
            c.ClaimantDocNumber == claimantDoc &&
            c.VictimDocNumber == victimDoc &&
            c.DocketNumber == docket, ct);

    // SUBIDA Y VALIDACIÓN ASÍNCRONA DE DOCUMENTOS (REAL)
    public async Task AddDocumentAsync(Guid claimId, ClaimDocument doc, Stream content, CancellationToken ct)
    {
        _db.Documents.Add(doc);
        await _db.SaveChangesAsync(ct);

        _log.LogInformation("[DOCS] Documento {DocId} ({Type}) recibido para {ClaimId}", doc.Id, doc.DocType, claimId);
        await _notifier.DocUploadedAsync(claimId, doc.Id, doc.DocType, ct);

        // Validación asíncrona real (a través del IDocumentValidator)
        _ = Task.Run(async () =>
        {
            try
            {
                var result = await _validator.ValidateAsync(doc, content, ct);

                doc.Status = result.IsValid ? DocStatus.Valid : DocStatus.Rejected;
                await _db.SaveChangesAsync(ct);

                await _notifier.DocValidatedAsync(claimId, doc.Id, doc.Status.ToString(), ct);

                _log.LogInformation("[DOCS] Validación finalizada para {DocId}: {Status} ({Msg})",
                    doc.Id, doc.Status, result.Message);
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "[DOCS] Error procesando documento {DocId}", doc.Id);
            }
        }, ct);
    }
}
