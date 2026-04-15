// FILE: backend/Models/Project.cs
namespace MzansiBuilds.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string OwnerId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Readme { get; set; } = string.Empty;
        public string RepoLink { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty; 
        public string Status { get; set; } = "Draft"; 
        public string AuthorId { get; set; } = string.Empty; 
        
        public string AuthorUsername { get; set; } = string.Empty;
        public string AuthorEmail { get; set; } = string.Empty;
        
        // Default to Draft so it is saved locally to the user, but not public.
        public string CurrentState { get; set; } = "Draft"; 
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User? Owner { get; set; }
        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public ICollection<Collaborator> Collaborators { get; set; } = new List<Collaborator>();
        public ICollection<CollaborationRequest> CollaborationRequests { get; set; } = new List<CollaborationRequest>();
    }
}