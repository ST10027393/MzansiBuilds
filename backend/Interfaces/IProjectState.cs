// FILE: backend/Interfaces/IProjectState.cs
using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IProjectState
    {
        void Publish(Project context);
        void Complete(Project context);
        void Edit(Project context);
    }
}