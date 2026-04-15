// FILE: backend.Tests/ProjectServiceTests.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Models;
using MzansiBuilds.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class ProjectServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            // Creates a fresh, isolated database in RAM for every test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task PublishProject_ValidDraft_TransitionsToPublished()
        {
            // Arrange: Set up the fake database and the service
            var context = GetInMemoryDbContext();
            var service = new ProjectService(context);
            var testUserId = "test-user-123";

            // Act: Create a draft directly using our service
            // FIX: Added the required 4th parameter for repoLink
            var draft = await service.CreateDraftAsync(testUserId, "Test App", "A cool app", "https://github.com/test");

            // Act: Try to publish the draft
            var publishedProject = await service.PublishProjectAsync(draft.Id, testUserId);

            // Assert: Prove the State Pattern worked!
            Assert.Equal("Published", publishedProject.CurrentState);
            
            // Verify it was actually saved to the database that way
            var dbProject = await context.Projects.FindAsync(draft.Id);
            Assert.Equal("Published", dbProject?.CurrentState);
        }

        [Fact]
        public async Task PublishProject_AlreadyPublished_ThrowsException()
        {
            // Arrange
            var context = GetInMemoryDbContext();
            var service = new ProjectService(context);
            var testUserId = "test-user-123";

            // FIX: Added the required 4th parameter for repoLink
            var draft = await service.CreateDraftAsync(testUserId, "Test App", "A cool app", "https://github.com/test");
            await service.PublishProjectAsync(draft.Id, testUserId); // Publish it once

            // Act & Assert: Trying to publish a second time should throw our State Exception
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => 
                service.PublishProjectAsync(draft.Id, testUserId));

            Assert.Equal("Project is already published.", exception.Message);
        }
    }
}