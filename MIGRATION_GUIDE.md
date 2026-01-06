# Database Migration Guide: Lovable Cloud → Your Supabase Project

## Prerequisites
- Supabase CLI installed (✅ Version 2.67.3)
- Your Supabase project created at https://supabase.com
- Project Reference ID from your Supabase dashboard

## Migration Steps

### Step 1: Get Your Supabase Project Reference
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (format: `abcdefghijklmnopqrst`)

### Step 2: Link to Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 3: Review Migrations
The following migrations will be applied in order:
1. `20251204154755_822a4a91-690b-45be-8734-908dc6449ad9.sql` - Core schema (profiles, books, borrows, RLS policies)
2. `20251206140943_94fcbe91-3356-4468-a26a-2fb845f5e5f0.sql` - Login function
3. `20260101145219_f16148a7-10a0-41eb-a06b-7042a3dd0d23.sql` - Magazines, journals, CSP projects
4. `20260105141541_8a4fad6b-8336-4dc7-b673-7f032a20c071.sql` - Book code column

### Step 4: Apply Migrations
```bash
supabase db push
```

### Step 5: Deploy Edge Functions
```bash
supabase functions deploy seed-librarian
supabase functions deploy send-sms
```

### Step 6: Update Environment Variables
Create a `.env.local` file with:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## Important Notes
- ⚠️ This will create a fresh database - existing data will not be migrated
- ✅ Migrations are idempotent where possible
- ✅ RLS policies are included for security
- ✅ Storage bucket for CSP files will be created

## Verification
After migration, verify:
- [ ] All tables created (profiles, books, borrows, magazines, journals, csp_project_files)
- [ ] RLS policies active
- [ ] Edge functions deployed
- [ ] Storage bucket created




