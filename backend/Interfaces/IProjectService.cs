// FILE: backend/Interfaces/IProjectService.cs
using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IProjectService
    {
        // Update the signature to accept 4 arguments
        Task<Project> CreateDraftAsync(string userId, string title, string description, string repoLink);
        Task<Project> PublishProjectAsync(int projectId, string userId);
        Task<IEnumerable<Project>> GetLiveFeedAsync();
        Task<IEnumerable<Project>> GetMyProjectsAsync(string userId);
        Task<Project> GetProjectByIdAsync(int id);

        //Celeberation Wall Methods
        Task<Project> CompleteProjectAsync(int projectId, string userId);
        Task<IEnumerable<Project>> GetCelebrationWallAsync();

        Task<Project> UpdateProjectAsync(int id, string title, string description, string readme);
        
        // Returning an 'object' here lets us easily shape the data exactly how React expects it { id, username, text }
        Task<object> AddCommentAsync(int projectId, string userId, string text); 
        
        Task DeleteMilestoneAsync(int projectId, int milestoneId);
    }
}