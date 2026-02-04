
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
  list: Movie[];
  loading: boolean;
  page: number;
  totalPages: number;
  error: string | null;
  searchQuery: string;
}

const initialState: MoviesState = {
  category: 'popular',
  list: [],
  loading: false,
  page: 1,
  totalPages: 1,
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
      state.page = 1;
      state.list = [];
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      if (action.payload.length < 2) {
        state.list = [];
      }
    },
    fetchMoviesRequest(state, _action: PayloadAction<{ page: number; category: string; query?: string }>) {
      state.loading = true;
      state.error = null;
    },
    fetchMoviesSuccess(state, action: PayloadAction<{ results: Movie[]; total_pages: number; page?: number }>) {
      state.loading = false;
      state.list = action.payload.results;
      state.totalPages = action.payload.total_pages;
      if (action.payload.page) {
        state.page = action.payload.page;
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
      state.page = action.payload;
    }
  },
});

export const { setCategory, setSearchQuery, fetchMoviesRequest, fetchMoviesSuccess, fetchMoviesFailure, searchMoviesRequest, setPage } = moviesSlice.actions;
export default moviesSlice.reducer;
