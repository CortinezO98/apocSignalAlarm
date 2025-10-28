namespace Apoc.Application.UseCases;

public sealed class StartClaimDto
{
    public string ClaimantDocNumber { get; init; } = null!;
    public string VictimDocNumber   { get; init; } = null!;
    public string Line              { get; init; } = "SOAT";
    public string ClaimType         { get; init; } = "REEMBOLSO";
}
