using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.OTP;

public sealed class ConsoleOtpSender(ILogger<ConsoleOtpSender> logger) : IOtpSender
{
    public Task SendAsync(string channel, string address, string code, CancellationToken ct)
    {
        logger.LogInformation("OTP via {Channel} to {Address}: {Code}", channel, address, code);
        return Task.CompletedTask;
    }
}
