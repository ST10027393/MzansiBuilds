// FILE: backend/Controllers/CollaborationController.cs
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
            {
                if (existingRequest.Status == "Declined")
                {
                    // Re-activate the declined request!
                    existingRequest.Status = "Pending";
                    existingRequest.CreatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    
                    // (Trigger your notification service here again if desired)

                    return Ok(new { Message = "Collaboration request re-sent!", RequestId = existingRequest.Id });
                }
                return BadRequest("You have already requested to join this project.");
            }

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
                relatedEntityId: projectId.ToString()
            );

            return Ok(new { Message = "Collaboration request sent!", RequestId = collabRequest.Id });
        }


        // 1. Fetch all pending collab requests across ALL projects owned by the user
        [HttpGet("requests/pending")]
        public async Task<IActionResult> GetPendingCollabRequests()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var requests = await _context.CollaborationRequests
                .Include(cr => cr.Project)
                .Include(cr => cr.Requester)
                .Where(cr => cr.Project.OwnerId == userId && cr.Status == "Pending")
                .Select(cr => new {
                    id = cr.Id,
                    projectId = cr.ProjectId,
                    projectTitle = cr.Project.Title,
                    requesterId = cr.RequesterId,
                    username = cr.Requester.Username
                })
                .ToListAsync();

            return Ok(requests);
        }

        // 2. Respond to the Collab Request and Elevate User
        [HttpPatch("requests/{id}/respond")]
        public async Task<IActionResult> RespondToCollabRequest(int id, [FromBody] RespondDto request)
        {
            var collabReq = await _context.CollaborationRequests
                .Include(cr => cr.Project)
                .FirstOrDefaultAsync(cr => cr.Id == id);
                
            if (collabReq == null) return NotFound("Request not found.");

            // Security Check: Only the project owner can approve this
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (collabReq.Project.OwnerId != currentUserId) return Unauthorized();

            if (request.Accept)
            {
                collabReq.Status = "Accepted";
                
                // STEP 5 LOGIC: The Engine creates the Collaborator mapping!
                var collaborator = new Collaborator 
                { 
                    ProjectId = collabReq.ProjectId, 
                    UserId = collabReq.RequesterId 
                };
                _context.Collaborators.Add(collaborator);
            }
            else
            {
                collabReq.Status = "Declined";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = request.Accept ? "Collaborator added." : "Request declined." });
        }
    
        // 3. Fetch all collab requests sent by the current logged-in user
        [HttpGet("requests/sent")]
        public async Task<IActionResult> GetSentCollabRequests()
        {
            // Extract the Firebase UID from the token
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Query the database for requests where the current user is the requester
            var sentRequests = await _context.CollaborationRequests
                .Where(cr => cr.RequesterId == userId)
                .Select(cr => new {
                    id = cr.Id,
                    projectId = cr.ProjectId,
                    status = cr.Status, // "Pending", "Accepted", or "Declined"
                    createdAt = cr.CreatedAt
                })
                .ToListAsync();

            return Ok(sentRequests);
        }
    }

    // Quick DTO for the frontend JSON payload
    public class RespondDto
    {
        public bool Accept { get; set; }
    }

    // A quick DTO so the requester can attach a message like "I know React, let me help!"
    public class CollabRequestDto
    {
        public string PitchMessage { get; set; } = string.Empty;
    }
    
}