# SnakeShop Frontend - Vercel Deployment Guide

## 🚀 Vercel Deployment Steps

### 1. Prerequisites
- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub account
- Node.js installed locally

### 2. Prepare for Deployment

#### Environment Variables
Create a `.env.local` file in the root directory:
```bash
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

#### Build Test
Test the build locally:
```bash
npm install
npm run build
npm run preview
```

### 3. Deploy to Vercel

#### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: snakeshop-frontend
# - Directory: ./
# - Override settings? N
```

#### Method 2: GitHub Integration
1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `NotificationFrontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 4. Environment Variables Setup

In Vercel Dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.vercel.app`
   - **Environment**: Production, Preview, Development

### 5. Domain Configuration

#### Custom Domain (Optional)
1. Go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

#### Default Domain
Vercel will provide: `https://your-project-name.vercel.app`

### 6. Backend Integration

Make sure your backend is also deployed and update the API URL:
```javascript
// In src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 7. Testing Deployment

1. Visit your deployed URL
2. Test all features:
   - User registration/login
   - Product browsing
   - Order placement
   - Admin panel access
   - Notifications

### 8. Troubleshooting

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variables
- Ensure all `REACT_APP_` prefixed variables are set
- Redeploy after adding new environment variables

#### CORS Issues
- Update backend CORS settings to include your Vercel domain
- Check API endpoints are accessible

### 9. Performance Optimization

#### Build Optimization
- Images are automatically optimized by Vercel
- Static assets are cached
- CDN distribution is automatic

#### Monitoring
- Use Vercel Analytics for performance monitoring
- Check Function logs for API issues

## 📱 Features Deployed

- ✅ User Authentication (Admin/Customer)
- ✅ Product Management
- ✅ Order System
- ✅ Real-time Notifications
- ✅ Responsive Design
- ✅ Admin Dashboard
- ✅ Customer Product Browsing

## 🔗 Quick Links

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.vercel.app`
- **Admin Login**: `admin@snakeshop.com` / `admin123`
- **Customer Login**: `customer@snakeshop.com` / `customer123`

## 📞 Support

For deployment issues, check:
1. Vercel documentation
2. Build logs in Vercel dashboard
3. Environment variables configuration
4. Backend API connectivity