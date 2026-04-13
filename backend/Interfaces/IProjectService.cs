using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IProjectService
    {
        Task<Project> CreateDraftAsync(string userId, string title, string description);
        Task<Project> PublishProjectAsync(int projectId, string userId);
        Task<IEnumerable<Project>> GetLiveFeedAsync();

        //Celeberation Wall Methods
        Task<Project> CompleteProjectAsync(int projectId, string userId);
        Task<IEnumerable<Project>> GetCelebrationWallAsync();
    }
}