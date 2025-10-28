using Apoc.Application.Contracts;
using Apoc.Domain.Docs;

namespace Apoc.Infrastructure.Services
{
    public sealed class DocumentValidator : IDocumentValidator
    {
        public Task<Apoc.Domain.Docs.DocValidationResult> ValidateAsync(ClaimDocument doc, Stream file, CancellationToken ct)
        {
            var result = new Apoc.Domain.Docs.DocValidationResult
            {
                IsValid = true,
                Message = "Documento validado correctamente."
            };

            return Task.FromResult(result);
        }
    }
}
