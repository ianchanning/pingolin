#!/bin/bash

# Exit immediately if any command fails
set -e

# 1. Check if an argument is provided
if [ -z "$1" ]; then
  echo "Usage: ./npm-version.sh [major|minor|patch]"
  exit 1
fi

VERSION_TYPE=$1
PACKAGE_NAME="pwa"

# 2. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

echo "Bumping version..."

# 3. Run npm version (redirecting its noisy output to stderr)
npm version "$VERSION_TYPE" -w "$PACKAGE_NAME" --no-git-tag-version >&2

# Read the version directly from the workspace package.json
# This avoids parsing noisy npm CLI output
VERSION_NUMBER=$(node -p "require('./$PACKAGE_NAME/package.json').version")

echo "Version updated to $VERSION_NUMBER"

# 4. Git operations
git add .
git commit -m "fix($PACKAGE_NAME): v$VERSION_NUMBER"
# Tag matches your format: pingolin-pwa@3.0.8
git tag "pingolin-$PACKAGE_NAME@$VERSION_NUMBER"

echo "Pushing changes..."
git push
git push origin --tags

echo "Successfully published pingolin-$PACKAGE_NAME v$VERSION_NUMBER"
