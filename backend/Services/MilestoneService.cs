// FILE: backend/Services/MilestoneService.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services
{
    public class MilestoneService : IMilestoneService
    {
        private readonly ApplicationDbContext _context;

        public MilestoneService(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<bool> IsAuthorizedAsync(int projectId, string userId)
        {
            var isOwner = await _context.Projects.AnyAsync(p => p.Id == projectId && p.OwnerId == userId);
            if (isOwner) return true;

            // Also allow approved collaborators to modify milestones
            return await _context.Collaborators.AnyAsync(c => c.ProjectId == projectId && c.UserId == userId);
        }

        public async Task<Milestone> AddMilestoneAsync(int projectId, string userId, string title, string description)
        {
            if (!await IsAuthorizedAsync(projectId, userId))
                throw new UnauthorizedAccessException("Only the project owner or collaborators can add milestones.");

            // Auto-assign the next order index
            var maxIndex = await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .MaxAsync(m => (int?)m.OrderIndex) ?? -1;

            var milestone = new Milestone
            {
                ProjectId = projectId,
                Title = title,
                Description = description,
                OrderIndex = maxIndex + 1,
                IsCompleted = false
            };

            _context.Milestones.Add(milestone);
            await _context.SaveChangesAsync();
            return milestone;
        }

        public async Task<Milestone> MarkCompleteAsync(int milestoneId, string userId)
        {
            var milestone = await _context.Milestones
                .Include(m => m.Project)
                .FirstOrDefaultAsync(m => m.Id == milestoneId)
                ?? throw new Exception("Milestone not found.");

            if (!await IsAuthorizedAsync(milestone.ProjectId, userId))
                throw new UnauthorizedAccessException("You do not have permission to modify this milestone.");

            milestone.IsCompleted = true;
            await _context.SaveChangesAsync();
            return milestone;
        }

        public async Task ReorderAsync(int milestoneId, string userId, int newIndex)
        {
            var milestone = await _context.Milestones.FindAsync(milestoneId)
                ?? throw new Exception("Milestone not found.");

            if (!await IsAuthorizedAsync(milestone.ProjectId, userId))
                throw new UnauthorizedAccessException("You do not have permission to reorder this milestone.");

            milestone.OrderIndex = newIndex;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteMilestoneAsync(int milestoneId, string userId)
        {
            var milestone = await _context.Milestones.FindAsync(milestoneId)
                ?? throw new Exception("Milestone not found.");

            if (!await IsAuthorizedAsync(milestone.ProjectId, userId))
                throw new UnauthorizedAccessException("You do not have permission to delete this milestone.");

            _context.Milestones.Remove(milestone);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Milestone>> GetMilestonesAsync(int projectId)
        {
            return await _context.Milestones
                .Where(m => m.ProjectId == projectId)
                .OrderBy(m => m.OrderIndex)
                .ToListAsync();
        }
    }
}