namespace Apoc.Domain.Docs
{
    public sealed class DocValidationResult
    {
        public bool IsValid { get; set; }
        public string? Message { get; set; }
    }
}
