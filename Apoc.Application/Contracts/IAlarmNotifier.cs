namespace Apoc.Application.Contracts;

public interface IClaimNotifier
{
    Task StatusChangedAsync(Guid claimId, string status, string? docket, CancellationToken ct);
    Task DocUploadedAsync(Guid claimId, Guid docId, string docType, CancellationToken ct);
    Task DocValidatedAsync(Guid claimId, Guid docId, string status, CancellationToken ct);
}
