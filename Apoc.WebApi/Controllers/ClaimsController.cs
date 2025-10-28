using Apoc.Application.Contracts;
using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Microsoft.AspNetCore.Mvc;

namespace Apoc.WebApi.Controllers;

[ApiController]
[Route("api/claims")]
public class ClaimsController(IClaimService service) : ControllerBase
{
    [HttpPost("start")]
    public Task<Claim> Start([FromBody] Claim seed, CancellationToken ct)
        => service.StartAsync(seed, ct);

    [HttpPost("{id:guid}/otp")]
    public async Task<IActionResult> ValidateOtp(Guid id, [FromBody] string code, CancellationToken ct)
        => await service.ValidateOtpAsync(id, code, ct) ? Ok() : BadRequest();

    [HttpPost("{id:guid}/file")]
    public Task<string> File(Guid id, CancellationToken ct) => service.FileAsync(id, ct);

    [HttpGet("find")]
    public Task<Claim?> Find([FromQuery] string claimantDoc, [FromQuery] string victimDoc, [FromQuery] string docket, CancellationToken ct)
        => service.FindAsync(claimantDoc, victimDoc, docket, ct);

    [HttpPost("{id:guid}/docs")]
    public async Task<IActionResult> Upload(Guid id, [FromForm] IFormFile file, [FromForm] string docType, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest("Archivo vacío.");
        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) return BadRequest("Sólo PDF."); 

        var doc = new ClaimDocument { ClaimId = id, DocType = docType, FileName = file.FileName, SizeBytes = file.Length };
        using var s = file.OpenReadStream();
        await service.AddDocumentAsync(id, doc, s, ct);
        return Accepted(new { doc.Id });
    }
}
