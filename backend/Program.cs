// FILE: backend/Program.cs
using Microsoft.EntityFrameworkCore;
using MzansiBuilds.Data;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MzansiBuilds.Interfaces;
using MzansiBuilds.Services;
using StackExchange.Redis;
using MzansiBuilds.Hubs;

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

// Configure Upstash Redis Connection
var redisConnectionString = builder.Configuration["Upstash:RedisConnection"];
if (string.IsNullOrEmpty(redisConnectionString))
{
    Console.WriteLine("WARNING: Redis connection string is missing.");
}
else
{
    // Register Redis as a Singleton (Only one connection needed for the whole app)
    builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));
}

// Add services to the container.
// Tells the JSON serializer to stop when it detects an infinite loop!
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// CORS policy!
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite's default port
              .AllowAnyHeader()
              .AllowAnyMethod()
                .AllowCredentials();
    });
});

// Project Service - Dependency Inversion
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IUserService, UserService>();          
builder.Services.AddScoped<IFriendshipService, FriendshipService>(); 
builder.Services.AddScoped<IMessageService, MessageService>();     
builder.Services.AddScoped<IMilestoneService, MilestoneService>(); 

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure the MySQL Database Connection
var connectionString = builder.Configuration.GetConnectionString("MySQL");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.Parse("8.0.30-mysql")));

/* Local sqlite connection for testing - Uncomment if you want to use SQLite instead of MySQL
// Grab the connection string 
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Use SQLite instead of MySQL!
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
*/

// Add this before builder.Build();
builder.Services.AddStackExchangeRedisCache(options =>
{
    // Get this connection string from your Upstash console
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MzansiBuilds_";
});

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

builder.Services.AddSignalR();

if (!builder.Environment.IsDevelopment())
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls($"http://*:{port}");
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication(); //JWT AUTHENTICATION
app.UseAuthorization();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapControllers();

app.Run();

//Tests
public partial class Program { }