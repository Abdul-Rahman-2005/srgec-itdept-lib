# Migration Script for Supabase Database (PowerShell)
# This script safely migrates the database from Lovable cloud to your Supabase project

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Supabase Migration Process" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Step 1: Linking to Supabase project..." -ForegroundColor Yellow
supabase link --project-ref $ProjectRef

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link to project" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Step 2: Verifying migrations..." -ForegroundColor Yellow
Write-Host "The following migrations will be applied:" -ForegroundColor White
Get-ChildItem -Path "supabase\migrations" -Filter "*.sql" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
$confirm = Read-Host "Continue with migration? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📋 Step 3: Applying migrations..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Step 4: Deploying edge functions..." -ForegroundColor Yellow
supabase functions deploy seed-librarian
supabase functions deploy send-sms

Write-Host ""
Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your .env.local file with:" -ForegroundColor White
Write-Host "   VITE_SUPABASE_URL=https://$ProjectRef.supabase.co" -ForegroundColor Gray
Write-Host "   VITE_SUPABASE_PUBLISHABLE_KEY=<your_anon_key>" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get your keys from: https://supabase.com/dashboard/project/$ProjectRef/settings/api" -ForegroundColor White
Write-Host ""
Write-Host "3. Update supabase/config.toml with your new project_id: $ProjectRef" -ForegroundColor White




