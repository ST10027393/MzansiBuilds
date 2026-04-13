using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using MzansiBuilds.Models;
using MzansiBuilds.Services;
using System;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class MilestoneServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext() =>
            new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

        [Fact]
        public async Task AddMilestone_ByNonOwner_ThrowsUnauthorized()
        {
            var context = GetInMemoryDbContext();
            var service = new MilestoneService(context);

            // Arrange: project owned by "owner", request from "stranger"
            context.Projects.Add(new Project { Id = 1, OwnerId = "owner", Title = "P", ShortDescription = "D", CurrentState = "Draft", Readme = "", RepoLink = "" });
            await context.SaveChangesAsync();

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.AddMilestoneAsync(1, "stranger", "Milestone 1", "Description"));
        }

        [Fact]
        public async Task AddMilestone_ByOwner_AssignsCorrectOrderIndex()
        {
            var context = GetInMemoryDbContext();
            var service = new MilestoneService(context);

            context.Users.Add(new User { Id = "owner", Username = "Owner", Email = "o@t.com" });
            context.Projects.Add(new Project { Id = 1, OwnerId = "owner", Title = "P", ShortDescription = "D", CurrentState = "Draft", Readme = "", RepoLink = "" });
            await context.SaveChangesAsync();

            var first = await service.AddMilestoneAsync(1, "owner", "Step 1", "");
            var second = await service.AddMilestoneAsync(1, "owner", "Step 2", "");

            Assert.Equal(0, first.OrderIndex);
            Assert.Equal(1, second.OrderIndex);
        }
    }
}