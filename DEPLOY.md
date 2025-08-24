# 🚀 GetFreeCopy 2.0 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Free)

1. **Fork this repository** to your GitHub account
2. **Go to [vercel.com](https://vercel.com)** and sign up/login
3. **Click "New Project"**
4. **Import your forked repository**
5. **Configure the project:**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
6. **Click "Deploy"**

Your site will be live at `https://your-project-name.vercel.app`

### Option 2: Netlify (Free)

1. **Fork this repository** to your GitHub account
2. **Go to [netlify.com](https://netlify.com)** and sign up/login
3. **Click "New site from Git"**
4. **Connect your GitHub account** and select the repository
5. **Configure the build settings:**
   - Build command: `npm run build`
   - Publish directory: `client/dist`
6. **Click "Deploy site"**

### Option 3: Railway (Free tier available)

1. **Fork this repository** to your GitHub account
2. **Go to [railway.app](https://railway.app)** and sign up/login
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Railway will automatically detect the configuration**

## Manual Deployment

### Prerequisites
- Node.js 18+ installed
- Git installed

### Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd GetFreeCopy2.0
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Test locally:**
   ```bash
   npm start
   ```

5. **Deploy to your hosting service:**
   - Upload the `client/dist` folder for static hosting
   - Or use the entire project for full-stack hosting

## Environment Variables

No environment variables are required for basic deployment. The application will work out of the box.

## Features

✅ **Academic Paper Search**: Search across arXiv, bioRxiv, medRxiv, and PMC  
✅ **Modern UI**: Clean, responsive interface  
✅ **Real-time Results**: Fast search with live updates  
✅ **Mobile Friendly**: Works on all devices  
✅ **No API Keys Required**: Uses public academic APIs  

## Support

If you encounter any issues:
1. Check the build logs in your hosting platform
2. Ensure Node.js 18+ is being used
3. Verify all dependencies are installed correctly

## Customization

You can customize the application by:
- Modifying the search sources in `server/routes.ts`
- Updating the UI in `client/src/components/`
- Changing the styling in `client/src/index.css`

## License

MIT License - Feel free to use and modify as needed.
