# Setting Up Local Supabase

## Prerequisites

To run Supabase locally, you need:
1. **Docker Desktop** - Download from: https://docs.docker.com/desktop/install/windows-install/
2. **Docker Desktop running** - Make sure it's started before running Supabase commands

## Steps to Start Local Supabase

### 1. Install Docker Desktop
- Download: https://docs.docker.com/desktop/install/windows-install/
- Install and start Docker Desktop
- Wait for Docker to fully start (whale icon in system tray)

### 2. Start Local Supabase
```bash
supabase start
```

This will:
- Pull Docker images
- Start all Supabase services (Postgres, Auth, Storage, etc.)
- Provide local connection details

### 3. Apply Migrations Locally
```bash
supabase db reset
```
This applies all migrations in `supabase/migrations/` to your local database.

### 4. Access Local Supabase
- API URL: http://localhost:54321
- Studio: http://localhost:54323
- Anon Key: (shown after `supabase start`)

## Alternative: Use Remote Supabase (Current Setup)

Since you already have a remote Supabase project linked, you can:
1. Apply migrations via SQL Editor (recommended - most reliable)
2. Or fix CLI connection issues to use `supabase db push`

## Current Status

- ✅ Project linked: IT-DEPTLIB (bnsbbqpokhgqukwiwnqb)
- ✅ Config updated
- ✅ Edge functions deployed
- ⏳ Database migrations pending (use SQL Editor method)




