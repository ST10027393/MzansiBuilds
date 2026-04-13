using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IFriendshipService
    {
        Task SendFriendRequestAsync(string requesterId, string addresseeId);
        Task RespondToRequestAsync(int requestId, string addresseeId, bool accept);
        Task RemoveFriendAsync(string userId, string friendId);
        Task<IEnumerable<Friendship>> GetFriendRequestsAsync(string userId);
        Task<IEnumerable<Friendship>> GetFriendsAsync(string userId);
    }
}