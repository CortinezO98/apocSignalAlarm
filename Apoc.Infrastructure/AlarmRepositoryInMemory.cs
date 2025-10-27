using Apoc.Application.Contracts;
using Apoc.Domain;

namespace Apoc.Infrastructure;

public sealed class AlarmRepositoryInMemory : IAlarmRepository
{
    private readonly List<Alarm> _store = new();

    public Task AddAsync(Alarm alarm, CancellationToken ct)
    {
        _store.Add(alarm);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<Alarm>> ListAsync(CancellationToken ct)
        => Task.FromResult(_store.AsEnumerable());

    public Task<bool> AcknowledgeAsync(Guid id, CancellationToken ct)
    {
        var a = _store.FirstOrDefault(x => x.Id == id);
        if (a is null) return Task.FromResult(false);
        a.Acknowledge();
        return Task.FromResult(true);
    }
}
