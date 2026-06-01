# User Story: Create and List Notes

**Story ID:** US-001
**Status:** Ready
**Date:** 2026-06-01
**Depends on:** US-002 (User Authentication)

## Story
As a signed-in user who needs to capture and revisit information,
I want to create notes with a title and body and view a list of all my notes,
so that I can record what matters to me and find it again later without relying on memory or scattered tools.

## Context
People often need a simple place to jot down thoughts, tasks, or reference material and return to it later. For signed-in users, notes must belong to their account so private content stays private. Without a dedicated way to save and browse their own notes, information gets lost or duplicated across chats, documents, and sticky notes.

## Acceptance Criteria
1. Given I am signed in, when I provide both a title and a body and save a new note, then the note is stored under my account and I receive confirmation that it was created successfully.
2. Given I am signed in and have created one or more notes, when I open or navigate to my notes list, then I see every note that belongs to my account and only those notes.
3. Given I have multiple notes created at different times, when I view my notes list, then the notes are ordered with the newest note first.
4. Given I have multiple notes, when I view the notes list, then each entry shows enough information (at minimum the title) for me to distinguish one note from another.
5. Given I am signed in and have not created any notes yet, when I open the notes list, then I see a clear empty state indicating I have no notes and can create one.
6. Given I attempt to create a note without a title, without a body, or with either field empty, when I try to save, then the note is not created and I am informed what is missing.
7. Given another user has notes on their account, when I am signed in as myself and view my notes list, then I do not see any of that other user's notes.

## Out of Scope
- User sign-in, registration, password reset, and session management (US-002)
- Editing or deleting existing notes
- Searching, filtering, or user-configurable sort order (beyond newest-first as specified)
- Organizing notes with folders, tags, or categories
- Rich text, attachments, or formatting beyond plain title and body
- Sharing notes with other users or collaborating on notes
- Enforcing maximum length on title or body for v1

## Assumptions
- The user is already signed in before using create or list flows; unauthenticated access is handled by US-002.
- Each note is owned by exactly one signed-in user's account; ownership is set at creation and does not change in this story.
- Title and body are both required plain text fields; whitespace-only values are treated as missing.
- There is no hard maximum length for title or body in v1.
- Notes persist after the application is closed and reopened.
- The list includes all of the user's notes with no pagination requirement for this story.
- Default list order is newest note first, based on when the note was created.

## Open Questions
- None for v1
