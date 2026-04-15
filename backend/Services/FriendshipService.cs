// FILE: backend/Services/FriendshipService.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services
{
    public class FriendshipService : IFriendshipService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public FriendshipService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task SendFriendRequestAsync(string requesterId, string addresseeId)
        {
            if (requesterId == addresseeId)
                throw new InvalidOperationException("You cannot send a friend request to yourself.");

            var alreadyExists = await _context.Friendships.AnyAsync(f =>
                (f.RequesterId == requesterId && f.AddresseeId == addresseeId) ||
                (f.RequesterId == addresseeId && f.AddresseeId == requesterId));

            if (alreadyExists)
                throw new InvalidOperationException("A friendship or pending request already exists.");

            var friendship = new Friendship
            {
                RequesterId = requesterId,
                AddresseeId = addresseeId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();

            // Observer: Notify the addressee via Redis
            await _notificationService.SendNotificationAsync(
                userId: addresseeId,
                type: "FriendRequest",
                content: "You have a new friend request!",
                relatedEntityId: friendship.Id
            );
        }

        public async Task RespondToRequestAsync(int requestId, string addresseeId, bool accept)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => f.Id == requestId && f.AddresseeId == addresseeId)
                ?? throw new Exception("Friend request not found.");

            friendship.Status = accept ? "Accepted" : "Declined";
            await _context.SaveChangesAsync();

            if (accept)
            {
                // Observer: Notify the requester they were accepted
                await _notificationService.SendNotificationAsync(
                    userId: friendship.RequesterId,
                    type: "FriendAccepted",
                    content: "Your friend request was accepted!",
                    relatedEntityId: friendship.Id
                );
            }
        }

        public async Task RemoveFriendAsync(string userId, string friendId)
        {
            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    f.Status == "Accepted" &&
                    ((f.RequesterId == userId && f.AddresseeId == friendId) ||
                     (f.RequesterId == friendId && f.AddresseeId == userId)))
                ?? throw new Exception("Friendship not found.");

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Friendship>> GetFriendRequestsAsync(string userId)
        {
            return await _context.Friendships
                .Where(f => f.AddresseeId == userId && f.Status == "Pending")
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetFriendsAsync(string userId)
        {
            return await _context.Friendships
                .Where(f => f.Status == "Accepted" &&
                    (f.RequesterId == userId || f.AddresseeId == userId))
                .ToListAsync();
        }
    }
}