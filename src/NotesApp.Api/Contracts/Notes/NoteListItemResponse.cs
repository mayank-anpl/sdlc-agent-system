namespace NotesApp.Api.Contracts.Notes;

public record NoteListItemResponse(Guid Id, string Title, DateTimeOffset CreatedAt);
