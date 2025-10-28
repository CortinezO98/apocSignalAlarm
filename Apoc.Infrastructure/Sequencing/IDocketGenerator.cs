namespace Apoc.Infrastructure.Sequencing;

public interface IDocketGenerator
{
    Task<string> NextAsync(string insurer, string line, CancellationToken ct);
}
