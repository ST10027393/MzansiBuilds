// FILE: backend/Controllers/TestAuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MzansiBuilds.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestAuthController : ControllerBase
    {
        [HttpGet("protected")]
        [Authorize] // This endpoint is protected by JWT authentication, requiring the Firebase JWT
        public IActionResult GetSecretData()
        {
            return Ok("You have VIP access!");
        }
    }
}