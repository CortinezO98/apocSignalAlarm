using Apoc.Application.Contracts;
using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Apoc.Infrastructure.Data;
using Apoc.Infrastructure.OTP;
using Apoc.Infrastructure.Sequencing;
using Apoc.WebApi.Hubs; // para emitir eventos
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Apoc.Infrastructure.Services;

public sealed class ClaimService(
    AppDbContext db,
    IOtpSender otp,
    IDocketGenerator docket,
    IHubContext<ClaimHub> hub,
    ILogger<ClaimService> log
) : IClaimService
{
    private readonly Dictionary<Guid,string> _otp = new();

    public async Task<Claim> StartAsync(Claim seed, CancellationToken ct)
    {
        var code = Random.Shared.Next(100000, 999999).ToString();
        _otp[seed.Id] = code;
        await otp.SendAsync("email","user@example.com",code,ct); 

        db.Claims.Add(seed);
        await db.SaveChangesAsync(ct);
        log.LogInformation("Claim {ClaimId} started (OTP pending)", seed.Id);

        await hub.Clients.Group(seed.Id.ToString()).SendAsync("statusChanged", new {
            claimId = seed.Id, status = seed.Status.ToString()
        }, ct);

        return seed;
    }

    public async Task<bool> ValidateOtpAsync(Guid claimId, string code, CancellationToken ct)
    {
        if (_otp.TryGetValue(claimId, out var expected) && expected == code)
        {
            var claim = await db.Claims.FindAsync([claimId], ct);
            if (claim is null) return false;
            claim.Status = ClaimStatus.DocsValidating; 
            await db.SaveChangesAsync(ct);

            await hub.Clients.Group(claimId.ToString()).SendAsync("statusChanged", new {
                claimId, status = claim.Status.ToString()
            }, ct);
            return true;
        }
        return false;
    }

    public async Task<string> FileAsync(Guid claimId, CancellationToken ct)
    {
        var claim = await db.Claims.FindAsync([claimId], ct) ?? throw new KeyNotFoundException();
        claim.Status = ClaimStatus.Filed;
        claim.DocketNumber = await docket.NextAsync(claim.Insurer, claim.Line, ct);
        await db.SaveChangesAsync(ct);

        await hub.Clients.Group(claimId.ToString()).SendAsync("statusChanged", new {
            claimId, status = claim.Status.ToString(), docket = claim.DocketNumber
        }, ct);

  
        return claim.DocketNumber!;
    }

    public Task<Claim?> FindAsync(string claimantDoc, string victimDoc, string docketNumber, CancellationToken ct)
        => db.Claims.FirstOrDefaultAsync(c =>
            c.ClaimantDocNumber == claimantDoc &&
            c.VictimDocNumber == victimDoc &&
            c.DocketNumber == docketNumber, ct);

    public async Task AddDocumentAsync(Guid claimId, ClaimDocument doc, Stream content, CancellationToken ct)
    {

        db.Documents.Add(doc);
        await db.SaveChangesAsync(ct);

        await hub.Clients.Group(claimId.ToString()).SendAsync("docUploaded", new {
            claimId, docId = doc.Id, docType = doc.DocType
        }, ct);


        _ = Task.Run(async () =>
        {
            await Task.Delay(1500, ct);
            doc.Status = DocStatus.Valid;
            await db.SaveChangesAsync(ct);
            await hub.Clients.Group(claimId.ToString()).SendAsync("docValidated", new {
                claimId, docId = doc.Id, status = doc.Status.ToString()
            }, ct);
        }, ct);
    }
}
