namespace NotesApp.Api.Services;

public static class EmailNormalizer
{
    public static string Normalize(string? email) =>
        email?.Trim().ToLowerInvariant() ?? string.Empty;
}
