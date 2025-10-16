# IoMarkets

A modern web application built with Vite, React Router 7, Tailwind CSS, and Clerk Auth.

## Tech Stack

- **Vite** - Next generation frontend tooling
- **React** - UI library
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Clerk** - Authentication and user management

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

Copy the `.env.example` file to `.env` and add your Clerk publishable key:

```bash
cp .env.example .env
```

Then edit `.env` and add your Clerk key:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

You can get your Clerk key from the [Clerk Dashboard](https://dashboard.clerk.com/).

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

- User authentication with Clerk
- Protected routes
- Responsive design with Tailwind CSS
- Modern routing with React Router 7
