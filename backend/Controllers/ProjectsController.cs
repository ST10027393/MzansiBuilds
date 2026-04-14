using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MzansiBuilds.Interfaces;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Locks down ALL endpoints in this controller
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        // The Service is injected here. The Controller has no idea how the DB works!
        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpPost("draft")]
        public async Task<IActionResult> CreateDraft([FromBody] CreateProjectDto request)
        {
            // Extract the secure Firebase UID from the JWT Token!
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Null Safety Check!
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Invalid token: User ID is missing.");
            
            var project = await _projectService.CreateDraftAsync(userId, request.Title, request.Description);
            return Ok(project);
        }

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
    }

    // A quick DTO (Data Transfer Object) for the incoming request
    public class CreateProjectDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // FIX: Add this so C# captures the GitHub URL from React!
        public string RepoLink { get; set; } = string.Empty; 
    }
}