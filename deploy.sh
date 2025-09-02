#!/bin/bash

echo "🚀 E-Commerce Project Deployment Script"
echo "========================================"

# Step 1: Database Migration to Supabase
echo ""
echo "📊 Step 1: Database Setup (Supabase)"
echo "-------------------------------------"
echo "1. Go to https://supabase.com"
echo "2. Create a new project"
echo "3. Get your database connection string"
echo "4. Update backend environment variables"
echo ""

# Step 2: Backend Deployment to Render
echo "⚙️ Step 2: Backend Deployment (Render)"
echo "---------------------------------------"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com"
echo "3. Connect your repository"
echo "4. Set environment variables"
echo "5. Deploy and get your backend URL"
echo ""

# Step 3: Frontend Deployment to Netlify
echo "🌐 Step 3: Frontend Deployment (Netlify)"
echo "----------------------------------------"
echo "1. Update src/config.js with production URLs"
echo "2. Build your React app: npm run build"
echo "3. Go to https://netlify.com"
echo "4. Deploy your build folder"
echo "5. Set custom domain if needed"
echo ""

echo "✅ Deployment Complete!"
echo ""
echo "🔧 Next Steps:"
echo "- Test your payment flow"
echo "- Verify CORS configuration"
echo "- Check SSL certificates"
echo "- Monitor your application"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
