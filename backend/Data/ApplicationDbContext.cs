using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Models;

namespace MzansiBuilds.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Core DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Milestone> Milestones { get; set; }
        
        // Social DbSets
        public DbSet<Message> Messages { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Collaborator> Collaborators { get; set; }
        public DbSet<CollaborationRequest> CollaborationRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; } 

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Indexes for speed
            modelBuilder.Entity<Project>().HasIndex(p => p.CurrentState);
            modelBuilder.Entity<Project>().HasIndex(p => p.CreatedAt);

            // 2. Prevent Cascade Delete Errors on Messages
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. Prevent Cascade Delete Errors on Friendships
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Requester)
                .WithMany()
                .HasForeignKey(f => f.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Addressee)
                .WithMany()
                .HasForeignKey(f => f.AddresseeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // 4. Prevent Cascade Delete Errors on Collaboration Requests
            modelBuilder.Entity<CollaborationRequest>()
                .HasOne(cr => cr.Requester)
                .WithMany()
                .HasForeignKey(cr => cr.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}