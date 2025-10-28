using Apoc.Application.Contracts;
using Apoc.Application.UseCases;
using Apoc.Infrastructure.Data;
using Apoc.Infrastructure.OTP;
using Apoc.Infrastructure.Sequencing;
using Apoc.Infrastructure.Services;    
using Apoc.WebApi.Hubs;
using Apoc.WebApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using FluentValidation;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(opt => { opt.SuppressModelStateInvalidFilter = false; });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("apocpn"));
builder.Services.AddSignalR();

// Servicios de dominio/aplicación
builder.Services.AddScoped<IClaimService, ClaimService>();

// Notificador y OTP (si cambias a proveedor real luego, solo reemplazas esta línea)
builder.Services.AddSingleton<IClaimNotifier, SignalRClaimNotifier>();
builder.Services.AddSingleton<IOtpSender, ConsoleOtpSender>();

// VALIDACIÓN DE DOCUMENTOS -> REAL
// Usa Scoped si en el futuro el validador toca DB/IO por request (recomendado)
builder.Services.AddScoped<IDocumentValidator, DocumentValidator>();

builder.Services.AddValidatorsFromAssemblyContaining<StartClaimValidator>();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("tight", limiterOptions =>
    {
        limiterOptions.PermitLimit = 60;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueLimit = 0;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ui", p => p
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddProblemDetails();

// Políticas resilientes para el generador de radicados
var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
    .WaitAndRetryAsync(
        retryCount: 3,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
        onRetry: (outcome, delay, attempt, context) =>
            Console.WriteLine($"[DocketService] Reintentando {attempt} tras {delay.TotalSeconds}s...")
    );

var circuitBreaker = HttpPolicyExtensions
    .HandleTransientHttpError()
    .CircuitBreakerAsync(
        handledEventsAllowedBeforeBreaking: 3,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (outcome, ts) =>
            Console.WriteLine($"[DocketService] Circuito abierto durante {ts.TotalSeconds}s"),
        onReset: () => Console.WriteLine("[DocketService] Circuito restablecido")
    );

// Typed client: IDocketGenerator -> HttpDocketGenerator + HttpClientFactory + Polly
builder.Services.AddHttpClient<IDocketGenerator, HttpDocketGenerator>(client =>
{
    client.BaseAddress = new Uri("https://consecutivos.api.local/");
    client.Timeout = TimeSpan.FromSeconds(10);
})
.AddPolicyHandler(retryPolicy)
.AddPolicyHandler(circuitBreaker);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/openapi/v1.json", "APOC PN v1");
        c.RoutePrefix = "swagger";
    });
}
else
{
    app.UseHsts();
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseCors("ui");
app.UseRateLimiter();

// Rutas
var claims = app.MapGroup("/api/claims").RequireRateLimiting("tight");
claims.MapControllers();

app.MapHub<ClaimHub>("/hubs/claim");

app.Run();
