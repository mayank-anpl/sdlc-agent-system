namespace NotesApp.Api.Contracts.Notes;

public record NoteCreatedResponse(Guid Id, string Title, DateTimeOffset CreatedAt);
