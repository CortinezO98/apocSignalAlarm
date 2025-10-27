using Apoc.Application.Contracts;
using Apoc.Domain;
using Microsoft.Extensions.Hosting; 

namespace Apoc.Infrastructure;

public sealed class AlarmGeneratorService : BackgroundService
{
    private readonly IAlarmRepository _repo;
    private readonly IAlarmNotifier _notifier;

    public AlarmGeneratorService(IAlarmRepository repo, IAlarmNotifier notifier)
    {
        _repo = repo;
        _notifier = notifier;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var rand = new Random();

        while (!stoppingToken.IsCancellationRequested)
        {
            var sev = (AlarmSeverity)rand.Next(1, 4);

            var alarm = new Alarm
            {
                Title = $"Alarma {Guid.NewGuid().ToString()[..8]}",
                Description = "Evento automático de demostración",
                Severity = sev
            };

            await _repo.AddAsync(alarm, stoppingToken);
            await _notifier.AlarmCreatedAsync(alarm, stoppingToken);

            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
    }
}
