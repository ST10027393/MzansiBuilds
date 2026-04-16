// FILE: backend/Services/ProjectService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed; // ADDED for Redis
using System.Text.Json; // ADDED for JSON Serialization
using System.Text.Json.Serialization; // ADDED to prevent object cycles
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using MzansiBuilds.Services.States;

namespace MzansiBuilds.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDistributedCache _cache; // ADDED

        // ADDED IDistributedCache to the constructor for Dependency Injection
        public ProjectService(ApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
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
                CurrentState = "Draft", 
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

            IProjectState stateHandler = project.CurrentState switch
            {
                "Draft" => new DraftState(),
                "Published" => new PublishedState(),
                "Completed" => new CompletedState(),
                _ => throw new Exception("Unknown State")
            };

            stateHandler.Publish(project);

            await _context.SaveChangesAsync();
            return project;
        }

        // FIXED: Re-architected for the Service Layer (No Ok() responses, Returns IEnumerable<Project>)
        public async Task<IEnumerable<Project>> GetLiveFeedAsync()
        {
            string cacheKey = "live_feed_projects";
            var cachedFeed = await _cache.GetStringAsync(cacheKey);

            // Configure JSON to ignore Entity Framework circular relationships (User -> Project -> User)
            var jsonOptions = new JsonSerializerOptions { ReferenceHandler = ReferenceHandler.IgnoreCycles };

            if (!string.IsNullOrEmpty(cachedFeed))
            {
                //INSTANT LOAD: Return the Redis cache directly
                return JsonSerializer.Deserialize<IEnumerable<Project>>(cachedFeed, jsonOptions) ?? new List<Project>();
            }

            // SLOW LOAD: If Redis is empty, query Aiven MySQL
            var projects = await _context.Projects
                .Include(p => p.Owner)
                .Where(p => p.Status == "Published" || p.Status == "Completed")
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // Save to Upstash Redis for 60 seconds
            var cacheOptions = new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60) };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(projects, jsonOptions), cacheOptions);

            return projects;
        }

        public async Task<Project> CompleteProjectAsync(int projectId, string userId)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);
            
            if (project == null)
                throw new Exception("Project not found or you are not the owner.");

            IProjectState stateHandler = project.CurrentState switch
            {
                "Draft" => new DraftState(),
                "Published" => new PublishedState(),
                "Completed" => new CompletedState(),
                _ => throw new Exception("Unknown State")
            };

            stateHandler.Complete(project);

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<IEnumerable<Project>> GetCelebrationWallAsync()
        {
            return await _context.Projects
                .Where(p => p.CurrentState == "Completed")
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Project>> GetMyProjectsAsync(string userId)
        {
            return await _context.Projects
                .Include(p => p.Collaborators) 
                .Include(p => p.Owner)
                .Where(p => p.OwnerId == userId || p.Collaborators.Any(c => c.UserId == userId))
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Project> GetProjectByIdAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.Milestones)
                .Include(p => p.Collaborators)
                    .ThenInclude(c => c.User) 
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project> UpdateProjectAsync(int id, string title, string description, string readme)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) throw new Exception("Project not found");

            project.Title = title;
            project.Description = description;
            project.Readme = readme;
            project.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<object> AddCommentAsync(int projectId, string userId, string text)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) throw new Exception("User not found");

            var comment = new Comment 
            {
                ProjectId = projectId,
                UserId = userId,
                Text = text,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return new { 
                id = comment.Id.ToString(), 
                username = user.Username, 
                text = comment.Text 
            };
        }

        public async Task DeleteMilestoneAsync(int projectId, int milestoneId)
        {
            var milestone = await _context.Milestones
                .FirstOrDefaultAsync(m => m.Id == milestoneId && m.ProjectId == projectId);
                
            if (milestone != null)
            {
                _context.Milestones.Remove(milestone);
                await _context.SaveChangesAsync();
            }
        }
    }
}