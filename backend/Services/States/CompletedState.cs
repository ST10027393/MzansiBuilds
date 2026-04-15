// FILE: backend/Services/States/CompletedState.cs
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services.States
{
    public class CompletedState : IProjectState
    {
        public void Publish(Project context)
        {
            throw new InvalidOperationException("Completed projects cannot be republished.");
        }

        public void Complete(Project context)
        {
            throw new InvalidOperationException("Project is already completed.");
        }

        public void Edit(Project context)
        {
            throw new InvalidOperationException("Completed projects are locked and cannot be edited.");
        }
    }
}