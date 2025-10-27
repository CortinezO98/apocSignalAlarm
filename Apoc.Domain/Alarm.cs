namespace Apoc.Domain;

public enum AlarmSeverity { Low = 1, Medium = 2, High = 3 }

public sealed class Alarm
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Title { get; init; } = default!;
    public string Description { get; init; } = default!;
    public AlarmSeverity Severity { get; init; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public bool Acknowledged { get; private set; }

    public void Acknowledge() => Acknowledged = true;
}
