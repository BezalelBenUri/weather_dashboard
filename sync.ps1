param(
    [string]$Message = "",
    [string]$PrimaryRemote = "origin",
    [string]$PrimaryRepoUrl = "",
    [string]$PrimaryBranch = "",
    [string]$SecondaryRemote = "OEA",
    [string]$SecondaryRepoUrl = "",
    [string]$SecondaryBranch = "",
    [switch]$SingleCommit
)

$ErrorActionPreference = "Stop"

function Ensure-GitRepo {
    git rev-parse --is-inside-work-tree | Out-Null
}

function Get-CurrentBranch {
    $branch = git branch --show-current
    if (-not $branch) {
        throw "Unable to determine the current branch."
    }

    return $branch.Trim()
}

function Get-ChangedLines {
    $lines = @(git status --porcelain)
    return $lines | Where-Object { $_ -and $_.Trim() }
}

function Get-ChangedPathsFromLine {
    param(
        [string]$Line
    )

    $pathPart = $Line.Substring(3).Trim()
    if (-not $pathPart) {
        return @()
    }

    if ($pathPart -match " -> ") {
        return @($pathPart -split " -> ", 2)
    }

    return @($pathPart)
}

function Ensure-Remote {
    param(
        [string]$Name,
        [string]$RepoUrl,
        [switch]$Optional
    )

    $remotes = @(git remote)
    if ($remotes -contains $Name) {
        return $true
    }

    if (-not $RepoUrl) {
        if ($Optional) {
            return $false
        }

        throw "Remote '$Name' does not exist. Pass the repo URL or create the remote first."
    }

    git remote add $Name $RepoUrl
    return $true
}

Ensure-GitRepo

$currentBranch = Get-CurrentBranch

if (-not $PrimaryBranch) {
    $PrimaryBranch = $currentBranch
}

if (-not $SecondaryBranch) {
    $SecondaryBranch = $currentBranch
}

$changes = Get-ChangedLines

if (-not $Message) {
    $Message = "chore: update $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

if (-not $changes) {
    Write-Host "No changes detected. Checking for committed work to push."
} elseif ($SingleCommit) {
    git add -A
    $staged = @(git diff --cached --name-only)
    if ($staged) {
        git commit -m $Message
    }
} else {
    $commitIndex = 0
    $commitTotal = $changes.Count

    foreach ($line in $changes) {
        $paths = Get-ChangedPathsFromLine -Line $line
        if (-not $paths) {
            continue
        }

        git add -A -- $paths
        $staged = @(git diff --cached --name-only -- $paths)
        if (-not $staged) {
            continue
        }

        $commitIndex += 1
        $commitMessage = "$Message [$commitIndex/$commitTotal]"
        git commit -m $commitMessage
    }
}

$hasPrimaryRemote = Ensure-Remote -Name $PrimaryRemote -RepoUrl $PrimaryRepoUrl
$hasSecondaryRemote = Ensure-Remote -Name $SecondaryRemote -RepoUrl $SecondaryRepoUrl -Optional

if ($hasPrimaryRemote) {
    git push $PrimaryRemote HEAD:$PrimaryBranch
}

if ($hasSecondaryRemote) {
    git push $SecondaryRemote HEAD:$SecondaryBranch
} else {
    Write-Host "Secondary remote '$SecondaryRemote' not configured yet. Skipping secondary push."
}