
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
}

interface MoviesState {
  category: 'popular' | 'now_playing' | 'favorites';
  cache: {
    [key in 'popular' | 'now_playing' | 'favorites']: {
      list: Movie[];
      page: number;
      totalPages: number;
    }
  };
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: MoviesState = {
  category: 'popular',
  cache: {
    popular: { list: [], page: 1, totalPages: 1 },
    now_playing: { list: [], page: 1, totalPages: 1 },
    favorites: { list: [], page: 1, totalPages: 1 },
  },
  loading: false,
  error: null,
  searchQuery: '',
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<'popular' | 'now_playing' | 'favorites'>) {
      state.category = action.payload;
      state.searchQuery = '';
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    fetchMoviesRequest(state, _action: PayloadAction<{ page: number; category: string; query?: string }>) {
      state.loading = true;
      state.error = null;
    },
    fetchMoviesSuccess(state, action: PayloadAction<{ results: Movie[]; total_pages: number; page?: number; category: string; isSearch?: boolean }>) {
      state.loading = false;
      const { results, total_pages, page, category, isSearch } = action.payload;

      if (isSearch) {
        // We don't cache search results in the category buckets for now to keep it simple,
        // or we could add a search bucket. Let's just update the list for the current view.
        // However, the requirement is about categories.
        state.cache[state.category] = {
          list: results,
          page: page || 1,
          totalPages: total_pages
        };
      } else if (category && (category === 'popular' || category === 'now_playing' || category === 'favorites')) {
        state.cache[category] = {
          list: results,
          page: page || 1,
          totalPages: total_pages,
        };
      }
    },
    fetchMoviesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    searchMoviesRequest(state, _action: PayloadAction<{ query: string; page: number }>) {
      state.loading = true;
      state.error = null;
    },
    setPage(state, action: PayloadAction<number>) {
      if (state.cache[state.category]) {
        state.cache[state.category].page = action.payload;
      }
    }
  },
});

export const { setCategory, setSearchQuery, fetchMoviesRequest, fetchMoviesSuccess, fetchMoviesFailure, searchMoviesRequest, setPage } = moviesSlice.actions;
export default moviesSlice.reducer;
