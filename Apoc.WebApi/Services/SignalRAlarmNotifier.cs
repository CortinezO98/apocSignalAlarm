using Apoc.Application.Contracts;
using Apoc.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Apoc.WebApi.Services;

public sealed class SignalRClaimNotifier(IHubContext<ClaimHub> hub) : IClaimNotifier
{
    public Task StatusChangedAsync(Guid claimId, string status, string? docket, CancellationToken ct) =>
        hub.Clients.Group(claimId.ToString()).SendAsync("statusChanged", new { claimId, status, docket }, ct);

    public Task DocUploadedAsync(Guid claimId, Guid docId, string docType, CancellationToken ct) =>
        hub.Clients.Group(claimId.ToString()).SendAsync("docUploaded", new { claimId, docId, docType }, ct);

    public Task DocValidatedAsync(Guid claimId, Guid docId, string status, CancellationToken ct) =>
        hub.Clients.Group(claimId.ToString()).SendAsync("docValidated", new { claimId, docId, status }, ct);
}
