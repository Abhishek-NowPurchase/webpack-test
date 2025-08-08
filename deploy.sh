#!/bin/bash

echo "🚀 Building React Hello World App..."

# Build the application
npm run build

echo "✅ Build completed!"

# Check if build was successful
if [ -d "dist" ]; then
    echo "📁 Build output found in dist/ directory"
    echo "🌐 You can now deploy the contents of the dist/ folder to:"
    echo "   - Netlify (drag and drop dist/ folder)"
    echo "   - Vercel (connect repository)"
    echo "   - GitHub Pages"
    echo "   - AWS S3"
    echo "   - Any static hosting service"
else
    echo "❌ Build failed - dist/ directory not found"
    exit 1
fi 