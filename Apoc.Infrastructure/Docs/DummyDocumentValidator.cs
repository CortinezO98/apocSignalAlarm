using Apoc.Application.Contracts;
using Apoc.Domain.Docs;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Docs
{
    /// <summary>
    /// Implementación simulada de un validador de documentos.
    /// Simula detección de errores aleatorios, tiempos de análisis,
    /// y prepara el sistema para integrar IA o antivirus real.
    /// </summary>
    public sealed class DummyDocumentValidator : IDocumentValidator
    {
        private readonly ILogger<DummyDocumentValidator> _log;
        private static readonly Random _rng = new();

        public DummyDocumentValidator(ILogger<DummyDocumentValidator> log)
        {
            _log = log;
        }

        public async Task<DocValidationResult> ValidateAsync(ClaimDocument doc, Stream content, CancellationToken ct)
        {
            _log.LogInformation("[VALIDATOR] Iniciando validación de {DocId} ({DocType})", doc.Id, doc.DocType);

            // Simula un proceso que tarda entre 1 y 3 segundos
            await Task.Delay(TimeSpan.FromSeconds(_rng.Next(1, 3)), ct);

            // Simula una tasa de error del 10%
            bool ok = _rng.NextDouble() > 0.1;
            var result = ok
                ? DocValidationResult.Valid()
                : DocValidationResult.Invalid("Documento ilegible o corrupto");

            _log.LogInformation("[VALIDATOR] Resultado {Status} para {DocId}", result.IsValid ? "OK" : "FAIL", doc.Id);
            return result;
        }
    }
}
