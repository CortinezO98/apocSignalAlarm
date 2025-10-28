namespace Apoc.Infrastructure.OTP;

public interface IOtpSender
{
    Task SendAsync(string channel, string address, string code, CancellationToken ct);
}
