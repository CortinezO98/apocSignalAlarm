using Apoc.Application.Contracts;
using Apoc.Application.UseCases;
using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Apoc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimSvc;
    private readonly IValidator<StartClaimDto> _validator;

    public ClaimsController(IClaimService claimSvc, IValidator<StartClaimDto> validator)
    {
        _claimSvc = claimSvc;
        _validator = validator;
    }

    // POST /api/claims/start
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartClaimDto dto, CancellationToken ct)
    {
        var validation = await _validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return ValidationProblem(validation.ToDictionary());

        // DTO → Dominio
        var claim = new Claim
        {
            ClaimantDocNumber = dto.ClaimantDocNumber,
            VictimDocNumber = dto.VictimDocNumber,
            Line = dto.Line,
            ClaimType = dto.ClaimType
        };

        var result = await _claimSvc.StartAsync(claim, ct);
        return Ok(result);
    }

    // POST /api/claims/{id}/otp (validate)
    [HttpPost("{id:guid}/otp")]
    public async Task<IActionResult> ValidateOtp(Guid id, [FromBody] string code, CancellationToken ct)
    {
        var ok = await _claimSvc.ValidateOtpAsync(id, code, ct);
        return ok ? Ok() : BadRequest("OTP inválido o expirado");
    }

    // POST /api/claims/{id}/otp/resend
    [HttpPost("{id:guid}/otp/resend")]
    public async Task<IActionResult> Resend(Guid id, CancellationToken ct)
    {
        await _claimSvc.ResendOtpAsync(id, ct);
        return Ok();
    }

    // POST /api/claims/{id}/file (radicado)
    [HttpPost("{id:guid}/file")]
    public Task<string> File(Guid id, CancellationToken ct) =>
        _claimSvc.FileAsync(id, ct);


    // GET /api/claims/find
    [HttpGet("find")]
    public Task<Claim?> Find(
        [FromQuery] string claimantDoc,
        [FromQuery] string victimDoc,
        [FromQuery] string docket,
        CancellationToken ct) =>
        _claimSvc.FindAsync(claimantDoc, victimDoc, docket, ct);

    // POST /api/claims/{id}/docs (subida de documentos)
    [HttpPost("{id:guid}/docs")]
    public async Task<IActionResult> Upload(
        Guid id,
        [FromForm] IFormFile file,
        [FromForm] string docType,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("Archivo vacío.");
        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Solo se permiten archivos PDF.");

        var doc = new ClaimDocument
        {
            ClaimId = id,
            DocType = docType,
            FileName = file.FileName,
            SizeBytes = file.Length
        };

        using var stream = file.OpenReadStream();
        await _claimSvc.AddDocumentAsync(id, doc, stream, ct);
        return Accepted(new { doc.Id });
    }
}
