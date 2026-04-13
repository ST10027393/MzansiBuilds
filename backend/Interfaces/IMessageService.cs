using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IMessageService
    {
        Task<Message> SendMessageAsync(string senderId, string receiverId, string content);
        Task<IEnumerable<Message>> GetConversationAsync(string userId, string otherUserId);
        Task<IEnumerable<object>> GetChatPreviewsAsync(string userId);
        Task MarkAsReadAsync(string userId, string otherUserId);
    }
}