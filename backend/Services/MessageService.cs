// FILE: backend/Services/MessageService.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services
{
    public class MessageService : IMessageService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public MessageService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Message> SendMessageAsync(string senderId, string receiverId, string content)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new InvalidOperationException("Message content cannot be empty.");

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Observer: Notify receiver via Redis for the chat icon counter
            await _notificationService.SendNotificationAsync(
                userId: receiverId,
                type: "Message",
                content: $"You have a new message!",
                relatedEntityId: message.Id
            );

            return message;
        }

        public async Task<IEnumerable<Message>> GetConversationAsync(string userId, string otherUserId)
        {
            return await _context.Messages
                .Where(m =>
                    (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                    (m.SenderId == otherUserId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        // Fetches the latest message per conversation for the chat preview pane
        public async Task<IEnumerable<object>> GetChatPreviewsAsync(string userId)
        {
            var previews = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g => new
                {
                    OtherUserId = g.Key,
                    LatestMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                    SentAt = g.Max(m => m.SentAt),
                    UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead)
                })
                .OrderByDescending(p => p.SentAt)
                .ToListAsync();

            return previews;
        }

        public async Task MarkAsReadAsync(string userId, string otherUserId)
        {
            var unreadMessages = await _context.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == userId && !m.IsRead)
                .ToListAsync();

            foreach (var msg in unreadMessages)
                msg.IsRead = true;

            await _context.SaveChangesAsync();
        }
    }
}