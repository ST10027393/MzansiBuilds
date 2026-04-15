// FILE: backend/Services/States/DraftState.cs
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services.States
{
    public class DraftState : IProjectState
    {
        public void Publish(Project context)
        {
            context.CurrentState = "Published";
            context.UpdatedAt = DateTime.UtcNow;
            // In a real system, you might trigger the Redis Notification here!
        }

        public void Complete(Project context)
        {
            throw new InvalidOperationException("Cannot complete a project that hasn't been published yet.");
        }

        public void Edit(Project context)
        {
            context.UpdatedAt = DateTime.UtcNow; // Drafts can be edited freely
        }
    }
}