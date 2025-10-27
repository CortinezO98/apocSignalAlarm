using Apoc.Application.Contracts;
using Microsoft.AspNetCore.SignalR;

namespace Apoc.WebApi.Hubs;

public sealed class AlarmHub : Hub
{
    private readonly IAlarmNotifier _notifier;
    public AlarmHub(IAlarmNotifier notifier) => _notifier = notifier;

}
