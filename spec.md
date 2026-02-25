# Specification

## Summary
**Goal:** Fix the admin authorization error on the Bank Details page and update the footer text across the app.

**Planned changes:**
- Audit and fix the backend authorization logic for bank detail mutations (add, edit, delete) so the caller is correctly identified as admin.
- Fix the frontend's role/token passing mechanism (in `useActor` and `useQueries`) to ensure the admin identity is sent with every bank detail mutation call to the canister.
- Replace the footer text from `© 2026 Student Bank · Built with ❤️ using caffeine.ai` to `2026 Student Bank · vaibhavgavali` on all pages.

**User-visible outcome:** An admin can add, edit, and delete bank details without receiving an "Unauthorized" error, and the footer displays the updated text across the entire app.
