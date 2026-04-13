using Microsoft.EntityFrameworkCore;
using Moq;
using MzansiBuilds.Data;
using MzansiBuilds.Services;
using StackExchange.Redis;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class NotificationServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task SendNotificationAsync_SavesToSql_AndPushesToRedis()
        {
            // Arrange: 1. Setup SQL
            var context = GetInMemoryDbContext();

            // Arrange: 2. Setup the "Fake" Redis Connection using Moq
            var mockMultiplexer = new Mock<IConnectionMultiplexer>();
            var mockDatabase = new Mock<IDatabase>();
            
            // Tell the fake multiplexer to return the fake database when asked
            mockMultiplexer.Setup(m => m.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(mockDatabase.Object);

            // Arrange: 3. Initialize the Service
            var service = new NotificationService(context, mockMultiplexer.Object);

            var targetUserId = "test-user-999";
            var type = "CollaborationRequest";
            var content = "Keegan has requested to join your project!";

            // Act
            await service.SendNotificationAsync(targetUserId, type, content);

            // Assert: 1. Verify Persistent Layer (SQL)
            var savedNotification = await context.Notifications.FirstOrDefaultAsync(n => n.UserId == targetUserId);
            Assert.NotNull(savedNotification);
            Assert.Equal(content, savedNotification.Content);

            // Assert: 2. Verify Real-Time Layer (Redis)
            // Moq: "Did the service attempt to push data to the exact Redis key exactly once?"
            mockDatabase.Verify(db => db.ListLeftPushAsync(
                $"notifications:{targetUserId}", 
                It.IsAny<RedisValue>(), 
                When.Always, 
                CommandFlags.None), 
            Times.Once);

            // Moq: "Did the service attempt to trim the list to 20 items exactly once?"
            mockDatabase.Verify(db => db.ListTrimAsync(
                $"notifications:{targetUserId}", 
                0, 
                19, 
                CommandFlags.None), 
            Times.Once);
        }
    }
}