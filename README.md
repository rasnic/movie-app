# MovieDB - Keyboard-First Movie Browser

A high-performance React application for browsing movies with strict keyboard-only navigation, built with Redux-Saga and TypeScript.

## Features

- **Keyboard-Only Navigation**: Navigate the entire app using arrow keys, Enter, and Escape
- **Smart Search**: Debounced search with 500ms delay and minimum 2-character requirement
- **API Rate Limiting**: Automatic throttling to 5 requests per 10 seconds
- **Category Browsing**: Switch between Popular, Airing Now, and Favorites
- **Auto-Fetch**: Categories automatically load after 2 seconds of focus
- **Persistent Favorites**: Save favorite movies to localStorage
- **Premium UI**: Dark mode with smooth animations and focus effects

## Tech Stack

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Redux-Saga** for side effects
- **React Router** for navigation
- **Axios** for API calls with custom rate limiting
- **Sass** for styling
- **Vite** for build tooling

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd movie-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_TMDB_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Keyboard Controls

- **Arrow Keys**: Navigate between items
- **Enter**: Select/activate item
- **Escape**: Go back (from details page)
- **Tab**: Disabled (keyboard-only navigation)

## Navigation Flow

1. **Search Bar** → Arrow Down → Categories
2. **Categories** → Arrow Left/Right to switch, Arrow Down → Grid
3. **Grid** → Arrow Keys to navigate, Enter to view details
4. **Details** → Enter to toggle favorite, Escape to go back

## Project Structure

```
src/
├── api/          # TMDB API client with rate limiting
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── pages/        # Route components
├── redux/        # Redux store, slices, and sagas
└── styles/       # SCSS stylesheets
```

## Build

```bash
npm run build
```

The production build will be in the `dist/` directory.

## License

MIT
