using Microsoft.AspNetCore.SignalR;

namespace Apoc.WebApi.Hubs;

public sealed class ClaimHub : Hub
{
    public Task JoinClaim(string claimId) => Groups.AddToGroupAsync(Context.ConnectionId, claimId);
}
