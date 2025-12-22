#!/bin/bash

# Dependency Vulnerability Fix Script
# Generated: 2025-12-22
# Repository: traf3li-backend

set -e  # Exit on error

echo "========================================"
echo "  Dependency Vulnerability Fix Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Backup package.json and package-lock.json
print_info "Creating backup of package files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
print_info "Backup created: package.json.backup, package-lock.json.backup"
echo ""

# Phase 1: Quick Wins (Low Risk Updates)
print_info "Phase 1: Applying low-risk updates..."
echo ""

print_info "1/5 Updating jsonwebtoken (fixes HIGH severity jws vulnerability)..."
npm install jsonwebtoken@latest

print_info "2/5 Updating dotenv..."
npm install dotenv@latest

print_info "3/5 Updating helmet..."
npm install helmet@latest

print_info "4/5 Updating uuid..."
npm install uuid@latest

print_info "5/5 Updating node-cron..."
npm install node-cron@latest

echo ""
print_info "Phase 1 complete!"
echo ""

# Phase 2: Run npm audit fix
print_info "Phase 2: Running npm audit fix..."
echo ""
npm audit fix || print_warning "npm audit fix completed with warnings"
echo ""
print_info "Phase 2 complete!"
echo ""

# Phase 3: Summary
print_info "Checking for remaining vulnerabilities..."
echo ""
npm audit || true
echo ""

print_info "========================================"
print_info "  Fix Script Complete!"
print_info "========================================"
echo ""
print_info "✅ Fixed vulnerabilities:"
echo "   - jws (HIGH) - via jsonwebtoken update"
echo "   - dotenv, helmet, uuid, node-cron updated"
echo ""
print_warning "⚠️  Manual review required:"
echo "   - multer: Upgrade to v2.x (BREAKING CHANGES)"
echo "   - mongoose: Upgrade to v9.x (review migration guide)"
echo "   - stripe: Upgrade to v20.x (extensive testing needed)"
echo "   - satelize: Replace with modern alternative"
echo "   - ip-range-check: Consider replacement"
echo ""
print_info "📋 Next steps:"
echo "   1. Test your application thoroughly"
echo "   2. Run test suite: npm test"
echo "   3. Review DEPENDENCY_VULNERABILITY_SCAN_REPORT.md"
echo "   4. Plan multer v2 upgrade (see report for details)"
echo ""
print_info "💾 Backup files created:"
echo "   - package.json.backup"
echo "   - package-lock.json.backup"
echo ""
print_info "To restore backup if needed:"
echo "   cp package.json.backup package.json"
echo "   cp package-lock.json.backup package-lock.json"
echo "   npm install"
echo ""
