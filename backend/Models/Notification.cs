namespace MzansiBuilds.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        // The user receiving the notification
        public string UserId { get; set; } = string.Empty; 
        
        // e.g., "FriendRequest", "CollabRequest", "Comment"
        public string Type { get; set; } = string.Empty; 
        
        // The text displayed to the user
        public string Content { get; set; } = string.Empty; 
        
        // The ID of the related project or user (to make the notification clickable)
        public int? RelatedEntityId { get; set; } 
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public User? User { get; set; }
    }
}