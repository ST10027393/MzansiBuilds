using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using StackExchange.Redis;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace backend.Tests
{
    public class AuthenticationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AuthenticationTests(WebApplicationFactory<Program> factory)
        {
            // Intercept the startup process to inject a fake Redis connection - prevents the DI container from crashing in the CI/CD pipeline!
            _client = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    var mockRedis = new Mock<IConnectionMultiplexer>();
                    services.AddSingleton<IConnectionMultiplexer>(mockRedis.Object);
                });
            }).CreateClient();
        }

        [Fact]
        public async Task GetProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/TestAuth/protected");

            // Assert
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}