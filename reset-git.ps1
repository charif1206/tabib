#!/usr/bin/env pwsh
# Reset git repository and force push to origin
# This script wipes local history, reinitializes, and force-pushes clean state

$projectPath = "C:\Users\InfoBulles\Desktop\tabib_res"
$gitRemote = "https://github.com/charif1206/tabib.git"
$gitBranch = "main"

Write-Output "=========================================="
Write-Output "Git Repository Clean Reset Script"
Write-Output "=========================================="
Write-Output "Project: $projectPath"
Write-Output "Remote:  $gitRemote"
Write-Output "Branch:  $gitBranch"
Write-Output "=========================================="
Write-Output ""

Set-Location $projectPath

# Step 1: Remove .git folder (wipe history)
Write-Output "[1/5] Removing .git directory (wiping all history)..."
if (Test-Path ".git" -PathType Container) {
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction Stop
    Write-Output "Removed .git directory"
} else {
    Write-Output ".git directory not found (already removed)"
}

Write-Output ""

# Step 2: Reinitialize git
Write-Output "[2/5] Reinitializing git repository..."
git init | Out-Null
Write-Output "Git repository reinitialized"

Write-Output ""

# Step 3: Configure git user
Write-Output "[3/5] Configuring git user..."
git config user.email "dev@tabib.local" | Out-Null
git config user.name "Tabib Dev" | Out-Null
Write-Output "Git user configured"

Write-Output ""

# Step 4: Add files respecting .gitignore
Write-Output "[4/5] Adding files (respecting .gitignore)..."
git add -A
$stagedCount = (git diff --cached --name-only | Measure-Object -Line).Lines
Write-Output "Files staged: $stagedCount"

Write-Output ""

# Step 5: Create initial commit
Write-Output "[5/5] Creating initial commit..."
git commit -m "Initial commit" --quiet
Write-Output "Initial commit created"

Write-Output ""

# Step 6: Set remote origin
Write-Output "[6/6] Setting remote origin..."
$remoteExists = git remote get-url origin 2>&1 | Select-String "fatal" -Quiet
if (-not $remoteExists) {
    git remote remove origin 2>&1 | Out-Null
}
git remote add origin $gitRemote
Write-Output "Remote origin configured"

Write-Output ""

# Step 7: Rename branch to main
Write-Output "[7/7] Renaming branch to main..."
git branch -M main
Write-Output "Branch renamed to main"

Write-Output ""
Write-Output "=========================================="
Write-Output "Force pushing to origin/main..."
Write-Output "=========================================="
Write-Output ""

git push -f -u origin main

Write-Output ""
Write-Output "=========================================="
Write-Output "SUCCESS!"
Write-Output "=========================================="
Write-Output ""
Write-Output "Repository Status:"
git --no-pager log --oneline -3
Write-Output ""
Write-Output "Remote Status:"
git remote -v

