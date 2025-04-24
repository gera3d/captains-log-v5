# Known Issues & Areas for Review

This document tracks discrepancies found between the database schema (`database_structure.md`) and the codebase, as well as areas needing further clarification or investigation.

## Database Schema vs. Codebase Discrepancies

1.  **Missing `voice_notes` Columns:**
    *   **Issue:** The columns `is_featured` (boolean), `status` (text), and `updated_at` (timestamptz) are used in `client/src/App.jsx` (specifically in the Dashboard logic for filtering and sorting active/featured ideas) but are **missing** from the `voice_notes` table definition in `database_structure.md`.
    *   **Impact:** Code relying on these columns might fail or produce unexpected results if the columns don't actually exist in the database.
    *   **Action:** Verify the actual `voice_notes` table schema in Supabase. Update `database_structure.md` if the columns exist, or modify the code if they don't.

2.  **`voice_notes.title` Handling:**
    *   **Issue:** The code derives a title (`extractTitle` in `App.jsx`, displayed in `FullIdeaPage`) often from `business_idea`. The `saved_ideas` table has a `title` column, but `voice_notes` does not according to the schema.
    *   **Impact:** Ambiguity in how a definitive title for a voice note or its associated idea is determined and stored.
    *   **Action:** Clarify the intended source of truth for an idea's title. Decide if `voice_notes` needs its own `title` column (requiring schema change) or if it should rely solely on derivation or a linked `saved_ideas` record.

3.  **`audio_files` Table:**
    *   **Issue:** The schema dump defines a primary key for `public.audio_files` but doesn't include its `CREATE TABLE` statement or explain its purpose. The `voice_notes.audio_url` column points to Supabase Storage.
    *   **Impact:** Unclear role of the `audio_files` table. Is it redundant, used for metadata, or part of an older/different implementation?
    *   **Action:** Investigate the purpose and usage of the `audio_files` table. Determine if it's still needed or can be removed.

## Areas for Clarification & Review

1.  **`saved_ideas` Integration Logic:**
    *   **Issue:** The schema defines foreign key relationships (`idea_id`, `saved_idea_id`) between `voice_notes` and `saved_ideas`, but the reviewed code snippets don't show how/when these links are created or managed.
    *   **Action:** Locate and review the code responsible for creating `saved_ideas` records and linking them to `voice_notes`.

2.  **Hub Feature Code:**
    *   **Issue:** The extensive Hub-related tables (`hubs`, `hub_members`, etc.) defined in the schema are not referenced in the core `App.jsx`, `NotesList.jsx`, or `VoiceRecorder.jsx` files.
    *   **Action:** Locate the code implementing Hub features (likely in `src/components/hub/` or similar) and verify its alignment with the schema and RLS policies.

3.  **Persona Storage (`localStorage`):**
    *   **Issue:** Personas are currently stored client-side in `localStorage` (`PersonaSelector.jsx`).
    *   **Impact:** State is not persistent across devices or sessions if `localStorage` is cleared.
    *   **Action:** Consider migrating persona state to the database (e.g., a `user_profiles` table linked to `auth.users`) for better persistence.

4.  **RLS Policy Thoroughness:**
    *   **Issue:** While numerous RLS policies exist, some appear quite broad (e.g., `Allow public read access...`).
    *   **Impact:** Potential for unintended data exposure if policies are not sufficiently restrictive.
    *   **Action:** Conduct a thorough review of all RLS policies against the application's intended access control requirements, ensuring data segregation between users and appropriate public access levels.

5.  **External Dependencies (n8n):**
    *   **Issue:** Core features (transcription, idea generation, PRD creation) rely on external n8n webhooks.
    *   **Impact:** Application functionality is dependent on the availability and correctness of these external services.
    *   **Action:** Ensure robust error handling for webhook calls. Monitor the reliability of the n8n workflows. Consider fallback mechanisms if applicable.
