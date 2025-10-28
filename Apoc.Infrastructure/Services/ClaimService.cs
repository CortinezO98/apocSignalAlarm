using Apoc.Application.Contracts;
using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Apoc.Infrastructure.Data;
using Apoc.Infrastructure.OTP;
using Apoc.Infrastructure.Sequencing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Services;

public sealed class ClaimService : IClaimService
{
    private readonly AppDbContext _db;
    private readonly IOtpSender _otp;
    private readonly IDocketGenerator _docket;
    private readonly IClaimNotifier _notifier;
    private readonly ILogger<ClaimService> _log;
    private readonly Dictionary<Guid,string> _otpByClaim = new();

    public ClaimService(
        AppDbContext db,
        IOtpSender otp,
        IDocketGenerator docket,
        IClaimNotifier notifier,
        ILogger<ClaimService> log)
    {
        _db = db; _otp = otp; _docket = docket; _notifier = notifier; _log = log;
    }

    public async Task<Claim> StartAsync(Claim seed, CancellationToken ct)
    {
        var code = Random.Shared.Next(100000, 999999).ToString();
        _otpByClaim[seed.Id] = code;
        await _otp.SendAsync("email", "user@example.com", code, ct);

        _db.Claims.Add(seed);
        await _db.SaveChangesAsync(ct);
        _log.LogInformation("Claim {ClaimId} started (OTP pending)", seed.Id);

        await _notifier.StatusChangedAsync(seed.Id, seed.Status.ToString(), null, ct);
        return seed;
    }

    public async Task<bool> ValidateOtpAsync(Guid claimId, string code, CancellationToken ct)
    {
        if (!_otpByClaim.TryGetValue(claimId, out var expected) || expected != code) return false;

        var claim = await _db.Claims.FindAsync([claimId], ct);
        if (claim is null) return false;

        claim.Status = ClaimStatus.DocsValidating;
        await _db.SaveChangesAsync(ct);
        await _notifier.StatusChangedAsync(claimId, claim.Status.ToString(), null, ct);
        return true;
    }

    public async Task<string> FileAsync(Guid claimId, CancellationToken ct)
    {
        var claim = await _db.Claims.FindAsync([claimId], ct) ?? throw new KeyNotFoundException();
        claim.Status = ClaimStatus.Filed;
        claim.DocketNumber = await _docket.NextAsync(claim.Insurer, claim.Line, ct);
        await _db.SaveChangesAsync(ct);

        await _notifier.StatusChangedAsync(claimId, claim.Status.ToString(), claim.DocketNumber, ct);
        return claim.DocketNumber!;
    }

    public Task<Claim?> FindAsync(string claimantDoc, string victimDoc, string docket, CancellationToken ct)
        => _db.Claims.FirstOrDefaultAsync(c =>
            c.ClaimantDocNumber == claimantDoc &&
            c.VictimDocNumber == victimDoc &&
            c.DocketNumber == docket, ct);

    public async Task AddDocumentAsync(Guid claimId, ClaimDocument doc, Stream content, CancellationToken ct)
    {
        _db.Documents.Add(doc);
        await _db.SaveChangesAsync(ct);

        await _notifier.DocUploadedAsync(claimId, doc.Id, doc.DocType, ct);

        _ = Task.Run(async () =>
        {
            await Task.Delay(1500, ct);
            doc.Status = DocStatus.Valid;
            await _db.SaveChangesAsync(ct);
            await _notifier.DocValidatedAsync(claimId, doc.Id, doc.Status.ToString(), ct);
        }, ct);
    }
}
