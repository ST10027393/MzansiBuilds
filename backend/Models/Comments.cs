// src/Models/Comment.cs
using System.ComponentModel.DataAnnotations;

namespace MzansiBuilds.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}