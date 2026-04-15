// FILE: backend/Models/Message.cs
namespace MzansiBuilds.Models
{
    public class Message
    {
        public int Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;

        // Navigation Properties
        public User? Sender { get; set; }
        public User? Receiver { get; set; }
    }
}