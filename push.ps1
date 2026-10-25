param(
    [string]$Message = "Update StudyMind AI"
)

$ErrorActionPreference = "Stop"

Write-Host "Syncing StudyMind AI with GitHub..."

git add .

$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes to commit. Working tree is clean and up to date."
    exit 0
}

Write-Host "Committing: $Message"
git commit -m "$Message"

Write-Host "Pushing to GitHub..."
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!"
} else {
    Write-Host "Push failed. Please check the error above."
}
