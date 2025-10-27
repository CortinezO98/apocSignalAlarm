using Apoc.Domain;

namespace Apoc.Application.Contracts;

public interface IAlarmRepository
{
    Task AddAsync(Alarm alarm, CancellationToken ct);
    Task<IEnumerable<Alarm>> ListAsync(CancellationToken ct);
    Task<bool> AcknowledgeAsync(Guid id, CancellationToken ct);
}
