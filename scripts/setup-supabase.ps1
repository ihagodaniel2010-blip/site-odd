param(
  [Parameter(Mandatory = $true)]
  [string]$AccessToken,

  [Parameter(Mandatory = $false)]
  [string]$ProjectRef = "npphcarhvobjsvdsjsyz"
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Setting token in current session..."
$env:SUPABASE_ACCESS_TOKEN = $AccessToken

Write-Host "[2/6] Verifying Supabase CLI..."
npx supabase --version

Write-Host "[3/6] Linking project $ProjectRef..."
npx supabase link --project-ref $ProjectRef

Write-Host "[4/6] Pushing migrations..."
npx supabase db push

Write-Host "[5/6] Listing migrations..."
npx supabase migration list

Write-Host "[6/6] Basic REST health-check for admin tables..."
$envLocalPath = Join-Path (Get-Location) ".env.local"
$envPath = Join-Path (Get-Location) ".env"

if (Test-Path $envLocalPath) {
  $envPath = $envLocalPath
} elseif (-not (Test-Path $envPath)) {
  throw "Neither .env.local nor .env was found in current directory"
}

$envContent = Get-Content $envPath
$urlLine = $envContent | Where-Object { $_ -match '^VITE_SUPABASE_URL=' } | Select-Object -First 1
$keyLine = $envContent | Where-Object { $_ -match '^VITE_SUPABASE_ANON_KEY=' } | Select-Object -First 1

if (-not $urlLine -or -not $keyLine) {
  throw "VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in environment file"
}

$baseUrl = ($urlLine -split '=', 2)[1].Trim('"')
$anonKey = ($keyLine -split '=', 2)[1].Trim('"')

$tables = @(
  "site_settings",
  "estimate_requests",
  "pricing_rules",
  "areas_served",
  "customers",
  "services",
  "portfolio_items",
  "media_assets",
  "messages"
)

$headers = @{
  "apikey" = $anonKey
  "Authorization" = "Bearer $anonKey"
}

foreach ($t in $tables) {
  $uri = "$baseUrl/rest/v1/$t?select=id&limit=1"
  try {
    $res = Invoke-WebRequest -Uri $uri -Headers $headers -Method Get -UseBasicParsing
    Write-Host "OK  $t  -> HTTP $($res.StatusCode)"
  }
  catch {
    $statusCode = "ERR"
    $body = ""

    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    }

    if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
      $body = $_.ErrorDetails.Message
    }

    Write-Host "FAIL $t -> HTTP $statusCode $body"
  }
}

Write-Host "Done."
