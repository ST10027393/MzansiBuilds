using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;

namespace backend.Tests
{
    public class AuthenticationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public AuthenticationTests(WebApplicationFactory<Program> factory)
        {
            // This spins up your entire Program.cs API in memory for testing
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
        {
            // Act: Try to hit the endpoint WITHOUT attaching a Firebase JWT
            var response = await _client.GetAsync("/api/TestAuth/protected");

            // Assert: Prove that the application rejected the request with a 401 Unauthorized
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}