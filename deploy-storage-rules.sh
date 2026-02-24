#!/bin/bash

# Deploy Firebase Storage Rules
echo "🚀 Deploying Firebase Storage Rules..."
echo "=========================================="

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo ""
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase!"
    echo ""
    echo "Login with: firebase login"
    exit 1
fi

echo "📋 Current storage rules:"
cat storage.rules
echo ""
echo "=========================================="

# Deploy storage rules
echo "⬆️  Deploying storage rules..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Storage rules deployed successfully!"
    echo ""
    echo "🎉 The 412 error should now be fixed."
    echo "Try uploading images again."
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  1. Make sure you're in the project root directory"
    echo "  2. Check that firebase.json exists"
    echo "  3. Verify you have permissions for the project"
    exit 1
fi
