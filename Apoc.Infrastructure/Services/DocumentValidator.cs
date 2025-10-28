using Apoc.Application.Contracts;
using DomainDocs = Apoc.Domain.Docs;

namespace Apoc.Infrastructure.Services
{
    public sealed class DocumentValidator : IDocumentValidator
    {
        public Task<DocValidationResult> ValidateAsync(
            DomainDocs.ClaimDocument doc,
            Stream file,
            CancellationToken ct)
        {
            return Task.FromResult(DocValidationResult.Valid());
        }
    }
}
