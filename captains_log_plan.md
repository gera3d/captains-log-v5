# Good Idea App Plan

## Project Overview
Create a web application to record voice notes, transcribe them, generate business ideas, and share/collaborate on them.

## Project Structure
*(Reflects current state)*
```
/client
  /src/components
  /src/pages
  /src/styles
  /src/contexts
  supabaseClient.ts
/supabase
  /migrations
  /functions
  config.toml
.env
```

## Supabase Integration
Set up Supabase for:
- User authentication (Google OAuth, GitHub OAuth).
- Database to store voice notes, ideas, hubs, etc. (See `database_structure.md`).
- File storage for audio recordings.
- Edge Functions (e.g., `push-to-github`).

## Voice Recording Feature
Implement functionality to record voice notes using the browser's Web Audio API.

## Transcription & Idea Generation Service
- Integrate n8n webhooks for transcription and idea generation.

## Storage of Notes & Ideas
Save voice notes, transcripts, and generated ideas in the Supabase database with metadata.

## Sharing & Collaboration Functionality
- Implement sharing notes via public links.
- Implement "Hubs" for collaboration around ideas.
- Implement pushing notes/ideas to GitHub repositories.

## User Interface
Design a user-friendly interface using React and TailwindCSS.

## Expanded Detailed Plan for Good Idea App

1.  **Project Overview**
    *   Create a web application to record voice notes, transcribe them, generate business ideas, and share/collaborate on them.

2.  **Project Structure**
    *   *(See above)*

3.  **Supabase Integration**
    *   **Authentication**: Use Supabase Auth with Google & GitHub OAuth (including `repo` scope).
    *   **Database**: Define and migrate schema for `voice_notes`, `saved_ideas`, `hubs`, etc. Implement RLS.
    *   **File Storage**: Use Supabase Storage for audio recordings.
    *   **Edge Functions**: Implement `push-to-github` function.

4.  **Voice Recording Feature**
    *   Implement recording using Web Audio API (`MediaRecorder`).
    *   Provide UI for start/stop/review.

5.  **Transcription & Idea Generation Service**
    *   Integrate n8n webhooks for transcription and idea generation.
    *   Handle audio uploads and trigger workflows.

6.  **Storage of Notes & Ideas**
    *   Save voice notes, transcripts, and generated ideas in Supabase tables.

7.  **Sharing & Collaboration Functionality**
    *   Implement sharing via public links (`/idea/:id`).
    *   Implement "Push to GitHub" feature.
    *   Implement Hubs structure (database, UI, logic).

8.  **User Interface**
    *   Design UI using React and TailwindCSS.
    *   Create components for Recording, Notes List, Auth, Hubs, Sharing.

9.  **Deployment**
    *   Use Supabase CLI for backend assets.
    *   Deploy frontend (e.g., Vercel, Netlify).
    *   Ensure responsiveness.

## Expanded Breakdown of Tricky Tasks *(Focus on Complexity)*

### Authentication with Supabase (Google & GitHub OAuth) — Medium
- Configure providers in Supabase dashboard.
- Handle OAuth flow and session management in frontend.
- Secure routes/data based on authentication state.

### Database Schema Design & Migration — Medium
- Design tables and relationships.
- Write and manage SQL migrations.
- Implement appropriate RLS policies.

### Voice Recording UI & Functionality — Medium
- Use MediaRecorder API correctly.
- Handle permissions and errors.
- Manage audio data (Blobs).

### Upload Audio to Supabase Storage — Medium
- Handle file preparation and upload.
- Manage storage paths and URLs.

### Transcription Service Integration — Hard
- Send audio data to external webhook.
- Handle asynchronous response/update.
- Manage potential errors in external service.

### Idea Generation Integration - Medium
- Send transcript data to external webhook.
- Handle asynchronous response/update.
- Manage potential errors.

### Push to GitHub Integration - Hard
- Create Supabase Edge Function.
- Handle GitHub API authentication (OAuth token).
- Implement file creation/push logic using GitHub API.
- Manage function invocation and error handling.

### Sharing Functionality — Medium
- Generate unique, shareable links.
- Create public view for shared items.
- Ensure RLS policies allow public read access correctly.

### Hubs Functionality - Hard
- Design comprehensive database schema for hubs, members, roles, resources, etc.
- Implement complex RLS policies for various user roles and hub states.
- Build UI for hub creation, management, and interaction.
- Implement core logic for joining, roles, permissions, activities.

## Step-by-Step Implementation Plan with Difficulty Ratings *(Focus on Sequence)*

### 1. Initialize Project & Supabase Setup *(Easy)*
- Set up project structure, Git, Vite, Supabase project, env vars, client.

### 2. Authentication with Supabase (Google & GitHub OAuth) *(Medium)*
- Configure providers, implement UI, handle session state.

### 3. Database Schema Design & Migration *(Medium)*
- Design tables, write migrations, apply schema, set up initial RLS.

### 4. File Storage Setup *(Easy)*
- Create bucket, configure basic policies.

### 5. Voice Recording UI & Functionality *(Medium)*
- Implement recorder component, handle permissions, manage audio blobs.

### 6. Upload Audio to Supabase Storage *(Medium)*
- Implement upload logic, save file URL.

### 7. Transcription Service Integration *(Hard)*
- Implement webhook call, handle response, update database.

### 7b. Idea Generation Integration *(Medium)*
- Implement webhook call, handle response, update database.

### 8. Save Note Metadata in Database *(Easy)*
- Ensure all relevant data (URLs, transcripts, ideas, user ID) is saved.

### 9. Display User's Notes *(Easy)*
- Fetch and display notes for the logged-in user.

### 10. Sharing Functionality *(Medium)*
- Implement public links, public view page, adjust RLS.

### 10b. Push to GitHub Functionality *(Hard)*
- Create Edge Function, implement GitHub API logic, call from frontend.

### 10c. Hubs Functionality *(Hard)*
- Finalize DB schema, implement UI and core logic.

### 11. UI Polish & Styling *(Easy)*
- Refine styles, ensure responsiveness, add loading/error states.

### 12. Testing & Deployment *(Medium)*
- Perform end-to-end testing, fix bugs, deploy backend and frontend.

## Summary Table *(Focus on Planned Steps & Difficulty)*

| Step | Description                   | Difficulty |
|------|-------------------------------|------------|
| 1    | Initialize Project & Supabase | Easy       |
| 2    | Auth (Google, GitHub)         | Medium     |
| 3    | Database Schema & Migration   | Medium     |
| 4    | File Storage Setup            | Easy       |
| 5    | Voice Recording UI            | Medium     |
| 6    | Upload Audio                  | Medium     |
| 7    | Transcription Integration     | Hard       |
| 7b   | Idea Generation Integration   | Medium     |
| 8    | Save Note Metadata            | Easy       |
| 9    | Display User's Notes          | Easy       |
| 10   | Sharing Functionality (Link)  | Medium     |
| 10b  | Push to GitHub Functionality  | Hard       |
| 10c  | Hubs Functionality            | Hard       |
| 11   | UI Polish                     | Easy       |
| 12   | Testing & Deployment          | Medium     |

## Browser Testing Steps *(Keep as a reference for QA)*
*(Existing testing steps remain relevant for verifying functionality)*