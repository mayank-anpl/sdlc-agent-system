export function validateNoteTitle(title: string): string | null {
  if (!title.trim()) {
    return 'Title is required.';
  }
  return null;
}

export function validateNoteBody(body: string): string | null {
  if (!body.trim()) {
    return 'Body is required.';
  }
  return null;
}
