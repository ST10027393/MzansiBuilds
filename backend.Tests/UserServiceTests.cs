using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Models;
using MzansiBuilds.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class UserServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext() =>
            new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

        [Fact]
        public async Task SyncUserFromFirebaseAsync_NewUser_AddsToDatabase()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var service = new UserService(context);
            var newUid = "firebase-uid-999";

            // Act
            var result = await service.SyncUserFromFirebaseAsync(newUid, "test@test.com", "TestDev", "John", "Doe");

            // Assert
            var savedUser = await context.Users.FindAsync(newUid);
            Assert.NotNull(savedUser);
            Assert.Equal("John", savedUser.Name);
            Assert.Equal("Doe", savedUser.Surname);
        }

        [Fact]
        public async Task UpdateProfileAsync_ExistingUser_UpdatesFields()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var service = new UserService(context);
            var userId = "user-123";

            context.Users.Add(new User { Id = userId, Username = "OldName", Email = "a@a.com" });
            await context.SaveChangesAsync();

            // Act
            var updatedUser = await service.UpdateProfileAsync(userId, "NewName", "New Bio", "Jane", "Smith");

            // Assert
            Assert.Equal("NewName", updatedUser.Username);
            Assert.Equal("New Bio", updatedUser.Bio);
            Assert.Equal("Jane", updatedUser.Name);
        }

        [Fact]
        public async Task GetUserByIdAsync_NonExistent_ReturnsNull()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var service = new UserService(context);

            // Act
            var result = await service.GetUserByIdAsync("does-not-exist");

            // Assert
            Assert.Null(result);
        }
    }
}