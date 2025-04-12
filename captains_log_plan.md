# Captains Log App Plan

## Project Overview
Create a web application to record, transcribe, and share voice notes.

## Project Structure
Set up the following folder structure:
```
/client
  /src/components
  /src/pages
  /src/styles
  supabaseClient.ts
/supabase
  /db (SQL migration files)
  /auth (Role policies, RLS rules)
.env
```

## Supabase Integration
Set up Supabase for:
- User authentication (Google OAuth).
- Database to store transcribed notes.
- File storage for audio recordings.

## Voice Recording Feature
Implement functionality to record voice notes using the browser's Web Audio API.

## Transcription Service
Integrate a transcription service (e.g., Google Cloud Speech-to-Text) to convert audio recordings to text.

## Storage of Notes
Save transcribed notes in the Supabase database with metadata (e.g., date, duration).

## Sharing Functionality
Implement a feature to share notes via links or social media.

## User Interface
Design a user-friendly interface using React and TailwindCSS.

## Expanded Detailed Plan for Captains Log App

1. **Project Overview**
   - Create a web application to record, transcribe, and share voice notes.

2. **Project Structure**
   - Set up the following folder structure:
     ```
     /client
       /src/components
       /src/pages
       /src/styles
       supabaseClient.ts
     /supabase
       /db (SQL migration files)
       /auth (Role policies, RLS rules)
     .env
     ```

3. **Supabase Integration**
   - **Authentication**:
     - Use Supabase Auth for user authentication.
     - Implement Google OAuth for easy sign-in.
   - **Database**:
     - Create a table for storing voice notes with fields for:
       - User ID
       - Transcribed text
       - Audio file URL
       - Timestamp
   - **File Storage**:
     - Use Supabase Storage to save audio recordings.

4. **Voice Recording Feature**
   - Implement functionality to record voice notes using the Web Audio API.
   - Provide a user interface for starting and stopping recordings.
   - Allow users to review recordings before saving.

5. **Transcription Service**
   - Integrate a transcription service (e.g., Google Cloud Speech-to-Text) to convert audio recordings to text.
   - Handle audio file uploads and trigger transcription upon completion.

6. **Storage of Notes**
   - Save transcribed notes in the Supabase database with metadata (e.g., date, duration).
   - Ensure proper error handling for failed uploads or transcriptions.

7. **Sharing Functionality**
   - Implement a feature to share notes via links or social media.
   - Generate shareable links that allow others to view the transcribed notes.

8. **User Interface**
   - Design a user-friendly interface using React and TailwindCSS.
   - Create components for:
     - Recording interface
     - Displaying saved notes
     - Sharing options

9. **Deployment**
   - Use Supabase CLI for deployment and management of the application.
   - Ensure the application is responsive and works on various devices.
## Expanded Breakdown of Tricky Tasks

### 2. Authentication with Supabase (Google OAuth) — Medium
- Enable Google OAuth in Supabase dashboard
  - Register app with Google Cloud Console
  - Obtain Client ID and Secret
  - Add credentials to Supabase Auth
  - Set redirect URIs
- Configure environment variables
  - Add Supabase URL and keys to `.env`
- Implement login/logout UI
  - Create login page/component
  - Add 'Sign in with Google' button
  - Use `supabase.auth.signInWithOAuth()`
  - Handle redirect callback
- Handle user session state
  - Use `onAuthStateChange`
  - Store user info in React context
  - Implement logout button
- Protect routes/pages
  - Create PrivateRoute or guards
  - Redirect unauthenticated users

### 3. Database Schema Design & Migration — Medium
- Design `voice_notes` table
  - Define columns and types
  - Add FK to `auth.users`
- Write SQL migration
- Apply migration via CLI
- Set up RLS policies
  - Enable RLS
  - Policy: user can access own notes
  - (Optional) Public read for shared
- Test policies

### 5. Voice Recording UI & Functionality — Medium
- Set up MediaRecorder API
  - Request mic permissions
  - Handle denied errors
- Implement controls
  - Start/stop buttons
  - Show status
- Handle audio data
  - Collect chunks
  - Convert to Blob
  - Create URL for playback
- Playback before upload
  - Add audio player
- Error handling

### 6. Upload Audio to Supabase Storage — Medium
- Prepare audio file
  - Convert Blob to File
  - Generate unique filename
- Upload to Storage
  - Use `supabase.storage.upload()`
  - Handle progress/errors
- Save file URL

### 7. Transcription Service Integration — Hard
- Send audio to webhook
- Handle webhook response
- Poll or callback for result
- Save transcript to DB
- Error handling and retries

### 10. Sharing Functionality — Medium
- Generate shareable link
- Implement public note view
- Adjust RLS policies
- Adjust storage policies
- Add share button
## Step-by-Step Implementation Plan with Difficulty Ratings

### 1. Initialize Project & Supabase Setup *(Easy)*
- [ ] TODO: Create project folder structure.
- [ ] TODO: Initialize Vite + React + TailwindCSS frontend.
- [ ] TODO: Initialize Git repository.
- [ ] TODO: Create Supabase project via dashboard.
- [ ] TODO: Configure environment variables (`.env`).
- [ ] TODO: Set up Supabase client in frontend (`supabaseClient.ts`).

### 2. Authentication with Supabase (Google OAuth) *(Medium)*
- [ ] TODO: Enable Google OAuth in Supabase dashboard.
- [ ] TODO: Configure redirect URIs.
- [ ] TODO: Implement login/logout UI.
- [ ] TODO: Handle user session state in React.
- [ ] TODO: Protect routes/pages requiring authentication.

### 3. Database Schema Design & Migration *(Medium)*
- [ ] TODO: Design `voice_notes` table with fields:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK to auth.users)
  - `audio_url` (text)
  - `transcript` (text)
  - `created_at` (timestamp)
- [ ] TODO: Write SQL migration file.
- [ ] TODO: Apply migration via Supabase CLI.
- [ ] TODO: Set up RLS policies:
  - Users can only access their own notes.
  - Public read access for shared notes (optional).

### 4. File Storage Setup *(Easy)*
- [ ] TODO: Create Supabase Storage bucket `voice-notes`.
- [ ] TODO: Set bucket policies:
  - Private by default.
  - Public read for shared notes (optional).

### 5. Voice Recording UI & Functionality *(Medium)*
- [ ] TODO: Implement UI to start/stop recording.
- [ ] TODO: Use Web Audio API or MediaRecorder API.
- [ ] TODO: Save audio blob locally in browser state.
- [ ] TODO: Allow playback before upload.
- [ ] TODO: Handle errors and permissions.

### 6. Upload Audio to Supabase Storage *(Medium)*
- [ ] TODO: Convert audio blob to file.
- [ ] TODO: Upload to Supabase Storage bucket.
- [ ] TODO: Save returned file URL.

### 7. Transcription Service Integration *(Hard)*
- [ ] TODO: Send audio file to transcription webhook (`https://n8n.why57.com/webhook/a37165d8-dcbd-4c54-8712-4400bec5f17b`).
- [ ] TODO: Poll or listen for transcription result.
- [ ] TODO: Handle webhook response and errors.
- [ ] TODO: Save transcript text to Supabase database.

### 8. Save Note Metadata in Database *(Easy)*
- [ ] TODO: After transcription, insert record into `voice_notes` table:
  - User ID
  - Audio URL
  - Transcript
  - Timestamp

### 9. Display User's Notes *(Easy)*
- [ ] TODO: Fetch notes for logged-in user.
- [ ] TODO: Display list with:
  - Transcript preview
  - Playback button for audio
  - Date/time

### 10. Sharing Functionality *(Medium)*
- [ ] TODO: Generate shareable link (e.g., `/note/:id`).
- [ ] TODO: Implement public note view page.
- [ ] TODO: Set RLS/storage policies to allow public read if shared.
- [ ] TODO: Add "Share" button in UI.

### 11. UI Polish & Styling *(Easy)*
- [ ] TODO: Style components with TailwindCSS.
- [ ] TODO: Responsive design.
- [ ] TODO: Loading states and error handling.
### 12. Testing & Deployment *(Medium)*
- [ ] TODO: Test all flows end-to-end.
- [ ] TODO: Fix bugs.
- [ ] TODO: Deploy Supabase project.
- [ ] TODO: Deploy frontend (e.g., Vercel, Netlify).
- [ ] TODO: Finalize environment variables.
- Finalize environment variables.

### Summary Table

| Step | Description | Difficulty |
|-------|------------------------------|------------|
| 1     | Initialize Project & Supabase | Easy       |
| 2     | Auth with Google OAuth        | Medium     |
| 3     | Database Schema & Migration   | Medium     |
| 4     | File Storage Setup            | Easy       |
| 5     | Voice Recording UI            | Medium     |
| 6     | Upload Audio                  | Medium     |
| 7     | Transcription Integration     | Hard       |
| 8     | Save Note Metadata            | Easy       |
| 9     | Display User's Notes          | Easy       |
| 10    | Sharing Functionality         | Medium     |
| 11    | UI Polish                     | Easy       |
| 12    | Testing & Deployment          | Medium     |
## Browser Testing Steps

### After Authentication Setup
- Launch app in browser
- Test Google OAuth login
- Verify session persistence
- Test logout and re-login

### After Database & RLS Setup
- Insert test data via Supabase dashboard
- Verify only own notes visible
- Attempt unauthorized access

### After Voice Recording Feature
- Test mic permission prompts
- Record a voice note
- Playback before upload
- Verify error handling

### After Audio Upload
- Record and upload
- Check Storage bucket
- Verify file URL saved
- Access file URL directly

### After Transcription Integration
- Record and upload
- Confirm transcription request
- Wait/poll for result
- Verify transcript appears
- Test with varied audio

### After Sharing Feature
- Generate share link
- Open in incognito/private window
- Verify public access
- Test unshared note restrictions

### Before Deployment
- Test full flow end-to-end
- Test on multiple browsers
- Test on mobile devices
- Verify responsiveness and UI polish