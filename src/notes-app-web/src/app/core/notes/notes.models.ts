export interface NoteListItem {
  id: string;
  title: string;
  createdAt: string;
}

export interface NoteCreated {
  id: string;
  title: string;
  createdAt: string;
}

export interface CreateNoteRequest {
  title: string;
  body: string;
}

export interface NoteValidationErrors {
  errors: Record<string, string>;
}
