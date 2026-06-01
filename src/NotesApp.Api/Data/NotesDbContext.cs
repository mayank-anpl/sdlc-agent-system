using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace NotesApp.Api.Data;

public class NotesDbContext : IdentityDbContext<ApplicationUser>
{
    public NotesDbContext(DbContextOptions<NotesDbContext> options)
        : base(options)
    {
    }

    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Note>(entity =>
        {
            entity.ToTable("Notes");
            entity.HasKey(n => n.Id);

            entity.Property(n => n.UserId).IsRequired();
            entity.Property(n => n.Title).IsRequired();
            entity.Property(n => n.Body).IsRequired();
            entity.Property(n => n.CreatedAt).IsRequired();
            entity.Property(n => n.UpdatedAt).IsRequired();

            entity
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(n => new { n.UserId, n.CreatedAt });
        });
    }
}
