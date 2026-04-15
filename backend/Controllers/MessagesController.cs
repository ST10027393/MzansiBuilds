// FILE: backend/Controllers/MessagesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MzansiBuilds.Interfaces;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpPost("{receiverId}")]
        public async Task<IActionResult> SendMessage(string receiverId, [FromBody] SendMessageDto dto)
        {
            var senderId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId)) return Unauthorized("Invalid token.");

            try
            {
                var message = await _messageService.SendMessageAsync(senderId, receiverId, dto.Content);
                return Ok(message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{otherUserId}")]
        public async Task<IActionResult> GetConversation(string otherUserId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            var messages = await _messageService.GetConversationAsync(userId, otherUserId);
            return Ok(messages);
        }

        [HttpGet("previews")]
        public async Task<IActionResult> GetChatPreviews()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            var previews = await _messageService.GetChatPreviewsAsync(userId);
            return Ok(previews);
        }

        [HttpPatch("{otherUserId}/read")]
        public async Task<IActionResult> MarkAsRead(string otherUserId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            await _messageService.MarkAsReadAsync(userId, otherUserId);
            return NoContent();
        }
    }

    public class SendMessageDto
    {
        public string Content { get; set; } = string.Empty;
    }
}