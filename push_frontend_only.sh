#!/bin/bash

echo "🧹 Setting up frontend-only repository..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "Created temp directory: $TEMP_DIR"

# Copy only frontend files to temp directory
echo "📁 Copying frontend files..."
cp -r ./* "$TEMP_DIR/" 2>/dev/null || true
cp -r ./.* "$TEMP_DIR/" 2>/dev/null || true

# Move to temp directory
cd "$TEMP_DIR"

# Initialize new git repo
echo "🔧 Initializing clean git repository..."
git init
git remote add origin https://github.com/amondbymond/amond-frontend.git

# Add all frontend files
git add .
git commit -m "Initial commit: Frontend files only"

# Force push to overwrite the repository
echo "🚀 Force pushing to clean the repository..."
git branch -M main
git push -u origin main --force

echo "✅ Done! The amond-frontend repository now contains only frontend files."
echo "⚠️  Note: This force push has overwritten the repository history."