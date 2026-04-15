// FILE: backend/Services/UserService.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;

namespace MzansiBuilds.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User> SyncUserFromFirebaseAsync(string firebaseUid, string email, string username, string name, string surname)
        {
            var existing = await _context.Users.FindAsync(firebaseUid);
            if (existing != null) return existing;

            var user = new User
            {
                Id = firebaseUid,
                Email = email,
                Username = username,
                Name = name,
                Surname = surname,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<User> UpdateProfileAsync(string userId, string username, string bio, string name, string surname)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new Exception("User not found.");

            user.Username = username;
            user.Bio = bio;
            user.Name = name;
            user.Surname = surname;

            await _context.SaveChangesAsync();
            return user;
        }

        public async Task DeleteUserAsync(string userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new Exception("User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}