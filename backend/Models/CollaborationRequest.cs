namespace MzansiBuilds.Models
{
    public class CollaborationRequest
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string RequesterId { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // "Pending", "Accepted", "Declined"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Project? Project { get; set; }
        public User? Requester { get; set; }
    }
} 