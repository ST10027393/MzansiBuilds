using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MzansiBuilds.Interfaces;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IFriendshipService _friendshipService;

        public FriendshipController(IFriendshipService friendshipService)
        {
            _friendshipService = friendshipService;
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

        [HttpPatch("{requestId}/respond")]
        public async Task<IActionResult> RespondToRequest(int requestId, [FromBody] RespondToRequestDto dto)
        {
            var addresseeId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(addresseeId)) return Unauthorized("Invalid token.");

            try
            {
                await _friendshipService.RespondToRequestAsync(requestId, addresseeId, dto.Accept);
                return Ok(new { Message = dto.Accept ? "Friend request accepted." : "Friend request declined." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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