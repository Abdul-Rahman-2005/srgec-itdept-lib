#!/bin/bash

# Migration Script for Supabase Database
# This script safely migrates the database from Lovable cloud to your Supabase project

set -e  # Exit on error

echo "🚀 Starting Supabase Migration Process"
echo "======================================"

# Check if project ref is provided
if [ -z "$1" ]; then
    echo "❌ Error: Project reference ID required"
    echo "Usage: ./scripts/migrate-to-supabase.sh YOUR_PROJECT_REF"
    echo ""
    echo "Get your project ref from: https://supabase.com/dashboard → Your Project → Settings → General"
    exit 1
fi

PROJECT_REF=$1

echo ""
echo "📋 Step 1: Linking to Supabase project..."
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "📋 Step 2: Verifying migrations..."
echo "The following migrations will be applied:"
ls -1 supabase/migrations/

echo ""
read -p "Continue with migration? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

echo ""
echo "📋 Step 3: Applying migrations..."
supabase db push

echo ""
echo "📋 Step 4: Deploying edge functions..."
supabase functions deploy seed-librarian
supabase functions deploy send-sms

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with:"
echo "   VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "   VITE_SUPABASE_PUBLISHABLE_KEY=<your_anon_key>"
echo ""
echo "2. Get your keys from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""
echo "3. Update supabase/config.toml with your new project_id: $PROJECT_REF"




