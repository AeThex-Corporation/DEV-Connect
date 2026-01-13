# Admin Badge Implementation Analysis

## 1. Data Storage
- **Table**: `profiles`
- **Field**: `role` (Text)
- **Relevant Values**: `admin`, `site_owner`

*Note: A `user_roles` table also exists in the schema, typically used for backend RLS policies (via `check_user_role` function), but the frontend UI explicitly binds to the `profiles.role` column.*

## 2. Data Retrieval
Data is fetched using Supabase relational queries.

**Example Query:**