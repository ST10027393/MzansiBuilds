using MzansiBuilds.Models;

namespace MzansiBuilds.Interfaces
{
    public interface IUserService
    {
        Task<User> SyncUserFromFirebaseAsync(string firebaseUid, string email, string username, string name, string surname);
        Task<User?> GetUserByIdAsync(string userId);
        Task<User> UpdateProfileAsync(string userId, string username, string bio, string name, string surname);
        Task DeleteUserAsync(string userId);
    }
}