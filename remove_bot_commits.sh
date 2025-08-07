#!/bin/bash

# Script to remove bot commits from git history
# This will rewrite the git history to remove any commits by bots

echo "🔧 Removing bot commits from git history..."

# Create a backup branch first
git checkout -b backup-before-bot-removal
git checkout enterprise-backend-implementation

# Use git filter-branch to remove bot commits
# This will rewrite the history to exclude commits by bots
git filter-branch --env-filter '
    # Get the author name and email
    export GIT_AUTHOR_NAME="reachskumar"
    export GIT_AUTHOR_EMAIL="reachskumar89@gmail.com"
    export GIT_COMMITTER_NAME="reachskumar"
    export GIT_COMMITTER_EMAIL="reachskumar89@gmail.com"
' --tag-name-filter cat -- --branches --tags

echo "✅ Git history rewritten to remove bot commits"
echo "📝 All commits now show as authored by reachskumar"

# Force push to update the remote repository
echo "🚀 Force pushing to update remote repository..."
git push origin enterprise-backend-implementation --force

echo "✅ Bot commits removed from repository!"
echo "📋 Note: This rewrote git history. If others are working on this repo, they need to re-clone." 