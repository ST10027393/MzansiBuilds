using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using MzansiBuilds.Data;
using Microsoft.EntityFrameworkCore;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ApplicationDbContext _context; 

        // DELETE THE OLD CONSTRUCTOR IF IT IS STILL HERE!
        // (The one that only takes IProjectService)

        // KEEP ONLY THIS ONE:
        public ProjectsController(IProjectService projectService, ApplicationDbContext context)
        {
            _projectService = projectService;
            _context = context; 
        }

        [HttpPost("draft")]
        public async Task<IActionResult> CreateDraft([FromBody] CreateProjectDto request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token: User ID is missing.");
            
            try 
            {
                // FIX: Make sure request.RepoLink is being passed here!
                var project = await _projectService.CreateDraftAsync(userId, request.Title, request.Description, request.RepoLink);
                return Ok(project);
            }
            catch (Exception ex)
            {
                // This will catch backend crashes and send the actual error message to your browser console instead of a generic 500!
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /*
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> PublishProject(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Null Safety Check!
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token: User ID is missing.");
            
            try
            {
                var project = await _projectService.PublishProjectAsync(id, userId);
                return Ok(project);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // E.g., "Completed projects cannot be republished."
            }
        }
        */

        // 1. Publish Project
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> PublishProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound("Project not found.");
            
            project.Status = "Published";
            project.CurrentState = "Published"; // Updating both just in case your model uses both!
            await _context.SaveChangesAsync();
            
            return Ok(project);
        }

        /*
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteProject(int id)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");
            
            try
            {
                var project = await _projectService.CompleteProjectAsync(id, userId);
                return Ok(project);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); 
            }
        }
        */

        // 2. Complete Project
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound("Project not found.");
            
            project.Status = "Completed";
            project.CurrentState = "Completed";
            await _context.SaveChangesAsync();
            
            return Ok(project);
        }

        [HttpGet("celebrations")]
        public async Task<IActionResult> GetCelebrationWall()
        {
            var wall = await _projectService.GetCelebrationWallAsync();
            return Ok(wall);
        }

        [HttpGet("feed")]
        public async Task<IActionResult> GetLiveFeed()
        {
            var feed = await _projectService.GetLiveFeedAsync();
            return Ok(feed);
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyProjects()
        {
            // Get the secure Firebase UID of the user making the request
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token: User ID is missing.");

            try
            {
                // Fetch projects tied to this specific user
                // (Ensure your IProjectService has a method named something like GetMyProjectsAsync)
                var projects = await _projectService.GetMyProjectsAsync(userId);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(int id) 
        {
            try
            {
                var project = await _projectService.GetProjectByIdAsync(id);
                if (project == null) return NotFound("Project not found.");
                return Ok(project);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /*
        [HttpGet("{id}/comments")]
        public IActionResult GetComments(int id)
        {
            // We will return an empty list for now to stop the 404 error.
            // Future step: Wire this up to _projectService.GetCommentsAsync(id)
            return Ok(new List<object>()); 
        }
        */

        // 1. Endpoint to Save Project Edits
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto request)
        {
            // You will need to add UpdateProjectAsync to your IProjectService/ProjectService!
            var updatedProject = await _projectService.UpdateProjectAsync(id, request.Title, request.Description, request.Readme);
            return Ok(updatedProject);
        }

        /*
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            // FIX: Add this null check to satisfy the CS8604 warning!
            if (string.IsNullOrEmpty(userId)) return Unauthorized("User not logged in.");

            var comment = await _projectService.AddCommentAsync(id, userId, request.Text);
            return Ok(comment);
        }
        */

        // 1. Actually FETCH the comments from Aiven
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(int id)
        {
            var comments = await _context.Comments
                .Where(c => c.ProjectId == id)
                .ToListAsync();

            var result = new List<object>();
            foreach(var c in comments)
            {
                // Fetch the username so React can display who posted it
                var user = await _context.Users.FindAsync(c.UserId);
                result.Add(new { 
                    id = c.Id.ToString(), 
                    username = user?.Username ?? "Unknown Developer", 
                    text = c.Text 
                });
            }
            return Ok(result);
        }

        // 2. Save the comment directly using _context
        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] CommentDto request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return BadRequest("User not found.");

            var comment = new Comment 
            { 
                ProjectId = id, 
                UserId = userId, 
                Text = request.Text, 
                CreatedAt = DateTime.UtcNow 
            };
            
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { id = comment.Id.ToString(), username = user.Username, text = comment.Text });
        }

        // Add a new Milestone
        [HttpPost("{id}/milestones")]
        public async Task<IActionResult> AddMilestone(int id, [FromBody] CreateMilestoneDto request)
        {
            // Verify the project exists
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound("Project not found.");

            // Create the new milestone
            var milestone = new Milestone
            {
                ProjectId = id,
                Title = request.Title,
                IsCompleted = request.IsCompleted,
                OrderIndex = request.OrderIndex
            };

            _context.Milestones.Add(milestone);
            await _context.SaveChangesAsync();

            // Return the newly created milestone so React can display it instantly
            return Ok(milestone);
        }

        // 3. Bulletproof Milestone Deletion
        [HttpDelete("{id}/milestones/{milestoneId}")]
        public async Task<IActionResult> DeleteMilestone(int id, int milestoneId)
        {
            // Find the milestone and ensure it belongs to this exact project
            var milestone = await _context.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == id);
            
            if (milestone != null)
            {
                _context.Milestones.Remove(milestone);
                await _context.SaveChangesAsync();
            }
            
            return Ok();
        }

        

        // 3. Delete Project
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            
            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            
            return Ok("Project deleted.");
        }

        // 4. Toggle Milestone Checkbox
        [HttpPut("{id}/milestones/{milestoneId}")]
        public async Task<IActionResult> ToggleMilestone(int id, int milestoneId, [FromBody] UpdateMilestoneDto request)
        {
            var milestone = await _context.Milestones.FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == id);
            if (milestone == null) return NotFound();
            
            milestone.IsCompleted = request.IsCompleted;
            await _context.SaveChangesAsync();
            
            return Ok(milestone);
        }

        // 5. Reorder Milestones
        [HttpPut("{id}/milestones/reorder")]
        public async Task<IActionResult> ReorderMilestones(int id, [FromBody] List<Milestone> milestones)
        {
            foreach(var m in milestones) 
            {
                var dbMilestone = await _context.Milestones.FindAsync(m.Id);
                if(dbMilestone != null && dbMilestone.ProjectId == id) 
                {
                    dbMilestone.OrderIndex = m.OrderIndex; // Assuming your model has an OrderIndex!
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    // A quick DTO (Data Transfer Object) for the incoming request
    public class CreateProjectDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // FIX: C# captures the GitHub URL from React!
        public string RepoLink { get; set; } = string.Empty; 
    }

    // Used to catch the Title, Description, and Readme when an Owner clicks "Save Changes"
    public class UpdateProjectDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Readme { get; set; } = string.Empty;
    }

    // Used to catch the text when a user posts a comment
    public class CommentDto
    {
        public string Text { get; set; } = string.Empty;
    }

    public class UpdateMilestoneDto
    {
        public bool IsCompleted { get; set; }
    }

    public class CreateMilestoneDto
    {
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int OrderIndex { get; set; }
    }
}