-- Verification Script for Database Migration
-- Run this in your Supabase SQL Editor to verify all migrations were applied correctly

-- Check if all tables exist
SELECT 
    'Tables Check' as check_type,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ All tables exist'
        ELSE '❌ Missing tables: Expected 6, Found ' || COUNT(*)::text
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'books', 'borrows', 'magazines', 'journals', 'csp_project_files');

-- Check if all enums exist
SELECT 
    'Enums Check' as check_type,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All enums exist'
        ELSE '❌ Missing enums: Expected 3, Found ' || COUNT(*)::text
    END as status
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typname IN ('user_role', 'user_status', 'borrow_status');

-- Check if RLS is enabled on all tables
SELECT 
    'RLS Check' as check_type,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ RLS enabled on all tables'
        ELSE '❌ RLS not enabled on all tables: ' || COUNT(*)::text || ' tables have RLS'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'books', 'borrows', 'magazines', 'journals', 'csp_project_files')
AND rowsecurity = true;

-- Check if functions exist
SELECT 
    'Functions Check' as check_type,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Core functions exist'
        ELSE '❌ Missing functions: Expected at least 4, Found ' || COUNT(*)::text
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_librarian', 'is_active_user', 'get_profile_for_login', 'update_updated_at_column');

-- Check if storage bucket exists
SELECT 
    'Storage Bucket Check' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ CSP files bucket exists'
        ELSE '❌ CSP files bucket not found'
    END as status
FROM storage.buckets 
WHERE id = 'csp-files';

-- List all tables with row counts (for verification)
SELECT 
    'Data Check' as check_type,
    schemaname || '.' || tablename as table_name,
    (SELECT COUNT(*) FROM information_schema.tables t2 
     WHERE t2.table_schema = schemaname AND t2.table_name = tablename) as exists,
    'Run: SELECT COUNT(*) FROM ' || tablename || ';' as count_query
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'books', 'borrows', 'magazines', 'journals', 'csp_project_files')
ORDER BY tablename;




