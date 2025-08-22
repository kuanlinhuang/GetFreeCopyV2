# Overview

GetFreeCopy is an academic research access platform that allows users to search across multiple academic paper databases including arXiv, medRxiv, bioRxiv, and PMC. The application provides a modern web interface for discovering and accessing research papers with advanced filtering and search capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

The frontend uses a clean component structure with reusable UI components, custom hooks, and proper TypeScript interfaces for type safety throughout the application.

## Backend Architecture
The server follows a RESTful API design using Express.js:

- **Framework**: Express.js with TypeScript
- **API Structure**: RESTful endpoints with proper error handling and request logging
- **External API Integration**: Direct HTTP requests to academic paper APIs (arXiv, medRxiv, bioRxiv, PMC)
- **Data Processing**: Server-side XML parsing and data transformation for different academic sources
- **No Persistent Storage**: Application fetches data directly from external APIs without local caching

The backend acts as a proxy and data aggregator, normalizing responses from different academic paper sources into a consistent format.

## Database Design
The application uses Drizzle ORM configured for PostgreSQL, though currently no persistent storage is implemented:

- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Defined in shared schema file for type consistency
- **Current Usage**: Configured but not actively used, as all data comes from external APIs
- **Future-Ready**: Database setup allows for adding features like user accounts, saved searches, or paper bookmarks

## Data Flow and API Integration
The application integrates with multiple academic paper sources:

- **arXiv**: XML API for preprints across multiple disciplines
- **medRxiv/bioRxiv**: Medical and biological preprint servers
- **PMC**: PubMed Central for published papers
- **Search Features**: Full-text search, date filtering, source filtering, and result pagination
- **Response Normalization**: Server standardizes different API responses into unified Paper schema

## Development and Build Process
The project uses modern tooling for development and deployment:

- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with Vite dev server
- **TypeScript**: Strict type checking across client, server, and shared code
- **Code Organization**: Monorepo structure with shared types and schemas between client and server

# External Dependencies

## Core Frontend Libraries
- **React 18**: Component framework with hooks and modern features
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **React Hook Form**: Form handling with validation

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Complete UI component library built on Radix UI
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library

## Backend Dependencies
- **Express.js**: Web server framework
- **Zod**: Schema validation for API requests and responses
- **Drizzle ORM**: Database ORM with PostgreSQL support
- **Neon Database**: Serverless PostgreSQL database service

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind

## External APIs
- **arXiv API**: Academic preprint server (export.arxiv.org/api/query)
- **medRxiv/bioRxiv APIs**: Medical and biological preprint servers
- **PMC API**: PubMed Central database access