#!/bin/bash

echo "🚀 Deploying ALL Firebase Rules"
echo "=========================================="
echo ""

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

echo "📋 Current Firestore rules:"
head -n 10 firestore.rules
echo "..."
echo ""

echo "📋 Current Storage rules:"
head -n 10 storage.rules
echo "..."
echo ""

echo "=========================================="
echo "⬆️  Deploying BOTH Firestore AND Storage rules..."
echo ""

firebase deploy --only firestore:rules,storage

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ALL RULES DEPLOYED SUCCESSFULLY!"
    echo ""
    echo "🎉 Fixed issues:"
    echo "  ✅ Storage 412 errors (shop/avatar uploads)"
    echo "  ✅ Firestore permissions (reviews, analytics)"
    echo "  ✅ Public page write errors"
    echo ""
    echo "🧪 Test now:"
    echo "  1. Upload avatar in Profile"
    echo "  2. Upload shop cover/gallery images"
    echo "  3. Submit review on public shop page"
    echo "  4. Check no console errors"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  1. Make sure you're in the project root directory"
    echo "  2. Check that firebase.json exists"
    echo "  3. Verify you have permissions for the project"
    echo "  4. Try: firebase login --reauth"
    exit 1
fi
