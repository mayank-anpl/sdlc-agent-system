# API smoke tests for v1 (manual verification aid — not a CI test project).
# Prerequisite: API running at https://localhost:7014
# Usage: .\scripts\run-api-smoke.ps1

$ErrorActionPreference = 'Stop'
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }

$base = 'https://localhost:7014'
$ts = Get-Date -Format 'yyyyMMddHHmmss'
$emailA = "smoke-a-$ts@test.com"
$emailB = "smoke-b-$ts@test.com"

function Write-Pass($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red; exit 1 }

$status = curl.exe -k -s -o NUL -w '%{http_code}' "$base/swagger/index.html"
if ($status -ne '200') {
    Write-Fail "API not reachable at $base (HTTP $status). Start: dotnet run --project src/NotesApp.Api --launch-profile https"
}
Write-Pass 'API reachable'

$sa = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod "$base/api/auth/register" -Method Post -ContentType 'application/json' `
    -Body (@{ email = $emailA; password = 'password123' } | ConvertTo-Json) -WebSession $sa | Out-Null
Write-Pass 'Register + session'

Invoke-RestMethod "$base/api/notes" -Method Post -ContentType 'application/json' `
    -Body '{"title":"First","body":"Body1"}' -WebSession $sa | Out-Null
$list = @(Invoke-RestMethod "$base/api/notes" -WebSession $sa)
if ($list.Count -lt 1) { Write-Fail 'List after create' }
Write-Pass 'Create + list'

Invoke-RestMethod "$base/api/auth/logout" -Method Post -WebSession $sa | Out-Null
try {
    Invoke-RestMethod "$base/api/notes" -WebSession $sa | Out-Null
    Write-Fail 'Notes after logout should 401'
} catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 401) { throw }
}
Write-Pass 'Logout + 401 on protected'

Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType 'application/json' `
    -Body (@{ email = $emailA; password = 'password123' } | ConvertTo-Json) -WebSession $sa | Out-Null
Write-Pass 'Login'

Start-Sleep -Seconds 1
Invoke-RestMethod "$base/api/notes" -Method Post -ContentType 'application/json' `
    -Body '{"title":"Second","body":"Body2"}' -WebSession $sa | Out-Null
$ordered = @(Invoke-RestMethod "$base/api/notes" -WebSession $sa)
if ($ordered.Count -lt 2) {
    Write-Fail "Expected 2 notes for order check, found $($ordered.Count)"
}
$titles = @($ordered | ForEach-Object { [string]$_.title })
if ($titles[0] -ne 'Second') {
    Write-Fail "Newest-first expected 'Second' first; got: $($titles -join ', ')"
}
Write-Pass 'Newest-first order'

$sb = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Invoke-RestMethod "$base/api/auth/register" -Method Post -ContentType 'application/json' `
    -Body (@{ email = $emailB; password = 'password123' } | ConvertTo-Json) -WebSession $sb | Out-Null
Invoke-RestMethod "$base/api/notes" -Method Post -ContentType 'application/json' `
    -Body '{"title":"B-only","body":"b"}' -WebSession $sb | Out-Null
$lb = @(Invoke-RestMethod "$base/api/notes" -WebSession $sb)
$la = @(Invoke-RestMethod "$base/api/notes" -WebSession $sa)
if ($lb.Count -ne 1 -or $la.title -contains 'B-only') { Write-Fail 'User isolation' }
Write-Pass 'Two-user isolation'

Write-Host "`nAll API smoke checks passed." -ForegroundColor Green
