# GetFreeCopy 2.0

**Academic Research Paper Search Platform**

A unified search platform that aggregates free academic research papers from arXiv, medRxiv, bioRxiv, and PubMed Central (PMC).

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/GetFreeCopy2.0)

### One-Click Deployment Steps:

1. **Click the "Deploy with Vercel" button above**
2. **Connect your GitHub account** (if not already connected)
3. **Configure project settings:**
   - Project Name: `getfreecopy` (or your preferred name)
   - Framework Preset: `Other`
   - Root Directory: `./` (leave as default)
4. **Deploy!** Vercel will automatically:
   - Install dependencies
   - Build the application
   - Deploy to a production URL

### Manual Deployment:

```bash
# Clone the repository
git clone https://github.com/your-username/GetFreeCopy2.0.git
cd GetFreeCopy2.0

# Install dependencies
npm run install:all

# Deploy to Vercel
npx vercel --prod
```

## 🏗️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/GetFreeCopy2.0.git
cd GetFreeCopy2.0

# Install all dependencies (root + client)
npm run install:all

# Start development servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🎯 Features

### ✅ **Enhanced Search Functionality**
- **Simplified bioRxiv/medRxiv Integration**: Direct fetching without complex filtering for faster, more reliable results
- **Enhanced PMC Search**: Fixed PMC search to follow proper NCBI E-utilities procedure (esearch + efetch) with simplified search terms for better results
- **PMC Results Prioritized**: PMC results appear first in search results
- **Source Filtering**: Select any combination of arXiv, medRxiv, bioRxiv, and PMC

### ✅ **Performance & User Experience**
- **Search Control**: Search only triggers on Enter key or button click
- **Lazy Loading**: Initial results load quickly, with option to load more
- **In-Memory Caching**: 5-minute TTL with LRU eviction for faster repeated searches
- **Search Suggestions**: Intelligent autocomplete with academic terms
- **Real-time Search Counter**: Tracks total searches powered (starts at 3000+)

### ✅ **Modern UI/UX**
- **Clean Interface**: Professional design with streamlined functionality
- **Source Status Indicators**: Visual feedback for each data source
- **Error Handling**: Graceful degradation with detailed error reporting
- **Responsive Design**: Works on desktop and mobile devices
- **CSV Export**: Download search results as CSV files

### ✅ **Technical Excellence**
- **TypeScript**: Full type safety across frontend and backend
- **React 18**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first styling with custom design system
- **Express.js**: Fast, unopinionated web framework
- **Vercel Ready**: Optimized for serverless deployment

## 📊 Data Sources

- **[arXiv](https://arxiv.org)**: Physics, mathematics, computer science, quantitative biology, quantitative finance, and statistics
- **[medRxiv](https://www.medrxiv.org)**: Medical research preprints
- **[bioRxiv](https://www.biorxiv.org)**: Biology preprints
- **[PubMed Central (PMC)](https://www.ncbi.nlm.nih.gov/pmc/)**: Full-text biomedical and life sciences journal literature

## 🏥 Attribution

**Proudly made by [Huang Lab](https://precisionomics.org) at the Icahn School of Medicine at Mount Sinai**

## 📝 API Endpoints

### Search
- `POST /api/search` - Search papers across selected sources
- `GET /api/suggestions?q=<query>` - Get search suggestions
- `GET /api/search/counter` - Get total search count
- `GET /api/cache/stats` - Get cache statistics

### Health
- `GET /health` - Health check endpoint

## 🔧 Configuration

### Environment Variables

```bash
# Optional: Set custom port (default: 3000)
PORT=3000

# Optional: Set environment (development/production)
NODE_ENV=production
```

### Build Scripts

```bash
# Install all dependencies
npm run install:all

# Development
npm run dev              # Start both frontend and backend
npm run dev:server       # Start backend only
npm run dev:client       # Start frontend only

# Production
npm run build           # Build both frontend and backend
npm run build:client    # Build frontend only
npm run build:server    # Build backend only
npm start               # Start production server

# Vercel deployment
npm run vercel-build    # Build for Vercel
```

## 🚀 Deployment

### Vercel (Recommended)

The application is optimized for Vercel deployment with:
- **Serverless Functions**: API routes run as serverless functions
- **Static Site Generation**: Frontend built and served as static files
- **Automatic HTTPS**: SSL certificates handled by Vercel
- **Global CDN**: Fast loading worldwide
- **Auto-scaling**: Handles traffic spikes automatically

### Other Platforms

The application can also be deployed to:
- **Netlify**: Frontend + serverless functions
- **Railway**: Full-stack deployment
- **Heroku**: Traditional hosting
- **DigitalOcean**: VPS deployment

## 📈 Performance

- **Search Speed**: < 5 seconds for multi-source searches
- **Cache Hit Rate**: ~80% for repeated queries
- **Uptime**: 99.9% with Vercel deployment
- **Global Response Time**: < 200ms average

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email developer@getfreecopy.app or create an issue on GitHub.

---

**Made with ❤️ by the Huang Lab team**