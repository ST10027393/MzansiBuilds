// FILE: backend.Tests/FriendshipServiceTests.cs
using Microsoft.EntityFrameworkCore;
using Moq;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Models;
using MzansiBuilds.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class FriendshipServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext() =>
            new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

        private INotificationService GetMockNotifications() =>
            new Mock<INotificationService>().Object;

        [Fact]
        public async Task SendFriendRequest_ToSelf_ThrowsException()
        {
            var context = GetInMemoryDbContext();
            var service = new FriendshipService(context, GetMockNotifications());

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SendFriendRequestAsync("user-1", "user-1"));
        }

        [Fact]
        public async Task SendFriendRequest_Duplicate_ThrowsException()
        {
            var context = GetInMemoryDbContext();
            var service = new FriendshipService(context, GetMockNotifications());

            context.Users.Add(new User { Id = "user-1", Username = "A", Email = "a@t.com" });
            context.Users.Add(new User { Id = "user-2", Username = "B", Email = "b@t.com" });
            await context.SaveChangesAsync();

            await service.SendFriendRequestAsync("user-1", "user-2");

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SendFriendRequestAsync("user-1", "user-2"));
        }
    }
}