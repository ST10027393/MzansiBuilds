// FILE: backend/Interfaces/IMilestoneService.cs
using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IMilestoneService
    {
        Task<Milestone> AddMilestoneAsync(int projectId, string userId, string title, string description);
        Task<Milestone> MarkCompleteAsync(int milestoneId, string userId);
        Task ReorderAsync(int milestoneId, string userId, int newIndex);
        Task DeleteMilestoneAsync(int milestoneId, string userId);
        Task<IEnumerable<Milestone>> GetMilestonesAsync(int projectId);
    }
}