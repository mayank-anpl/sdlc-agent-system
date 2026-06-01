namespace NotesApp.Api.Services;

public static class NoteInputValidator
{
    public static Dictionary<string, string> Validate(string? title, string? body)
    {
        var errors = new Dictionary<string, string>();
        var trimmedTitle = title?.Trim() ?? string.Empty;
        var trimmedBody = body?.Trim() ?? string.Empty;

        if (string.IsNullOrEmpty(trimmedTitle))
        {
            errors["title"] = "Title is required.";
        }

        if (string.IsNullOrEmpty(trimmedBody))
        {
            errors["body"] = "Body is required.";
        }

        return errors;
    }

    public static (string Title, string Body) TrimValid(string title, string body) =>
        (title.Trim(), body.Trim());
}
