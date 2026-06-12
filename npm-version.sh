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

# 3. Run npm version and capture the output
# The output looks like: v3.0.6
NEW_VERSION=$(npm version "$VERSION_TYPE" -w "$PACKAGE_NAME" --no-git-tag-version)
# Clean the 'v' prefix if npm returns it (npm usually returns vX.Y.Z)
VERSION_NUMBER=${NEW_VERSION#v}

echo "Version updated to $VERSION_NUMBER"

# 4. Git operations
git add .
git commit -m "fix($PACKAGE_NAME): v$VERSION_NUMBER"
git tag "$PACKAGE_NAME@$VERSION_NUMBER"

echo "Pushing changes..."
git push
git push origin --tags

echo "Successfully published $PACKAGE_NAME v$VERSION_NUMBER"
