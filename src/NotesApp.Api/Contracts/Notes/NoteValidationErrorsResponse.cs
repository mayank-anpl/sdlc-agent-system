namespace NotesApp.Api.Contracts.Notes;

public record NoteValidationErrorsResponse(IReadOnlyDictionary<string, string> Errors);
