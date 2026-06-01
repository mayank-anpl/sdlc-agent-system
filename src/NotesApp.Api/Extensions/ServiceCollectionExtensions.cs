using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NotesApp.Api.Data;

namespace NotesApp.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public const string AngularDevCorsPolicy = "AngularDev";

    public static IServiceCollection AddNotesAppPersistence(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddDbContext<NotesDbContext>(options =>
            options.UseSqlite(connectionString));

        return services;
    }

    public static IServiceCollection AddNotesAppIdentity(
        this IServiceCollection services,
        IHostEnvironment environment)
    {
        services
            .AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedEmail = false;

                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<NotesDbContext>()
            .AddDefaultTokenProviders();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "NotesApp.Auth";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            // Angular dev (http://localhost:4200) → API (https://localhost:7014) is cross-site;
            // None + Secure is required for credentialed XHR. Production may use Lax if same-site.
            options.Cookie.SameSite = environment.IsDevelopment()
                ? SameSiteMode.None
                : SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromDays(30);
            options.SlidingExpiration = true;

            // API returns 401 instead of redirecting to a login page.
            options.Events.OnRedirectToLogin = context =>
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        return services;
    }

    public static IServiceCollection AddNotesAppCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:4200"];

        services.AddCors(options =>
        {
            options.AddPolicy(AngularDevCorsPolicy, policy =>
            {
                policy
                    .WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
