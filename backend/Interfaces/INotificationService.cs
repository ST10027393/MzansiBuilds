using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface INotificationService
    {
        // This is the trigger method that gets called whenever a significant event happens (like publishing or completing a project)
        Task SendNotificationAsync(string userId, string type, string content, int? relatedEntityId = null);
        
        // This fetches the real-time feed
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
    }
}