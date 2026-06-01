using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApp.Api.Contracts.Notes;
using NotesApp.Api.Data;
using NotesApp.Api.Services;

namespace NotesApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly NotesDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public NotesController(NotesDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<NoteListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<NoteListItemResponse>>> GetNotes()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }

        // SQLite cannot ORDER BY DateTimeOffset; sort in memory (v1 scope).
        var notes = await _db.Notes
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .Select(n => new NoteListItemResponse(n.Id, n.Title, n.CreatedAt))
            .ToListAsync();

        var ordered = notes
            .OrderByDescending(n => n.CreatedAt)
            .ThenByDescending(n => n.Id)
            .ToList();
        return Ok(ordered);
    }

    [HttpPost]
    [ProducesResponseType(typeof(NoteCreatedResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(NoteValidationErrorsResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<NoteCreatedResponse>> CreateNote([FromBody] CreateNoteRequest request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
        {
            return Unauthorized();
        }

        var validationErrors = NoteInputValidator.Validate(request.Title, request.Body);
        if (validationErrors.Count > 0)
        {
            return BadRequest(new NoteValidationErrorsResponse(validationErrors));
        }

        var (title, body) = NoteInputValidator.TrimValid(request.Title, request.Body);
        var now = DateTimeOffset.UtcNow;

        var note = new Note
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Body = body,
            CreatedAt = now,
            UpdatedAt = now,
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        var response = new NoteCreatedResponse(note.Id, note.Title, note.CreatedAt);
        return CreatedAtAction(nameof(GetNotes), response);
    }
}
