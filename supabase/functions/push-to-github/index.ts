// Import necessary modules
import { corsHeaders } from "./cors.ts"; // Updated import path
import { createClient } from "jsr:@supabase/supabase-js";
import { Octokit } from "npm:@octokit/rest"; // Using Octokit for easier API interaction
import { encodeBase64 } from "jsr:@std/encoding/base64";

console.log("Push-to-GitHub function booting up...");

// Use Deno.serve instead of the imported serve
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Log incoming headers for debugging
  console.log("Incoming Request Headers:", Object.fromEntries(req.headers.entries()));

  try {
    // NOTE: We are bypassing internal session/user retrieval due to environment issues.
    // We rely on Supabase function invocation requiring a valid JWT in the Authorization header.

    // 1. Parse request body to get note details AND the GitHub token
    const { note, repoName, isNewRepo, githubToken } = await req.json();
    if (!note || !repoName) {
      return new Response(JSON.stringify({ error: "Missing 'note' or 'repoName' in request body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!githubToken) {
      console.error("GitHub token missing in request body");
      return new Response(JSON.stringify({ error: "Unauthorized: GitHub token missing." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Received GitHub token from request body.");

    // 2. Initialize Octokit with the token from the body
    const octokit = new Octokit({ auth: githubToken });

    // 3. Get GitHub user info (needed for owner)
    const { data: githubUser } = await octokit.users.getAuthenticated();
    const owner = githubUser.login;

    // 4. Create repository if requested
    let repoUrl = `https://github.com/${owner}/${repoName}`;
    if (isNewRepo) {
      try {
        console.log(`Attempting to create new repository: ${owner}/${repoName}`);
        await octokit.repos.createForAuthenticatedUser({
          name: repoName,
          description: `Repository for notes from Captain's Log - ${note.id || ''}`,
          private: true, // Default to private, could be an option later
        });
        console.log(`Successfully created repository: ${owner}/${repoName}`);
      } catch (error) {
        // Handle case where repo might already exist (error code 422)
        if (error.status === 422) {
           console.warn(`Repository ${owner}/${repoName} likely already exists.`);
           // Proceed assuming it exists
        } else {
          console.error("Error creating repository:", error);
          throw new Error(`Failed to create repository: ${error.message}`);
        }
      }
    }

    // 5. Prepare file content (Markdown)
    const fileName = `README.md`;
    const filePath = fileName;

    // --- Start: Replicate business_idea processing from NotesList.jsx ---
    let ideaText = '';
    try {
      const trimmed = note.business_idea?.trim() || '';
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.idea) ideaText = parsed.idea;
          else if (parsed.text) ideaText = parsed.text;
          else ideaText = JSON.stringify(parsed);
        } else {
          ideaText = String(parsed);
        }
      } else {
        ideaText = trimmed;
      }
      // Clean up potential leading/trailing quotes and escaped newlines
      ideaText = ideaText.replace(/^"?text":"?/, '').replace(/"$/, '').replace(/\\n/g, '\n').trim();
    } catch {
      ideaText = note.business_idea || 'No business idea generated.'; // Fallback
    }
    // --- End: Replicate business_idea processing ---

    // --- Start: Process transcript similarly (basic JSON check) ---
    let transcriptText = '';
    try {
        const trimmedTranscript = note.transcript?.trim() || '';
        if (trimmedTranscript.startsWith('{') && trimmedTranscript.endsWith('}')) {
            const parsed = JSON.parse(trimmedTranscript);
            if (parsed && typeof parsed === 'object') {
                transcriptText = parsed.data || parsed.text || JSON.stringify(parsed);
            } else {
                transcriptText = String(parsed);
            }
        } else {
            transcriptText = trimmedTranscript;
        }
        transcriptText = transcriptText.replace(/\\n/g, '\n').trim(); // Also replace escaped newlines
    } catch {
        transcriptText = note.transcript || 'No transcript available.'; // Fallback
    }
    // --- End: Process transcript ---

    // Construct the Markdown content, starting directly with the idea text
    const markdownContent = `${ideaText}\n\n## Transcript\n\n${transcriptText}\n`;
    const encodedContent = encodeBase64(markdownContent);

    // 6. Create or update README.md file in GitHub
    let readmeFileSha = undefined;
    const readmeFilePath = 'README.md';
    try {
      const { data: existingFileData } = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path: readmeFilePath,
      });
      if (existingFileData && typeof existingFileData === 'object' && 'sha' in existingFileData && existingFileData.type === 'file') {
         readmeFileSha = existingFileData.sha;
         console.log(`File ${readmeFilePath} exists, SHA: ${readmeFileSha}. Will update.`);
      }
    } catch (error) {
       if (error.status !== 404) {
          console.error(`Error checking for existing file ${readmeFilePath}:`, error);
          throw new Error(`Failed to check file existence for ${readmeFilePath}: ${error.message}`);
       }
       console.log(`File ${readmeFilePath} does not exist. Will create.`);
    }

    console.log(`Attempting to create/update file: ${owner}/${repoName}/${readmeFilePath}`);
    const readmeCommitMessage = readmeFileSha ? `Update note ${note.id || ''}` : `Add note ${note.id || ''}`;
    const { data: readmeFileCreationData } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: readmeFilePath,
      message: readmeCommitMessage,
      content: encodedContent, // This is the encoded note content
      sha: readmeFileSha,
    });
    console.log(`Successfully created/updated file: ${readmeFileCreationData.content?.html_url}`);

    // --- Start: Add/Update Product Requirement Document ---
    const prdFileName = 'product-requirement-document.md';
    const prdFilePath = prdFileName; // Root directory

    // Use prd_content from the note object, fallback to empty string if null/undefined
    const prdContent = note.prd_content || ''; 
    const encodedPrdContent = encodeBase64(prdContent);

    let prdFileSha = undefined;
    try {
      const { data: existingPrdData } = await octokit.repos.getContent({
        owner,
        repo: repoName,
        path: prdFilePath,
      });
      if (existingPrdData && typeof existingPrdData === 'object' && 'sha' in existingPrdData && existingPrdData.type === 'file') {
        prdFileSha = existingPrdData.sha;
        console.log(`File ${prdFilePath} exists, SHA: ${prdFileSha}. Will update.`);
      }
    } catch (error) {
      if (error.status !== 404) {
        console.error(`Error checking for existing file ${prdFilePath}:`, error);
        // Don't throw here, maybe just warn, as failing to update PRD is less critical than the note
        console.warn(`Could not check for existing PRD file: ${error.message}`);
      } else {
        console.log(`File ${prdFilePath} does not exist. Will create.`);
      }
    }

    // Only attempt to create/update if we didn't encounter a non-404 error during the check
    let prdFileCreationData = null;
    try {
        console.log(`Attempting to create/update file: ${owner}/${repoName}/${prdFilePath}`);
        const prdCommitMessage = prdFileSha ? `Update project documentation` : `Add project documentation`;
        const { data } = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path: prdFilePath,
            message: prdCommitMessage,
            content: encodedPrdContent,
            sha: prdFileSha,
        });
        prdFileCreationData = data; // Store response data
        console.log(`Successfully created/updated file: ${prdFileCreationData?.content?.html_url}`);
    } catch (error) {
        console.error(`Failed to create/update ${prdFilePath}:`, error);
        // Log error but don't fail the whole function, as the main note push might have succeeded
    }
    // --- End: Add/Update Product Requirement Document ---

    // 7. Return success response (mention both files if PRD was successful)
    let successMessage = `Successfully pushed note to ${repoName}. README: ${readmeFileCreationData.content?.html_url || 'link unavailable'}`;
    if (prdFileCreationData?.content?.html_url) {
        successMessage += ` | PRD: ${prdFileCreationData.content.html_url}`;
    }

    return new Response(JSON.stringify({ 
        message: successMessage,
        repoUrl: repoUrl,
        readmeUrl: readmeFileCreationData.content?.html_url,
        prdUrl: prdFileCreationData?.content?.html_url // Include PRD URL if available
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in push-to-github function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

console.log("Push-to-GitHub function handler registered.");

/* To invoke locally:

  1. Run `supabase start`
  2. Make sure you have logged in via GitHub in your app to get a provider token.
  3. Get your Supabase Auth Token (JWT) and the note details.
  4. Make an HTTP request (replace placeholders):

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push-to-github' \
    --header 'Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN' \
    --header 'Content-Type: application/json' \
    --data '{
      "note": {
        "id": "your_note_id",
        "business_idea": "A great new idea...",
        "transcript": "This is the voice transcript..."
      },
      "repoName": "my-captains-log-notes",
      "isNewRepo": true,
      "githubToken": "your_github_token"
    }'

*/
