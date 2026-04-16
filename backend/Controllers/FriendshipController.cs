// FILE: backend/Controllers/FriendshipController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Hubs;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using MzansiBuilds.Data;
using SQLitePCL;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;
        private readonly ApplicationDbContext _context;

        public FriendshipController(IFriendshipService friendshipService, ApplicationDbContext context)
        {
            _friendshipService = friendshipService;
            _context = context;
        }

        [HttpPost("{addresseeId}/request")]
        public async Task<IActionResult> SendRequest(string addresseeId)
        {
            var requesterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(requesterId)) return Unauthorized("Invalid token.");

            try
            {
                await _friendshipService.SendFriendRequestAsync(requesterId, addresseeId);
                return Ok(new { Message = "Friend request sent." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}/respond")]
        // FIXED: Changed RespondDto to RespondToRequestDto to match your class at the bottom
        public async Task<IActionResult> RespondToRequest(int id, [FromBody] RespondToRequestDto req, [FromServices] IHubContext<NotificationHub> hub)
        {
            var request = await _context.Friendships.FindAsync(id); // FIXED: Changed DbContext to _context
            if (request == null) return NotFound();

            request.Status = req.Accept ? "Friends" : "Declined";
            
            var notification = new Notification {
                UserId = request.RequesterId,
                Type = "FriendAccept",
                Content = "accepted your friend request!",
                RelatedEntityId = request.AddresseeId, 
                CreatedAt = DateTime.UtcNow
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            await hub.Clients.User(request.RequesterId).SendAsync("ReceiveNotification", notification);

            return Ok();
        }

        [HttpDelete("{friendId}")]
        public async Task<IActionResult> RemoveFriend(string friendId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            try
            {
                await _friendshipService.RemoveFriendAsync(userId, friendId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            var requests = await _friendshipService.GetFriendRequestsAsync(userId);
            return Ok(requests);
        }

        [HttpGet]
        public async Task<IActionResult> GetFriends()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            var friends = await _friendshipService.GetFriendsAsync(userId);
            return Ok(friends);
        }
    }

    public class RespondToRequestDto
    {
        public bool Accept { get; set; }
    }
}