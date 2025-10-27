using Apoc.Application.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Apoc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AlarmsController : ControllerBase
{
    private readonly IAlarmRepository _repo;
    private readonly IAlarmNotifier _notifier;

    public AlarmsController(IAlarmRepository repo, IAlarmNotifier notifier)
    {
        _repo = repo;
        _notifier = notifier;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _repo.ListAsync(ct));

    [HttpPost("{id:guid}/ack")]
    public async Task<IActionResult> Ack(Guid id, CancellationToken ct)
    {
        var ok = await _repo.AcknowledgeAsync(id, ct);
        if (!ok) return NotFound();

        await _notifier.AlarmAcknowledgedAsync(id, ct);
        return NoContent();
    }
}
