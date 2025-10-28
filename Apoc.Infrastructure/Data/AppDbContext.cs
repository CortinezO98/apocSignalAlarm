using Apoc.Domain.Claims;
using Apoc.Domain.Docs;
using Microsoft.EntityFrameworkCore;

namespace Apoc.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<ClaimDocument> Documents => Set<ClaimDocument>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Claim>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ClaimantDocNumber).IsRequired().HasMaxLength(30);
            e.Property(x => x.VictimDocNumber).IsRequired().HasMaxLength(30);
            e.Property(x => x.DocketNumber).HasMaxLength(64);
            e.Property(x => x.Status).HasConversion<int>();
        });

        b.Entity<ClaimDocument>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.DocType).IsRequired().HasMaxLength(50);
            e.Property(x => x.FileName).IsRequired().HasMaxLength(200);
            e.Property(x => x.Status).HasConversion<int>();
            e.HasIndex(x => x.ClaimId);
        });
    }
}
