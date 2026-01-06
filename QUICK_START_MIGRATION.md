# Quick Start: Migrate to Your Supabase Project

## Step 1: Get Your Project Reference ID

1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnopqrst`)

## Step 2: Run the Migration

### Option A: Using PowerShell Script (Windows)
```powershell
.\scripts\migrate-to-supabase.ps1 -ProjectRef "YOUR_PROJECT_REF"
```

### Option B: Manual Steps
```bash
# 1. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Apply migrations
supabase db push

# 3. Deploy edge functions
supabase functions deploy seed-librarian
supabase functions deploy send-sms
```

## Step 3: Update Configuration

After linking, update `supabase/config.toml`:
```toml
project_id = "YOUR_PROJECT_REF"
```

## Step 4: Set Environment Variables

Create `.env.local` file:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

Get your keys from: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api

## Step 5: Verify Migration

Run the verification SQL in Supabase SQL Editor:
- Open: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql/new
- Copy and run: `scripts/verify-migration.sql`

## Troubleshooting

### If linking fails:
- Make sure you're logged in: `supabase login`
- Verify your project ref is correct
- Check you have access to the project

### If migrations fail:
- Check the error in Supabase dashboard → Database → Migrations
- Some migrations may need to be adjusted if objects already exist
- Storage bucket creation might need manual intervention

### If functions fail to deploy:
- Make sure you have the correct permissions
- Check function secrets are set if needed




