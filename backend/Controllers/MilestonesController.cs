using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MzansiBuilds.Interfaces;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/[controller]")]
    [Authorize]
    public class MilestonesController : ControllerBase
    {
        private readonly IMilestoneService _milestoneService;

        public MilestonesController(IMilestoneService milestoneService)
        {
            _milestoneService = milestoneService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMilestones(int projectId)
        {
            var milestones = await _milestoneService.GetMilestonesAsync(projectId);
            return Ok(milestones);
        }

        [HttpPost]
        public async Task<IActionResult> AddMilestone(int projectId, [FromBody] MilestoneDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            try
            {
                var milestone = await _milestoneService.AddMilestoneAsync(projectId, userId, dto.Title, dto.Description);
                return Ok(milestone);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPatch("{milestoneId}/complete")]
        public async Task<IActionResult> MarkComplete(int projectId, int milestoneId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            try
            {
                var milestone = await _milestoneService.MarkCompleteAsync(milestoneId, userId);
                return Ok(milestone);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPatch("{milestoneId}/reorder")]
        public async Task<IActionResult> Reorder(int projectId, int milestoneId, [FromBody] ReorderDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            try
            {
                await _milestoneService.ReorderAsync(milestoneId, userId, dto.NewIndex);
                return Ok(new { Message = "Milestone reordered." });
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpDelete("{milestoneId}")]
        public async Task<IActionResult> Delete(int projectId, int milestoneId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Invalid token.");

            try
            {
                await _milestoneService.DeleteMilestoneAsync(milestoneId, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
    }

    public class MilestoneDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ReorderDto
    {
        public int NewIndex { get; set; }
    }
}