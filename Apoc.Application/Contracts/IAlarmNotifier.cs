using Apoc.Domain;

namespace Apoc.Application.Contracts;

public interface IAlarmNotifier
{
    Task AlarmCreatedAsync(Alarm alarm, CancellationToken ct);
    Task AlarmAcknowledgedAsync(Guid id, CancellationToken ct);
}
