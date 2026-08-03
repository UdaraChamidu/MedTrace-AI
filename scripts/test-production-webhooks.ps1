param(
  [string]$EnvFile = ".env",
  [string]$BaseUrl = "",
  [string]$PatientId = "00000000-0000-4000-8000-000000000001",
  [string]$JobId = "00000000-0000-4000-8000-000000000010",
  [string]$ThreadId = "00000000-0000-4000-8000-000000000020"
)

$ErrorActionPreference = "Stop"

function Read-EnvValue {
  param([string]$Path, [string]$Name)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  $line = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -replace "^$Name=", "").Trim()
}

if (-not $BaseUrl) {
  $BaseUrl = Read-EnvValue -Path $EnvFile -Name "VITE_N8N_BASE_URL"
}

if (-not $BaseUrl) {
  throw "VITE_N8N_BASE_URL is empty. Pass -BaseUrl or set it in .env."
}

$BaseUrl = $BaseUrl.TrimEnd("/")
$processUrl = "$BaseUrl/webhook/process-records"
$askUrl = "$BaseUrl/webhook/ask-record"

Write-Host "Testing MedTrace AI production webhooks..." -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"

$processBody = @{
  patient_id = $PatientId
  job_id = $JobId
  document_ids = @()
} | ConvertTo-Json

try {
  $processResponse = Invoke-RestMethod `
    -Method Post `
    -Uri $processUrl `
    -ContentType "application/json" `
    -Body $processBody

  if ($processResponse.accepted -ne $true -or $processResponse.status -ne "queued") {
    throw "Unexpected process-records response: $($processResponse | ConvertTo-Json -Compress)"
  }
  Write-Host "PASS process-records returned accepted/queued." -ForegroundColor Green
} catch {
  Write-Host "FAIL process-records" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

$askBody = @{
  patient_id = $PatientId
  thread_id = $ThreadId
  question = "Was aspirin prescribed despite an earlier allergy?"
} | ConvertTo-Json

try {
  $askResponse = Invoke-RestMethod `
    -Method Post `
    -Uri $askUrl `
    -ContentType "application/json" `
    -Body $askBody

  if (-not $askResponse.answer_status -or -not $askResponse.safety_message) {
    throw "Unexpected ask-record response: $($askResponse | ConvertTo-Json -Compress)"
  }
  Write-Host "PASS ask-record returned answer_status=$($askResponse.answer_status)." -ForegroundColor Green
} catch {
  Write-Host "FAIL ask-record" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

Write-Host "Webhook smoke test complete." -ForegroundColor Cyan
