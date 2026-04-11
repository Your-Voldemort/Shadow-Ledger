# Shadow-Ledger Startup Script
# Starts both backend and frontend services

param(
    [switch]$Install,
    [switch]$NoInstall,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Colors for output
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Shadow-Ledger Startup Script" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check Python
    try {
        $pythonVersion = python --version 2>&1
        Write-Success "Python found: $pythonVersion"
    } catch {
        Write-Err "Python not found. Please install Python 3.8+ from python.org"
        exit 1
    }

    # Check Node.js
    try {
        $nodeVersion = node --version 2>&1
        Write-Success "Node.js found: v$nodeVersion"
    } catch {
        Write-Err "Node.js not found. Please install Node.js 18+ from nodejs.org"
        exit 1
    }

    # Check npm
    try {
        $npmVersion = npm --version 2>&1
        Write-Success "npm found: v$npmVersion"
    } catch {
        Write-Err "npm not found"
        exit 1
    }
}

# Install backend dependencies
function Install-Backend {
    $backendDir = Join-Path $ProjectRoot "backend"
    $venvDir = Join-Path $backendDir "venv"

    Write-Info "Setting up backend..."

    # Create virtual environment if it doesn't exist
    if (-not (Test-Path $venvDir)) {
        Write-Info "Creating Python virtual environment..."
        python -m venv $venvDir
        Write-Success "Virtual environment created"
    }

    # Activate virtual environment
    $venvActivate = Join-Path $venvDir "Scripts\Activate.ps1"
    if (Test-Path $venvActivate) {
        & $venvActivate
    } else {
        Write-Warn "Could not activate venv, using system Python"
    }

    # Install dependencies
    Write-Info "Installing backend dependencies..."
    pip install --upgrade pip 2>&1 | Out-Null
    pip install -r "$backendDir\requirements.txt" 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend dependencies installed"
    } else {
        Write-Err "Failed to install backend dependencies"
        exit 1
    }
}

# Install frontend dependencies
function Install-Frontend {
    $frontendDir = Join-Path $ProjectRoot "frontend"

    Write-Info "Setting up frontend..."

    # Install dependencies if node_modules doesn't exist
    if (-not (Test-Path "$frontendDir\node_modules")) {
        Write-Info "Installing frontend dependencies..."
        Push-Location $frontendDir
        npm install 2>&1 | Out-Null
        Pop-Location

        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend dependencies installed"
        } else {
            Write-Err "Failed to install frontend dependencies"
            exit 1
        }
    } else {
        Write-Success "Frontend dependencies already installed"
    }
}

# Start backend server
function Start-BackendServer {
    $backendDir = Join-Path $ProjectRoot "backend"
    $venvDir = Join-Path $backendDir "venv"
    $venvActivate = Join-Path $venvDir "Scripts\Activate.ps1"

    Write-Info "Starting backend server on http://localhost:8000..."

    # Start uvicorn in background
    if (Test-Path $venvActivate) {
        & $venvActivate
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WindowStyle Normal
    }

    Start-Sleep 2
    Write-Success "Backend server started"
}

# Start frontend server
function Start-FrontendServer {
    $frontendDir = Join-Path $ProjectRoot "frontend"

    Write-Info "Starting frontend server on http://localhost:3000..."
    Push-Location $frontendDir
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -WindowStyle Normal
    Pop-Location

    Start-Sleep 2
    Write-Success "Frontend server started"
}

# Main execution
Test-Prerequisites

if ($NoInstall) {
    Write-Info "Skipping dependency installation (--NoInstall flag)"
} else {
    if (-not $FrontendOnly) {
        Install-Backend
    }
    if (-not $BackendOnly) {
        Install-Frontend
    }
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Starting Services" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

if ($BackendOnly) {
    Start-BackendServer
} elseif ($FrontendOnly) {
    Start-FrontendServer
} else {
    Start-BackendServer
    Start-FrontendServer
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "  Services Started" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Backend API:   http://localhost:8000" -ForegroundColor Green
Write-Host "  Frontend App:  http://localhost:3000" -ForegroundColor Green
Write-Host "  API Docs:      http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta