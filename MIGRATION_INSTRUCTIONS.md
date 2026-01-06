# Database Migration Instructions

## ✅ Configuration Complete

Your Supabase project has been configured:
- **Project URL:** https://bnsbbqpokhgqukwiwnqb.supabase.co
- **Project ID:** bnsbbqpokhgqukwiwnqb
- **Config updated:** `supabase/config.toml`

## 📋 Next Steps: Apply Migrations

### Option 1: Using Supabase SQL Editor (Recommended - Most Reliable)

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/bnsbbqpokhgqukwiwnqb/sql/new

2. **Run the Migration Script:**
   - Open the file: `scripts/complete-migration.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Migration:**
   - The script will create all tables, functions, policies, and triggers
   - Check for any errors in the output
   - If successful, you'll see "Migration Complete!" at the end

### Option 2: Using Supabase CLI (If connection works)

```bash
# Try applying migrations via CLI
supabase db push

# If that fails, deploy functions separately
supabase functions deploy seed-librarian
supabase functions deploy send-sms
```

## 🔍 Verification

After migration, verify everything is set up correctly:

1. **Check Tables:**
   - Go to: https://supabase.com/dashboard/project/bnsbbqpokhgqukwiwnqb/editor
   - You should see: `profiles`, `books`, `borrows`, `magazines`, `journals`, `csp_project_files`

2. **Check Storage:**
   - Go to: https://supabase.com/dashboard/project/bnsbbqpokhgqukwiwnqb/storage/buckets
   - You should see: `csp-files` bucket

3. **Run Verification SQL:**
   - Open: `scripts/verify-migration.sql`
   - Run in SQL Editor to check all components

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://bnsbbqpokhgqukwiwnqb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuc2JicXBva2hncXVrd2l3bnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTk0MTUsImV4cCI6MjA4MzE5NTQxNX0.WjApWmd-76-ez7aN0eYpG-Kc3E5IzIM9MGdfkqg8lW4
```

**Note:** `.env.local` is in `.gitignore` for security. You'll need to create it manually.

## 🚀 Deploy Edge Functions

After database migration, deploy the edge functions:

1. **Deploy seed-librarian function:**
   ```bash
   supabase functions deploy seed-librarian
   ```

2. **Deploy send-sms function:**
   ```bash
   supabase functions deploy send-sms
   ```

3. **Set function secrets (if needed):**
   - For SMS function, you may need to set Twilio credentials:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your_sid
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   supabase secrets set TWILIO_PHONE_NUMBER=your_number
   ```

## ✅ Migration Checklist

- [x] Project linked to Supabase CLI
- [x] Config file updated with new project ID
- [ ] Database migrations applied (via SQL Editor or CLI)
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] Verification checks passed

## 🆘 Troubleshooting

### If SQL Editor shows errors:
- Check if any objects already exist (the script handles this with IF NOT EXISTS)
- Some errors about existing policies are normal - they're dropped and recreated
- Storage bucket creation might show a notice if it already exists (this is OK)

### If CLI connection fails:
- Use the SQL Editor method instead (Option 1)
- Make sure you're logged in: `supabase login`
- Check your network connection

### If functions fail to deploy:
- Make sure you have the correct permissions
- Check that the function code is correct
- Verify you're linked to the right project

## 📝 What Was Migrated

✅ **Tables:**
- profiles (user information)
- books (library books)
- borrows (borrowing records)
- magazines (magazine collection)
- journals (journal collection)
- csp_project_files (CSP project files)

✅ **Functions:**
- is_librarian() - Check if user is librarian
- is_active_user() - Check if user is active
- get_profile_for_login() - Login helper
- update_updated_at_column() - Timestamp updater
- decrease_book_copies() - Book copy management
- increase_book_copies() - Book copy management

✅ **Security:**
- Row Level Security (RLS) enabled on all tables
- Policies for authenticated users
- Librarian-only write access
- Public read access where appropriate

✅ **Storage:**
- csp-files bucket for CSP project files
- Storage policies for file access




