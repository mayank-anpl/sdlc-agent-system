# User Story: User Authentication

**Story ID:** US-002
**Status:** Ready
**Date:** 2026-06-01

## Story
As a person who wants to keep my notes private and tied to me,
I want to sign up and log in with my email and password and log out when I am done,
so that only I can access my account and the notes that belong to it.

## Context
Notes must be private per account, which requires knowing who is using the app. A minimal account system with email-and-password sign-up, login, and logout establishes identity for note ownership without the overhead of verification emails, password recovery, or social login for v1.

## Acceptance Criteria
1. Given I do not have an account, when I sign up with a valid email and password, then my account is created and I am signed in.
2. Given an account already exists for an email, when I attempt to sign up with that same email, then the account is not created and I am informed that the email is already in use.
3. Given I have an account, when I log in with the correct email and password, then I am signed in and recognized as that account holder.
4. Given I have an account, when I log in with an incorrect email or password, then I am not signed in and I am informed that the credentials are invalid.
5. Given I am signed in, when I log out, then I am signed out and no longer treated as that account holder.
6. Given I am not signed in, when I try to use note features that require an account, then I cannot access them until I sign in or sign up.
7. Given I am signed in, when I use the application, then my actions are associated with my account so my notes remain private to me and separate from other users' notes.

## Out of Scope
- Password reset or "forgot password" flows
- Email verification or confirmation before use
- Third-party or social login (e.g. Google, Apple, SSO)
- Multi-factor authentication
- Profile management beyond what is needed to sign up, log in, and log out
- Account deletion or email change
- Admin or support tools for managing user accounts

## Assumptions
- Sign-up and log-in use email address and password only; no other registration fields are required for v1.
- Each email address maps to at most one account.
- A signed-in session persists until the user logs out or it otherwise ends through normal application behavior.
- Invalid or incomplete sign-up and log-in attempts (e.g. missing email or password) are rejected with clear feedback.
- Note privacy and per-account ownership for note data are enforced once identity is established; detailed note behavior is defined in US-001.

## Open Questions
- None for v1
