using System.Net.Http.Json;
using Apoc.Application.Contracts;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Sequencing
{
    /// <summary>
    /// Generador de radicados que se conecta a un microservicio remoto.
    /// Implementa resiliencia mediante HttpClientFactory + Polly.
    /// </summary>
    public sealed class HttpDocketGenerator : IDocketGenerator
    {
        private readonly HttpClient _http;
        private readonly ILogger<HttpDocketGenerator> _logger;

        public HttpDocketGenerator(HttpClient http, ILogger<HttpDocketGenerator> logger)
        {
            _http = http;
            _logger = logger;
        }

        /// <summary>
        /// Solicita un nuevo radicado al microservicio de consecutivos.
        /// </summary>
        /// <param name="insurer">Nombre o código de la aseguradora</param>
        /// <param name="line">Línea de producto (SOAT, etc.)</param>
        /// <param name="ct">Token de cancelación</param>
        /// <returns>Consecutivo generado (string)</returns>
        public async Task<string> NextAsync(string insurer, string line, CancellationToken ct)
        {
            var payload = new
            {
                insurer = insurer ?? "GENERIC",
                line = line ?? "DEFAULT"
            };

            try
            {
                _logger.LogInformation("[DocketService] Solicitando consecutivo para {Insurer}/{Line}", insurer, line);

                var response = await _http.PostAsJsonAsync("/api/dockets/next", payload, ct);

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning("[DocketService] Error HTTP {Status}: {Body}", response.StatusCode, body);
                    throw new HttpRequestException($"Error al obtener consecutivo ({response.StatusCode})");
                }

                var docket = await response.Content.ReadAsStringAsync(ct);

                if (string.IsNullOrWhiteSpace(docket))
                {
                    throw new InvalidOperationException("El servicio devolvió un consecutivo vacío.");
                }

                _logger.LogInformation("[DocketService] Consecutivo asignado: {Docket}", docket.Trim());
                return docket.Trim();
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                _logger.LogError("[DocketService] Timeout al solicitar consecutivo a {BaseAddress}", _http.BaseAddress);
                throw new TimeoutException("El servicio de consecutivos no respondió a tiempo.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[DocketService] Fallo de red o HTTP al solicitar consecutivo.");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DocketService] Error inesperado generando consecutivo.");
                throw;
            }
        }
    }
}
