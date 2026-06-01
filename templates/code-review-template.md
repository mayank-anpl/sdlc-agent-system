# Code Review: [scope]

**Status:** Draft
**Date:** [YYYY-MM-DD]
**Reviewed:** [what code / commit]
**Relates to:** [stories, ADRs]

## Summary
[Overall impression in 2-3 sentences, and the verdict up front.]

## Findings
[One block per finding.]

### [Severity] — [short title]
- **Location:** [file / area]
- **Issue:** [what's wrong or risky]
- **Recommendation:** [the concrete fix]

(Severity: Blocker = must fix before merge · Major = should fix · Minor = nice to fix · Nit = optional)

## Acceptance Criteria Check
| Criterion | Met? | Notes |
|-----------|------|-------|

## Security Review
[Explicitly check each project boundary: UserId from claims; cookie HttpOnly/SameSite/Secure;
RequireConfirmedAccount=false; CSRF posture; no secrets committed; password handling.]

## Verdict
[Approve / Approve with changes / Needs rework] — and exactly what must be addressed.