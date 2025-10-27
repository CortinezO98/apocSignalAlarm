using Apoc.Application.Contracts;
using Apoc.Domain;
using Apoc.WebApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Apoc.WebApi.Services;

public sealed class SignalRAlarmNotifier : IAlarmNotifier
{
    private readonly IHubContext<AlarmHub> _hub;

    public SignalRAlarmNotifier(IHubContext<AlarmHub> hub)
    {
        _hub = hub;
    }

    public async Task AlarmCreatedAsync(Alarm alarm, CancellationToken ct)
    {
        await _hub.Clients.All.SendAsync("alarmCreated", new {
            alarm.Id,
            alarm.Title,
            alarm.Description,
            Severity = alarm.Severity.ToString(),
            alarm.CreatedAt,
            alarm.Acknowledged
        }, ct);
    }

    public async Task AlarmAcknowledgedAsync(Guid id, CancellationToken ct)
    {
        await _hub.Clients.All.SendAsync("alarmAcknowledged", id, ct);
    }
}
