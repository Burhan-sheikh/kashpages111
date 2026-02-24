#!/bin/bash

# Quick script to deploy Firebase security rules
# Run this after updating firestore.rules or storage.rules

echo "🔥 Deploying Firebase Security Rules..."
echo ""

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found!"
    echo "Install it with: npm install -g firebase-tools"
    echo "Then run: firebase login"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null
then
    echo "❌ Not logged into Firebase!"
    echo "Run: firebase login"
    exit 1
fi

echo "📋 Current Firebase project:"
firebase use
echo ""

# Deploy rules
echo "⬆️  Deploying Firestore and Storage rules..."
firebase deploy --only firestore:rules,storage

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rules deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Clear your browser cache"
    echo "2. Hard refresh your app (Ctrl+Shift+R or Cmd+Shift+R)"
    echo "3. Test sign in/sign up"
    echo "4. Try uploading images in Shop Setup"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above."
    exit 1
fi
