using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using MzansiBuilds.Services.States;

namespace MzansiBuilds.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Project> CreateDraftAsync(string userId, string title, string description)
        {
            var project = new Project
            {
                OwnerId = userId,
                Title = title,
                ShortDescription = description,
                CurrentState = "Draft" // Defaults to Draft!
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<Project> PublishProjectAsync(int projectId, string userId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);
            
            if (project == null)
                throw new Exception("Project not found or you are not the owner.");

            // 1. Determine the current state object based on the database string
            IProjectState stateHandler = project.CurrentState switch
            {
                "Draft" => new DraftState(),
                "Published" => new PublishedState(),
                "Completed" => new CompletedState(),
                _ => throw new Exception("Unknown State")
            };

            // 2. Attempt to publish (This will throw an error if it's already Completed)
            stateHandler.Publish(project);

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<IEnumerable<Project>> GetLiveFeedAsync()
        {
            // Only return Published projects for the Live Feed!
            return await _context.Projects
                .Where(p => p.CurrentState == "Published")
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Project> CompleteProjectAsync(int projectId, string userId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);
            
            if (project == null)
                throw new Exception("Project not found or you are not the owner.");

            // 1. Determine the current state
            IProjectState stateHandler = project.CurrentState switch
            {
                "Draft" => new DraftState(),
                "Published" => new PublishedState(),
                "Completed" => new CompletedState(),
                _ => throw new Exception("Unknown State")
            };

            // 2. Attempt to complete (This executes the logic you saw in PublishedState.cs!)
            stateHandler.Complete(project);

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<IEnumerable<Project>> GetCelebrationWallAsync()
        {
            // Only return Completed projects for the Celebration Wall
            return await _context.Projects
                .Where(p => p.CurrentState == "Completed")
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetMyProjectsAsync(string userId)
        {
            // Go into the SQLite database, find all projects where the OwnerId matches the logged-in user,
            // and order them from newest to oldest.
            return await _context.Projects
                .Where(p => p.OwnerId == userId) 
                .OrderByDescending(p => p.CreatedAt) 
                .ToListAsync();
        }
    }
}