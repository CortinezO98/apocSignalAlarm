using Apoc.Domain.Docs;

namespace Apoc.Application.Contracts
{
    /// <summary>
    /// Contrato para validadores de documentos.
    /// Permite validar contenido de un documento y devolver un resultado.
    /// </summary>
    public interface IDocumentValidator
    {
        /// <summary>
        /// Valida un documento de reclamo (por ejemplo: PDF de cédula, factura, etc.).
        /// </summary>
        /// <param name="document">Documento a validar (entidad del dominio)</param>
        /// <param name="stream">Contenido binario</param>
        /// <param name="ct">Token de cancelación</param>
        /// <returns>Resultado de la validación</returns>
        Task<DocValidationResult> ValidateAsync(ClaimDocument document, Stream stream, CancellationToken ct);
    }

    /// <summary>
    /// Resultado de validación estructurado.
    /// </summary>
    public sealed class DocValidationResult
    {
        public bool IsValid { get; init; }
        public string? Message { get; init; }

        public static DocValidationResult Valid() => new() { IsValid = true, Message = "Documento válido" };
        public static DocValidationResult Invalid(string reason) => new() { IsValid = false, Message = reason };
    }
}
