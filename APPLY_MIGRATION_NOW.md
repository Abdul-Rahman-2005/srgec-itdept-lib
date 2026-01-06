# 🚀 Apply Database Migration - Quick Guide

## Step 1: Open Supabase SQL Editor

Click this link to open your SQL Editor:
**https://supabase.com/dashboard/project/bnsbbqpokhgqukwiwnqb/sql/new**

## Step 2: Copy the Migration Script

1. Open the file: `scripts/complete-migration.sql`
2. Select ALL contents (Ctrl+A)
3. Copy (Ctrl+C)

## Step 3: Paste and Run

1. Paste into the SQL Editor
2. Click the **Run** button (or press Ctrl+Enter)
3. Wait for execution to complete

## Step 4: Verify Success

You should see:
- ✅ No errors in the output
- ✅ Message showing successful execution
- ✅ All tables created in the Table Editor

## Quick Verification

After migration, run this in SQL Editor to verify:

```sql
-- Quick check - should return 6 tables
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'books', 'borrows', 'magazines', 'journals', 'csp_project_files');
```

Expected result: `table_count = 6`

## What Happens During Migration

The script will:
1. ✅ Create 3 enums (user_role, user_status, borrow_status)
2. ✅ Create 6 tables (profiles, books, borrows, magazines, journals, csp_project_files)
3. ✅ Create 6 functions (is_librarian, is_active_user, get_profile_for_login, etc.)
4. ✅ Enable Row Level Security on all tables
5. ✅ Create security policies for authenticated access
6. ✅ Create triggers for automatic timestamp updates
7. ✅ Create storage bucket for CSP files

**The script is safe to run multiple times** - it uses `IF NOT EXISTS` and `CREATE OR REPLACE` where appropriate.

## Need Help?

If you encounter any errors:
1. Check the error message - it will tell you what failed
2. Common issues:
   - "already exists" - This is OK, the script handles it
   - "permission denied" - Check your project access
   - "syntax error" - Check if you copied the entire script




