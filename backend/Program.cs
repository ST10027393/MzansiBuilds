using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
var firebaseKeyPath = builder.Configuration["Firebase:AdminKeyPath"];

if (!string.IsNullOrEmpty(firebaseKeyPath))
{
    // Local environment: The secret exists, so initialize Firebase Admin securely.
    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.FromFile(firebaseKeyPath)
    });
}
else
{
    // CI/CD environment: No secret exists. Log a warning and skip initialization completely.
    // (JWT validation will still work because it relies on the Audience/Issuer URLs below!)
    Console.WriteLine("WARNING: Firebase Admin Key Path is missing. Skipping Admin SDK initialization.");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure the MySQL Database Connection
var connectionString = builder.Configuration.GetConnectionString("MySQL");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure JWT Authentication
var firebaseProjectId = "mzansibuilds-3127e"; 

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication(); //JWT AUTHENTICATION
app.UseAuthorization();
app.MapControllers();

app.Run();

//Tests
public partial class Program { }