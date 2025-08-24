# 🔬 GetFreeCopy 2.0

A modern academic research paper search platform that aggregates papers from multiple sources: arXiv, bioRxiv, medRxiv, and PMC. Built with React, TypeScript, and Express.js.

## ✨ Features

- **Multi-Source Search**: Search across arXiv, bioRxiv, medRxiv, and PMC simultaneously
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Results**: Fast search with live updates and caching
- **Advanced Filtering**: Filter by date ranges and sort by relevance or date
- **Mobile Friendly**: Fully responsive design that works on all devices
- **No API Keys Required**: Uses public academic APIs
- **Source-Specific Results**: Clear labeling of paper sources with clickable filtering

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended - Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/GetFreeCopy2.0)

1. **Fork this repository** to your GitHub account
2. **Click the deploy button above** or go to [vercel.com](https://vercel.com)
3. **Import your forked repository**
4. **Deploy!** Your site will be live in minutes

### Other Deployment Options

- **Netlify**: [Deploy Guide](DEPLOY.md#option-2-netlify-free)
- **Railway**: [Deploy Guide](DEPLOY.md#option-3-railway-free-tier-available)
- **Manual Deployment**: [Full Guide](DEPLOY.md)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/GetFreeCopy2.0.git
cd GetFreeCopy2.0

# Install dependencies
npm run install:all

# Start development server
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🏗️ Project Structure

```
GetFreeCopy2.0/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   └── dist/              # Built frontend files
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Caching logic
│   └── dist/              # Compiled backend
├── shared/                # Shared TypeScript schemas
└── vercel.json           # Vercel deployment config
```

## 🔧 Build & Deploy

### Build Commands

```bash
# Build everything
npm run build

# Build frontend only
npm run build:client

# Build backend only
npm run build:server

# Start production server
npm start
```

### Environment Variables

No environment variables required! The application works out of the box.

## 📊 API Endpoints

- `GET /health` - Health check
- `POST /api/search` - Search papers
- `GET /api/suggestions` - Get search suggestions
- `GET /api/cache/stats` - Cache statistics
- `GET /api/search/counter` - Search counter

## 🎯 Search Sources

- **arXiv**: Computer science, physics, mathematics, and more
- **bioRxiv**: Biology preprints
- **medRxiv**: Medical and health sciences preprints
- **PMC**: PubMed Central full-text articles

## 🎨 UI Components

Built with modern React patterns and Tailwind CSS:
- Responsive search interface
- Real-time search suggestions
- Source-specific paper cards
- Interactive filtering
- Loading states and error handling

## 🔍 Search Features

- **Multi-source search** with parallel API calls
- **Date filtering** (Any, Last year, 2025, 2024)
- **Sorting options** (Relevance, Date newest/oldest)
- **Source filtering** with clickable badges
- **Pagination** with "Load More" functionality
- **Caching** for improved performance
- **Error handling** with graceful fallbacks

## 🚀 Performance

- **Serverless deployment** with Vercel
- **Static asset optimization** with Vite
- **API response caching** for faster searches
- **Code splitting** for optimal loading
- **CDN distribution** for global performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Huang Lab** at Icahn School of Medicine at Mount Sinai
- Academic APIs: arXiv, bioRxiv, medRxiv, PMC
- Open source community for the amazing tools used

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/GetFreeCopy2.0/issues)
- **Email**: developer@getfreecopy.app
- **Documentation**: [DEPLOY.md](DEPLOY.md) for deployment help

---

**GetFreeCopy 2.0** - Making academic research accessible to everyone! 🔬📚