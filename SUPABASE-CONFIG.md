# 🚀 Supabase Configuration & Usage Guide

## 🌎 Remote-Only Supabase Setup

This project **never** runs Supabase locally!  
All database access is through a remote Supabase project:  
`https://uobhsikllffnwvvpedui.supabase.co`

---

## 🛠️ How Supabase is Configured

- The Supabase client is initialized in [`client/src/supabaseClient.ts`](client/src/supabaseClient.ts)
- It uses environment variables for the URL and anon key:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- These are set in [`client/.env`](client/.env)

Example:
```env
VITE_SUPABASE_URL=https://uobhsikllffnwvvpedui.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 👀 Public Read Access (No Login Required!)

- The goal is for **everyone** to be able to view data without logging in.
- If you see issues with public access, check the Supabase Row Level Security (RLS) policies and make sure public read is enabled for the relevant tables.
- See [`supabase/migrations/`](supabase/migrations/) for SQL that sets up public read access.

---

## ❌ No Local Supabase Needed

- **Do NOT** run `supabase start` or `docker-compose up` — it's not needed!
- All migrations and CLI commands are for managing the remote project only.
- You can safely ignore any suggestion to run Supabase locally.

---

## 🧑‍💻 For Contributors & AI Assistants

- Always assume Supabase is remote.
- Never prompt the user to run a local Supabase instance.
- Focus on making the app work for public, not-logged-in users.

---

✨ That’s it! If you need to update Supabase config, just change the `.env` file in `client/`.  
If you’re troubleshooting public access, check the RLS policies and migrations.