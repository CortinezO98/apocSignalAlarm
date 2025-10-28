namespace Apoc.Infrastructure.Sequencing;

public sealed class SimpleDocketGenerator : IDocketGenerator
{
    private static long _seq = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    public Task<string> NextAsync(string insurer, string line, CancellationToken ct)
        => Task.FromResult($"{insurer}-{line}-{Interlocked.Increment(ref _seq):D8}");
}
