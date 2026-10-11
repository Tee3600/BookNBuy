# One-shot local DB bring-up (run AFTER native Postgres 16 is installed).
# Requires: psql on PATH (installer adds it), Node 20+.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/setup-local-db.ps1
$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  # random 32+ char Better Auth secret
  $secret = -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
  (Get-Content .env) -replace 'BETTER_AUTH_SECRET="change-me-in-dev-min-32-chars"', "BETTER_AUTH_SECRET=`"$secret`"" | Set-Content .env -Encoding utf8
  Write-Host "Created .env (edit it to add R2 / Paystack / Termii keys)."
}

# postgres superuser password was set during install; default below matches README.
if (-not $env:PGPASSWORD) { $env:PGPASSWORD = "booknbuy" }
psql -U postgres -h localhost -c "DO `$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='booknbuy') THEN CREATE ROLE booknbuy LOGIN PASSWORD 'booknbuy'; END IF; END `$\$;"
psql -U postgres -h localhost -c "SELECT '1' FROM pg_database WHERE datname='booknbuy'" -t | ForEach-Object { if ($_ -notmatch "1") { psql -U postgres -h localhost -c "CREATE DATABASE booknbuy OWNER booknbuy;" } }
Write-Host "Role + database ready."

npm.cmd run db:migrate 2>&1 | Select-Object -Last 5
npm.cmd run db:seed 2>&1 | Select-Object -Last 3
Write-Host "Migrated + seeded. Restart dev server: npm.cmd run dev"
