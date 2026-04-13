using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Locks it down to logged-in users only
    public class CollaborationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        // Dependency Injection pulls in both Database and Redis Notification Service
        public CollaborationController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [HttpPost("{projectId}/request")]
        public async Task<IActionResult> RequestToJoin(int projectId, [FromBody] CollabRequestDto requestDto)
        {
            // 1. Identify User A (The Requester) from their secure token
            var requesterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(requesterId)) return Unauthorized("Invalid token.");

            // 2. Find the Project and identify User B (The Owner)
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null) return NotFound("Project not found.");

            // Rule check: You can't collaborate with yourself
            if (project.OwnerId == requesterId) 
                return BadRequest("You cannot request to join your own project.");

            // Rule check: Prevent spamming requests
            var existingRequest = await _context.CollaborationRequests
                .FirstOrDefaultAsync(cr => cr.ProjectId == projectId && cr.RequesterId == requesterId);
            if (existingRequest != null) 
                return BadRequest("You have already requested to join this project.");

            // 3. Save the actual request to the SQL Database
            var collabRequest = new CollaborationRequest
            {
                ProjectId = projectId,
                RequesterId = requesterId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            
            _context.CollaborationRequests.Add(collabRequest);
            await _context.SaveChangesAsync();

            // 4. TRIGGER THE OBSERVER (Redis Notification)
            var message = $"Someone wants to collaborate on your project '{project.Title}'!";
            if (!string.IsNullOrEmpty(requestDto.PitchMessage))
            {
                message += $" They said: '{requestDto.PitchMessage}'";
            }

            // Send this to the OWNER's ID, not the requester!
            await _notificationService.SendNotificationAsync(
                userId: project.OwnerId, 
                type: "CollaborationRequest",
                content: message,
                relatedEntityId: projectId
            );

            return Ok(new { Message = "Collaboration request sent!", RequestId = collabRequest.Id });
        }

    }

    // A quick DTO so the requester can attach a message like "I know React, let me help!"
    public class CollabRequestDto
    {
        public string PitchMessage { get; set; } = string.Empty;
    }
}