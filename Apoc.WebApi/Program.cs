using Apoc.Application.Contracts;
using Apoc.Infrastructure;
using Apoc.WebApi.Hubs;
using Apoc.WebApi.Services; 

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

builder.Services.AddSingleton<IAlarmRepository, AlarmRepositoryInMemory>();
builder.Services.AddSingleton<IAlarmNotifier, SignalRAlarmNotifier>(); 
builder.Services.AddHostedService<AlarmGeneratorService>();

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
    app.UseSwaggerUI(opt =>
    {
        opt.SwaggerEndpoint("/openapi/v1.json", "APOC Signal Alarm v1");
        opt.RoutePrefix = "swagger"; 
    });
}


app.UseCors("ng");

app.MapControllers();
app.MapHub<AlarmHub>("/hubs/alarm");

app.Run();
