# 🚀 Deployment Guide

This guide covers deploying GetFreeCopy 2.0 to various platforms.

## 🎯 Vercel (Recommended)

### One-Click Deployment

1. **Click the deploy button** in the README
2. **Connect your GitHub account**
3. **Configure the project:**
   - Project Name: `getfreecopy`
   - Framework Preset: `Other`
   - Root Directory: `./`
4. **Deploy!**

### Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

The `vercel.json` file is already configured for optimal deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🏗️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone <your-repo-url>
cd GetFreeCopy2.0

# Install dependencies
npm run install:all

# Start development
npm run dev
```

### Development URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/health

## 🔧 Build Process

### Build Commands

```bash
# Build everything
npm run build

# Build frontend only
npm run build:client

# Build backend only
npm run build:server

# Build for Vercel
npm run vercel-build
```

### Build Output

- **Frontend**: `client/dist/` (static files)
- **Backend**: `server/dist/` (compiled TypeScript)

## 🌐 Other Deployment Options

### Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=client/dist
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Heroku

```bash
# Create Heroku app
heroku create getfreecopy

# Set buildpacks
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t getfreecopy .
docker run -p 3000:3000 getfreecopy
```

## 🔒 Environment Variables

### Production Variables

```bash
# Optional: Custom port
PORT=3000

# Environment
NODE_ENV=production

# Vercel automatically sets these:
# VERCEL_URL
# VERCEL_ENV
```

### Development Variables

```bash
# Development environment
NODE_ENV=development

# Custom port (optional)
PORT=3000
```

## 📊 Performance Optimization

### Vercel Optimizations

- **Serverless Functions**: API routes run as serverless functions
- **Static Assets**: Frontend served from global CDN
- **Edge Caching**: Automatic caching for better performance
- **Auto-scaling**: Handles traffic spikes automatically

### Build Optimizations

- **Code Splitting**: Automatic chunk splitting
- **Tree Shaking**: Unused code elimination
- **Minification**: Compressed production builds
- **Source Maps**: Disabled in production for security

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
npm run install:all
```

#### API Errors

```bash
# Check server logs
npm run dev:server

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/search/counter
```

#### Frontend Issues

```bash
# Clear Vite cache
rm -rf client/node_modules/.vite

# Rebuild frontend
npm run build:client
```

### Vercel-Specific Issues

#### Function Timeout

- Increase `maxDuration` in `vercel.json`
- Optimize API response times
- Implement caching strategies

#### Build Errors

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

## 📈 Monitoring

### Health Checks

```bash
# Check application health
curl https://your-app.vercel.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### Performance Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Real User Monitoring**: Track actual user experience
- **Error Tracking**: Monitor application errors

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Success Checklist

- [ ] Application builds successfully
- [ ] All API endpoints respond correctly
- [ ] Frontend loads without errors
- [ ] Search functionality works
- [ ] Health check endpoint responds
- [ ] Environment variables are set
- [ ] SSL certificate is active
- [ ] Performance is acceptable
- [ ] Error handling works
- [ ] Monitoring is configured

## 📞 Support

For deployment issues:
- Check the troubleshooting section above
- Review Vercel documentation
- Create an issue on GitHub
- Contact: developer@getfreecopy.app
