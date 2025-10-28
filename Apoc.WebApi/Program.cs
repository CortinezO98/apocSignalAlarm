using Apoc.Application.Contracts;
using Apoc.Infrastructure.Data;
using Apoc.Infrastructure.OTP;
using Apoc.Infrastructure.Sequencing;
using Apoc.Infrastructure.Services;
using Apoc.WebApi.Hubs;
using Apoc.WebApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseInMemoryDatabase("apocpn"));
builder.Services.AddSignalR();

// DI
builder.Services.AddScoped<IClaimService, ClaimService>();
builder.Services.AddSingleton<IClaimNotifier, SignalRClaimNotifier>();
builder.Services.AddSingleton<IDocketGenerator, SimpleDocketGenerator>();
builder.Services.AddSingleton<IOtpSender, ConsoleOtpSender>();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ng", p => p
        .WithOrigins("http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapSwaggerUI();
}



app.UseCors("ng");
app.MapControllers();
app.MapHub<ClaimHub>("/hubs/claim");

app.Run();
