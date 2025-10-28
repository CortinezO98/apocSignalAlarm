namespace Apoc.Domain.Claims;

public enum ClaimStatus { Draft, OtpPending, Filed, DocsValidating, InAudit, Closed }

public sealed class Claim
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Insurer { get; set; } = "MUNDIAL"; 
    public string Line { get; set; } = "SOAT";       
    public string ClaimType { get; set; } = "REEMBOLSO"; 
    public string ClaimantDocType { get; set; } = "CC";
    public string ClaimantDocNumber { get; set; } = default!;
    public string VictimDocType { get; set; } = "CC";
    public string VictimDocNumber { get; set; } = default!;
    public string? DocketNumber { get; set; } 
    public ClaimStatus Status { get; set; } = ClaimStatus.OtpPending;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
