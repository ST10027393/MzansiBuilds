// FILE: backend/Models/User.cs
namespace MzansiBuilds.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty; // This will map directly to the Firebase UID
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation Property
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}