namespace Apoc.Domain.Docs;

public enum DocStatus { Uploaded, Validating, Valid, Invalid }

public sealed class ClaimDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClaimId { get; set; }
    public string DocType { get; set; } = default!; 
    public string FileName { get; set; } = default!;
    public long SizeBytes { get; set; }
    public DocStatus Status { get; set; } = DocStatus.Uploaded;
    public string? ValidationMessage { get; set; }
}
