using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NotesApp.Api.Contracts.Auth;
using NotesApp.Api.Data;
using NotesApp.Api.Services;

namespace NotesApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponse>> Register([FromBody] RegisterRequest request)
    {
        var email = EmailNormalizer.Normalize(request.Email);
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new ErrorResponse("Email is required."));
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            if (createResult.Errors.Any(e =>
                    e.Code == nameof(IdentityErrorDescriber.DuplicateEmail) ||
                    e.Code == nameof(IdentityErrorDescriber.DuplicateUserName)))
            {
                return BadRequest(new ErrorResponse("This email is already in use."));
            }

            var message = string.Join(" ", createResult.Errors.Select(e => e.Description));
            return BadRequest(new ErrorResponse(message));
        }

        await _signInManager.SignInAsync(user, isPersistent: true);
        return Ok(ToUserResponse(user));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserResponse>> Login([FromBody] LoginRequest request)
    {
        var email = EmailNormalizer.Normalize(request.Email);
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest(new ErrorResponse("Invalid email or password."));
        }

        var result = await _signInManager.PasswordSignInAsync(
            email,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            return BadRequest(new ErrorResponse("Invalid email or password."));
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return BadRequest(new ErrorResponse("Invalid email or password."));
        }

        return Ok(ToUserResponse(user));
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserResponse>> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(ToUserResponse(user));
    }

    private static UserResponse ToUserResponse(ApplicationUser user) =>
        new(user.Id, user.Email ?? user.UserName ?? string.Empty);
}
