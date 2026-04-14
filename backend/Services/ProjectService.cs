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

        public async Task<Project> CreateDraftAsync(string userId, string title, string description, string repoLink)
        {
            var project = new Project
            {
                OwnerId = userId,  
                AuthorId = userId, 
                Title = title,
                Description = description,
                RepoLink = repoLink,
                Status = "Draft",
                CurrentState = "Draft", // Keep this matched with your model
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
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
            // The "Where" clause is the secret sauce here
            return await _context.Projects
                .Include(p => p.Milestones) // Optional: If you want to show milestones on the feed cards later!
                .Where(p => p.Status == "Published" || p.Status == "Completed") 
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

        public async Task<Project> GetProjectByIdAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.Milestones) // Make sure to include related data!
                .FirstOrDefaultAsync(p => p.Id == id); // Use int.Parse(id) if your IDs are integers
        }

        public async Task<Project> UpdateProjectAsync(int id, string title, string description, string readme)
        {
            // 1. Find the project
            var project = await _context.Projects.FindAsync(id);
            if (project == null) throw new Exception("Project not found");

            // 2. Update the fields
            project.Title = title;
            project.Description = description;
            project.Readme = readme;
            project.UpdatedAt = DateTime.UtcNow;

            // 3. Save to Aiven
            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<object> AddCommentAsync(int projectId, string userId, string text)
        {
            // 1. Get the user so we know their Username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new Exception("User not found");

            // 2. Create the comment
            var comment = new Comment 
            {
                ProjectId = projectId,
                UserId = userId,
                Text = text,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // 3. Return the exact JSON shape your React frontend is expecting!
            return new { 
                id = comment.Id.ToString(), 
                username = user.Username, 
                text = comment.Text 
            };
        }

        public async Task DeleteMilestoneAsync(int projectId, int milestoneId)
        {
            // 1. Find the milestone, ensuring it actually belongs to this project
            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == projectId);
                
            if (milestone != null)
            {
                // 2. Delete it
                _context.Milestones.Remove(milestone);
                await _context.SaveChangesAsync();
            }
        }
    }
}