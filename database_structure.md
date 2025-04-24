# Database Schema

This document outlines the database structure based on the provided SQL schema dump.

## Table: `public.hub_activities`

*   **Description:** Tracks activities within hubs.
*   **RLS:** Enabled

| Column          | Type          | Default             | Nullable | Description |
| --------------- | ------------- | ------------------- | -------- | ----------- |
| `id`            | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`        | `uuid`        |                     | Yes      | Foreign Key to `hubs` |
| `user_id`       | `uuid`        |                     | Yes      | Foreign Key to `auth.users` |
| `activity_type` | `text`        |                     | No       | Type of activity |
| `metadata`      | `jsonb`       |                     | Yes      | Additional data about the activity |
| `created_at`    | `timestamptz` | `now()`             | Yes      | Timestamp of creation |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
    *   `user_id` -> `auth.users(id)` (ON DELETE SET NULL)
*   **Policies:**
    *   `Hub members can view hub activities` (SELECT)

---

## Table: `public.hub_discussions`

*   **Description:** Stores discussion threads within hubs.
*   **RLS:** Enabled

| Column       | Type          | Default             | Nullable | Description |
| ------------ | ------------- | ------------------- | -------- | ----------- |
| `id`         | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`     | `uuid`        |                     | Yes      | Foreign Key to `hubs` |
| `parent_id`  | `uuid`        |                     | Yes      | Foreign Key to `hub_discussions` (self-reference for replies) |
| `content`    | `text`        |                     | No       | Discussion content |
| `created_by` | `uuid`        |                     | Yes      | Foreign Key to `auth.users` |
| `created_at` | `timestamptz` | `now()`             | Yes      | Timestamp of creation |
| `updated_at` | `timestamptz` | `now()`             | Yes      | Timestamp of last update |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
    *   `parent_id` -> `public.hub_discussions(id)` (ON DELETE CASCADE)
    *   `created_by` -> `auth.users(id)` (ON DELETE SET NULL)
*   **Indexes:**
    *   `idx_hub_discussions_hub_id` (`hub_id`)
    *   `idx_hub_discussions_parent_id` (`parent_id`)
*   **Policies:**
    *   `Allow hub creators and members to create discussions` (INSERT)
    *   `Allow hub members to view discussions` (SELECT)
    *   `Allow users to view discussions for public hubs` (SELECT)

---

## Table: `public.hub_members`

*   **Description:** Manages membership within hubs.
*   **RLS:** Enabled

| Column    | Type          | Default             | Nullable | Description |
| --------- | ------------- | ------------------- | -------- | ----------- |
| `id`      | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`  | `uuid`        |                     | No       | Foreign Key to `hubs` |
| `user_id` | `uuid`        |                     | No       | Foreign Key to `auth.users` |
| `joined_at`| `timestamptz` | `now()`             | No       | Timestamp when user joined/requested |
| `role_id` | `uuid`        |                     | Yes      | Foreign Key to `hub_roles` |
| `status`  | `text`        | `'pending'`         | No       | Membership status (e.g., 'pending', 'approved') |

*   **Primary Key:** `id`
*   **Unique Constraints:** `hub_members_hub_id_user_id_key` (`hub_id`, `user_id`)
*   **Foreign Keys:**
    *   `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
    *   `user_id` -> `auth.users(id)` (ON DELETE CASCADE)
    *   `role_id` -> `public.hub_roles(id)` (ON DELETE SET NULL)
*   **Indexes:**
    *   `idx_hub_members_hub_id` (`hub_id`)
    *   `idx_hub_members_user_id` (`user_id`)
    *   `idx_hub_members_role_id` (`role_id`)
    *   `idx_hub_members_status` (`status`)
*   **Policies:**
    *   `Allow creators to remove/reject members` (DELETE)
    *   `Allow hub creators to manage members` (UPDATE)
    *   `Allow hub members and creators to see members` (SELECT)
    *   `Allow users to leave hubs` (DELETE)
    *   `Allow users to request joining public hubs` (INSERT)

---

## Table: `public.hub_resources`

*   **Description:** Stores resources (links, files) associated with a hub.
*   **RLS:** Enabled

| Column         | Type          | Default             | Nullable | Description |
| -------------- | ------------- | ------------------- | -------- | ----------- |
| `id`           | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`       | `uuid`        |                     | Yes      | Foreign Key to `hubs` |
| `user_id`      | `uuid`        |                     | Yes      | Foreign Key to `auth.users` (uploader) |
| `title`        | `text`        |                     | No       | Resource title |
| `description`  | `text`        |                     | Yes      | Resource description |
| `resource_type`| `text`        |                     | No       | Type of resource (e.g., 'link', 'document') |
| `resource_url` | `text`        |                     | No       | URL or path to the resource |
| `created_at`   | `timestamptz` | `now()`             | Yes      | Timestamp of creation |
| `updated_at`   | `timestamptz` | `now()`             | Yes      | Timestamp of last update |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
    *   `user_id` -> `auth.users(id)` (ON DELETE SET NULL)
*   **Indexes:** `idx_hub_resources_hub_id` (`hub_id`)
*   **Triggers:** `set_hub_resources_updated_at` (BEFORE UPDATE, calls `public.update_updated_at_column`)
*   **Policies:**
    *   `Allow hub creators and members to create resources` (INSERT)
    *   `Allow hub members to view resources` (SELECT)
    *   `Allow users to view resources for public hubs` (SELECT)
    *   `Hub members can view hub resources` (SELECT)

---

## Table: `public.hub_roles`

*   **Description:** Defines roles within a hub.
*   **RLS:** Enabled

| Column      | Type          | Default             | Nullable | Description |
| ----------- | ------------- | ------------------- | -------- | ----------- |
| `id`        | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`    | `uuid`        |                     | No       | Foreign Key to `hubs` |
| `created_at`| `timestamptz` | `now()`             | No       | Timestamp of creation |
| `title`     | `text`        |                     | No       | Role title (CHECK: length > 0) |
| `description`| `text`        |                     | Yes      | Role description |

*   **Primary Key:** `id`
*   **Foreign Keys:** `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
*   **Indexes:** `idx_hub_roles_hub_id` (`hub_id`)
*   **Policies:**
    *   `Allow hub creators to add roles` (INSERT)
    *   `Allow hub creators to delete roles` (DELETE)
    *   `Allow hub creators to update roles` (UPDATE)
    *   `Allow hub members/creators to see roles` (SELECT)

---

## Table: `public.hub_sharing_metrics`

*   **Description:** Tracks sharing metrics for hubs.
*   **RLS:** Enabled

| Column         | Type          | Default             | Nullable | Description |
| -------------- | ------------- | ------------------- | -------- | ----------- |
| `id`           | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`       | `uuid`        |                     | Yes      | Foreign Key to `hubs` |
| `platform`     | `text`        |                     | Yes      | Sharing platform (CHECK: valid enum) |
| `shares_count` | `integer`     | `0`                 | Yes      | Number of shares |
| `clicks_count` | `integer`     | `0`                 | Yes      | Number of clicks |
| `opt_ins_count`| `integer`     | `0`                 | Yes      | Number of opt-ins |
| `last_shared_at`| `timestamptz`|                     | Yes      | Timestamp of last share |
| `updated_at`   | `timestamptz` | `now()`             | Yes      | Timestamp of last update |

*   **Primary Key:** `id`
*   **Foreign Keys:** `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
*   **Indexes:** `idx_hub_sharing_metrics_hub_id` (`hub_id`)
*   **Policies:**
    *   `Allow hub creators to view sharing metrics` (SELECT)

---

## Table: `public.hub_updates`

*   **Description:** Stores updates or announcements for a hub.
*   **RLS:** Enabled

| Column       | Type          | Default             | Nullable | Description |
| ------------ | ------------- | ------------------- | -------- | ----------- |
| `id`         | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `hub_id`     | `uuid`        |                     | Yes      | Foreign Key to `hubs` |
| `title`      | `text`        |                     | No       | Update title |
| `content`    | `text`        |                     | Yes      | Update content |
| `created_by` | `uuid`        |                     | Yes      | Foreign Key to `auth.users` |
| `created_at` | `timestamptz` | `now()`             | Yes      | Timestamp of creation |
| `updated_at` | `timestamptz` | `now()`             | Yes      | Timestamp of last update |
| `type`       | `text`        |                     | Yes      | Type of update (CHECK: valid enum) |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `hub_id` -> `public.hubs(id)` (ON DELETE CASCADE)
    *   `created_by` -> `auth.users(id)` (ON DELETE SET NULL)
*   **Indexes:** `idx_hub_updates_hub_id` (`hub_id`)
*   **Policies:**
    *   `Allow hub creators and members to create updates` (INSERT)
    *   `Allow hub members to view updates` (SELECT)
    *   `Allow users to view updates for public hubs` (SELECT)

---

## Table: `public.hubs`

*   **Description:** Represents the central collaboration spaces (hubs).
*   **RLS:** Enabled

| Column          | Type          | Default             | Nullable | Description |
| --------------- | ------------- | ------------------- | -------- | ----------- |
| `id`            | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `created_at`    | `timestamptz` | `now()`             | No       | Timestamp of creation |
| `updated_at`    | `timestamptz` | `now()`             | No       | Timestamp of last update |
| `creator_id`    | `uuid`        |                     | No       | Foreign Key to `auth.users` (hub creator) |
| `idea_id`       | `uuid`        |                     | Yes      | Foreign Key to `saved_ideas` (associated idea) |
| `title`         | `text`        |                     | No       | Hub title (CHECK: length > 0) |
| `summary`       | `text`        |                     | Yes      | Short summary |
| `description`   | `text`        |                     | Yes      | Detailed description |
| `image_url`     | `text`        |                     | Yes      | URL for hub image |
| `is_public`     | `boolean`     | `true`              | No       | Whether the hub is publicly visible |
| `allow_open_join`| `boolean`    | `true`              | No       | Whether users can request to join freely |
| `status`        | `text`        | `'planning'`        | No       | Current status of the hub (e.g., 'planning', 'active') |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `creator_id` -> `auth.users(id)` (ON DELETE CASCADE)
    *   `idea_id` -> `public.saved_ideas(id)` (ON DELETE SET NULL)
*   **Indexes:**
    *   `idx_hubs_creator_id` (`creator_id`)
    *   `idx_hubs_idea_id` (`idea_id`)
    *   `idx_hubs_is_public` (`is_public`)
*   **Triggers:** `set_hubs_timestamp` (BEFORE UPDATE, calls `public.trigger_set_timestamp`)
*   **Policies:**
    *   `Allow authenticated users to create hubs` (INSERT)
    *   `Allow creators to delete their hubs` (DELETE)
    *   `Allow creators to update their hubs` (UPDATE)
    *   `Allow users to view public or own/member hubs` (SELECT)

---

## Table: `public.idea_comments`

*   **Description:** Stores comments on saved ideas.
*   **RLS:** Enabled

| Column       | Type          | Default             | Nullable | Description |
| ------------ | ------------- | ------------------- | -------- | ----------- |
| `id`         | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `idea_id`    | `uuid`        |                     | Yes      | Foreign Key to `saved_ideas` |
| `user_id`    | `uuid`        |                     | Yes      | Foreign Key to `auth.users` (commenter) |
| `content`    | `text`        |                     | No       | Comment content |
| `created_at` | `timestamptz` | `now()`             | Yes      | Timestamp of creation |
| `updated_at` | `timestamptz` | `now()`             | Yes      | Timestamp of last update |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `idea_id` -> `public.saved_ideas(id)` (ON DELETE CASCADE)
    *   `user_id` -> `auth.users(id)` (ON DELETE CASCADE)
*   **Triggers:** `set_idea_comments_updated_at` (BEFORE UPDATE, calls `public.update_updated_at_column`)
*   **Policies:**
    *   `Members can comment on hub ideas` (INSERT)

---

## Table: `public.saved_ideas`

*   **Description:** Stores ideas saved/bookmarked by users.
*   **RLS:** Enabled

| Column        | Type          | Default             | Nullable | Description |
| ------------- | ------------- | ------------------- | -------- | ----------- |
| `id`          | `uuid`        | `gen_random_uuid()` | No       | Unique identifier for the saved idea. |
| `user_id`     | `uuid`        |                     | No       | The user who saved the idea. Foreign Key to `auth.users`. |
| `title`       | `text`        |                     | Yes      | Optional title for the saved idea. |
| `content`     | `text`        |                     | No       | The main content of the saved idea. |
| `created_at`  | `timestamptz` | `now()`             | No       | Timestamp when the idea was saved. |
| `category`    | `text`        |                     | Yes      | Category of the idea |
| `tags`        | `text[]`      |                     | Yes      | Array of tags |
| `status`      | `text`        | `'draft'`           | Yes      | Status of the idea (e.g., 'draft', 'published') |
| `visibility`  | `text`        | `'private'`         | Yes      | Visibility setting (e.g., 'private', 'public') |
| `updated_at`  | `timestamptz` | `now()`             | Yes      | Timestamp of last update |
| `voice_note_id`| `uuid`       |                     | Yes      | Foreign Key to `voice_notes` (originating voice note) |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `user_id` -> `auth.users(id)` (ON DELETE CASCADE)
    *   `voice_note_id` -> `public.voice_notes(id)`
*   **Triggers:** `set_saved_ideas_updated_at` (BEFORE UPDATE, calls `public.update_updated_at_column`)
*   **Policies:**
    *   `Allow public read access to all ideas` (SELECT)
    *   `Allow users to delete their own saved ideas` (DELETE)
    *   `Allow users to insert their own saved ideas` (INSERT)
    *   `Allow users to read their own saved ideas (old)` (SELECT)
    *   `Allow users to update their own saved ideas` (UPDATE)
    *   `Users can view ideas shared with their hubs` (SELECT)
    *   `Users can view their own ideas` (SELECT)

---

## Table: `public.voice_notes`

*   **Description:** Stores voice recordings and associated data like transcripts and generated ideas.
*   **RLS:** Enabled

| Column        | Type          | Default             | Nullable | Description |
| ------------- | ------------- | ------------------- | -------- | ----------- |
| `id`          | `uuid`        | `gen_random_uuid()` | No       | Primary Key |
| `user_id`     | `uuid`        |                     | Yes      | Foreign Key to `auth.users` |
| `audio_url`   | `text`        |                     | Yes      | URL to the audio file |
| `transcript`  | `text`        |                     | Yes      | Text transcription of the audio |
| `created_at`  | `timestamptz` | `now()`             | Yes      | Timestamp of creation |
| `duration`    | `numeric`     |                     | Yes      | Duration of the audio recording |
| `business_idea`| `text`       |                     | Yes      | AI-generated business idea from the transcript |
| `archived`    | `boolean`     | `false`             | Yes      | Whether the note is archived |
| `prd_content` | `text`        |                     | Yes      | Generated Product Requirements Document content |
| `idea_id`     | `uuid`        |                     | Yes      | Foreign Key to `saved_ideas` (generated/linked idea) |
| `saved_idea_id`| `uuid`       |                     | Yes      | Foreign Key to `saved_ideas` (when saved explicitly) |

*   **Primary Key:** `id`
*   **Foreign Keys:**
    *   `user_id` -> `auth.users(id)` (ON DELETE CASCADE)
    *   `idea_id` -> `public.saved_ideas(id)` (ON DELETE SET NULL)
    *   `saved_idea_id` -> `public.saved_ideas(id)`
*   **Indexes:** `idx_voice_notes_idea_id` (`idea_id`)
*   **Policies:**
    *   `Allow anon read access to all voice notes` (SELECT)
    *   `Allow authenticated users to insert data` (INSERT)
    *   `Allow authenticated users to select data` (SELECT)
    *   `Allow authenticated users to update their own notes` (UPDATE)
    *   `Allow public read access to all voice notes with saved ideas` (SELECT)

---

## Other Objects

*   **Triggers:** Several triggers exist (e.g., `set_hubs_timestamp`, `set_saved_ideas_updated_at`) primarily to update `updated_at` columns automatically. These call functions like `public.trigger_set_timestamp` and `public.update_updated_at_column`.
*   **Functions:** `public.trigger_set_timestamp`, `public.update_updated_at_column` (definitions not provided in the dump).
*   **RLS Policies:** Numerous policies are defined to control row-level access based on user authentication, roles (creator, member), and hub status (public/private). See individual table sections for details.
*   **Missing Table:** The `CREATE TABLE` statement for `public.audio_files` was not included in the provided dump, although its primary key constraint was defined.
