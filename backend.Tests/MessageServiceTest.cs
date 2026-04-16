// FILE: backend.Tests/MessageServiceTest.cs
using Microsoft.EntityFrameworkCore;
using Moq;
using MzansiBuilds.Data;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class MessageServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext() =>
            new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

        [Fact]
        public async Task SendMessageAsync_ValidMessage_SavesAndNotifies()
        {
            // Arrange: Setup SQL and Mock Redis Notifier
            var context = GetInMemoryDbContext();
            var mockNotifier = new Mock<INotificationService>();
            var service = new MessageService(context, mockNotifier.Object);

            var senderId = "userA";
            var receiverId = "userB";
            var content = "Hello there!";

            // Act
            var message = await service.SendMessageAsync(senderId, receiverId, content);

            // Assert 1: Saved to persistent storage
            var savedMessage = await context.Messages.FindAsync(message.Id);
            Assert.NotNull(savedMessage);
            Assert.Equal(content, savedMessage.Content);
            Assert.False(savedMessage.IsRead);

            // Assert 2: Observer pattern fired the notification to Redis exactly once
            mockNotifier.Verify(n => n.SendNotificationAsync(
                receiverId, 
                "Message", 
                "You have a new message!", 
                message.Id.ToString()), 
            Times.Once);
        }

        [Fact]
        public async Task SendMessageAsync_EmptyContent_ThrowsException()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var mockNotifier = new Mock<INotificationService>();
            var service = new MessageService(context, mockNotifier.Object);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.SendMessageAsync("userA", "userB", "   ")); // Whitespace should be rejected

            Assert.Equal("Message content cannot be empty.", exception.Message);
        }
    }
}