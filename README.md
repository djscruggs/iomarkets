# IoMarkets

A modern investment marketplace platform built with React Router 7 framework, Tailwind CSS, and Google Cloud Platform.

## Tech Stack

### Frontend & Framework
- **React Router 7** - Full-stack React framework with server-side rendering
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Vite** - Build tooling and development server

### Backend & Database
- **SQLite** (better-sqlite3) - Embedded database
- **React Router Node** - Server-side runtime

### Authentication
- **Clerk** - Authentication and user management

### AI & Cloud Services
- **Google Cloud Platform**
  - **Vertex AI** - AI/ML platform with Gemini models
  - **Discovery Engine** - Enterprise search and RAG (Retrieval-Augmented Generation)
  - **Document AI** - Document processing and extraction
  - **Cloud Storage** - Document and asset storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and configure:

**Authentication:**
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```
Get your Clerk key from the [Clerk Dashboard](https://dashboard.clerk.com/).

**Google Cloud Platform (optional, for AI features):**
```
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
CLOUD_STORAGE_BUCKET=your-storage-bucket-name
DATA_STORE_ID_PREFIX=your-datastore-prefix-
GEMINI_MODEL_NAME=gemini-2.0-flash-exp
```

4. Initialize the database:

```bash
npm run db:init
npm run db:seed
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── pages/          # Page components
│   ├── Home.jsx
│   └── Dashboard.jsx
├── App.jsx         # Main app component with routes
├── main.jsx        # App entry point
└── index.css       # Global styles with Tailwind imports
```

## Features

- **User Authentication** - Secure authentication with Clerk
- **Investment Marketplace** - Browse and explore investment opportunities
- **Due Diligence Documents** - Access and manage investment documentation
- **AI-Powered Search** - RAG-based search using Google Discovery Engine and Gemini
- **Document Processing** - Automated document extraction with Document AI
- **Protected Routes** - Role-based access control
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Server-Side Rendering** - Fast initial page loads with React Router framework

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:init` - Initialize SQLite database
- `npm run db:seed` - Seed database with mock data
- `npm run db:reset` - Reset and reseed database
- `npm run rag:index` - Index investment documents for AI search
- `npm run rag:status` - Check document indexing status
