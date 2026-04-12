namespace MzansiBuilds.Models
{
    public class Collaborator
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public Project? Project { get; set; }
        public User? User { get; set; }
    }
}