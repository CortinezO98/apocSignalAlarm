using Apoc.Application.Contracts;
using DomainDocs = Apoc.Domain.Docs;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Docs
{
    public sealed class DummyDocumentValidator : IDocumentValidator
    {
        private readonly ILogger<DummyDocumentValidator> _log;
        private static readonly Random _rng = new();

        public DummyDocumentValidator(ILogger<DummyDocumentValidator> log) => _log = log;

        public async Task<DocValidationResult> ValidateAsync(
            DomainDocs.ClaimDocument doc,
            Stream content,
            CancellationToken ct)
        {
            _log.LogInformation("[VALIDATOR] Iniciando validación de {DocId} ({DocType})", doc.Id, doc.DocType);

            await Task.Delay(TimeSpan.FromSeconds(_rng.Next(1, 3)), ct);

            var ok = _rng.NextDouble() > 0.1;
            return ok
                ? DocValidationResult.Valid()
                : DocValidationResult.Invalid("Documento ilegible o corrupto");
        }
    }
}
