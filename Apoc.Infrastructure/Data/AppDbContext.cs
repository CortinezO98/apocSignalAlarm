using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Microsoft.EntityFrameworkCore;

namespace Apoc.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> opt) : base(opt){}
    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<ClaimDocument> Documents => Set<ClaimDocument>();
}

// Generador de Consecutivos
namespace Apoc.Infrastructure.Sequencing;
public interface IDocketGenerator { Task<string> NextAsync(string insurer, string line, CancellationToken ct); }

public sealed class SimpleDocketGenerator : IDocketGenerator
{
    private static long _seq = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    public Task<string> NextAsync(string insurer, string line, CancellationToken ct)
        => Task.FromResult($"{insurer}-{line}-{Interlocked.Increment(ref _seq):D8}");
}


// Envio de OTP
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.OTP;
public interface IOtpSender { Task SendAsync(string channel, string address, string code, CancellationToken ct); }

public sealed class ConsoleOtpSender(ILogger<ConsoleOtpSender> logger) : IOtpSender
{
    public Task SendAsync(string channel, string address, string code, CancellationToken ct)
    {
        logger.LogInformation("OTP via {Channel} to {Address}: {Code}", channel, address, code);
        return Task.CompletedTask;
    }
}
