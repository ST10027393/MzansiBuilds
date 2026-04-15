// FILE: backend/Services/States/PublishedState.cs
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services.States
{
    public class PublishedState : IProjectState
    {
        public void Publish(Project context)
        {
            throw new InvalidOperationException("Project is already published.");
        }

        public void Complete(Project context)
        {
            context.CurrentState = "Completed";
            context.UpdatedAt = DateTime.UtcNow;
            // This is where it gets added to the Celebration Wall!
        }

        public void Edit(Project context)
        {
            context.UpdatedAt = DateTime.UtcNow; // Published projects can still be edited
        }
    }
}