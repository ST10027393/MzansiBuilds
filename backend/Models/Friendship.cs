// FILE: backend/Models/Friendship.cs
namespace MzansiBuilds.Models
{
    public class Friendship
    {
        public int Id { get; set; }
        public string RequesterId { get; set; } = string.Empty;
        public string AddresseeId { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // "Pending", "Accepted", "Blocked"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User? Requester { get; set; }
        public User? Addressee { get; set; }
    }
}