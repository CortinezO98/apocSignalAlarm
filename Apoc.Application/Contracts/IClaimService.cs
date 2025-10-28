using Apoc.Domain.Claims;
using Apoc.Domain.Docs;

namespace Apoc.Application.Contracts;

public interface IClaimService
{
    Task<Claim> StartAsync(Claim seed, CancellationToken ct);
    Task<bool> ValidateOtpAsync(Guid claimId, string code, CancellationToken ct);
    Task<string> FileAsync(Guid claimId, CancellationToken ct);
    Task<Claim?> FindAsync(string claimantDoc, string victimDoc, string docket, CancellationToken ct);
    Task AddDocumentAsync(Guid claimId, ClaimDocument doc, Stream content, CancellationToken ct);
}
