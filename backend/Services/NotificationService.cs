using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using StackExchange.Redis;
using System.Text.Json;

namespace MzansiBuilds.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConnectionMultiplexer _redis;

        public NotificationService(ApplicationDbContext context, IConnectionMultiplexer redis)
        {
            _context = context;
            _redis = redis;
        }

        public async Task SendNotificationAsync(string userId, string type, string content, int? relatedEntityId = null)
        {
            // 1. The Persistent Layer: Save to SQL
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Content = content,
                RelatedEntityId = relatedEntityId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // 2. The Real-Time Cache Layer: Push to Upstash Redis
            var db = _redis.GetDatabase();
            var redisKey = $"notifications:{userId}";
            
            var jsonNotification = JsonSerializer.Serialize(notification);
            
            // Push to the top of the user's Redis list and keep only the latest 20 alerts
            await db.ListLeftPushAsync(redisKey, jsonNotification);
            await db.ListTrimAsync(redisKey, 0, 19);
        }

        public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
        {
            // The frontend will call this to instantly load the red notification bell counter
            var db = _redis.GetDatabase();
            var redisKey = $"notifications:{userId}";
            
            // Try to get them from lightning-fast Redis first
            var cachedNotifications = await db.ListRangeAsync(redisKey);
            
            if (cachedNotifications.Length > 0)
            {
                return cachedNotifications.Select(n => JsonSerializer.Deserialize<Notification>(n!)).ToList();
            }

            // Fallback: If Redis is empty, query the slower SQL database
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(20)
                .ToListAsync();
        }
    }
}