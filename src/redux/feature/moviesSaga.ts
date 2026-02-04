
import { takeLatest, put, call, debounce, select } from 'redux-saga/effects';
import { fetchMoviesRequest, fetchMoviesSuccess, fetchMoviesFailure, searchMoviesRequest, setSearchQuery } from './moviesSlice';
import { getMovies, searchMovies } from '../../api/tmdb';
import { type PayloadAction } from '@reduxjs/toolkit';

function* handleFetchMovies(action: ReturnType<typeof fetchMoviesRequest>) {
  try {
    const { category, page } = action.payload;

    if (category === 'favorites') {
      const favs = JSON.parse(localStorage.getItem('my_favorites') || '[]');
      yield put(fetchMoviesSuccess({ results: favs, total_pages: 1 }));
      return;
    }

    const response: { results: any[]; total_pages: number } = yield call(getMovies, category, page);
    yield put(fetchMoviesSuccess(response));
  } catch (error: any) {
    yield put(fetchMoviesFailure(error.message || 'Failed to fetch movies'));
  }
}

function* handleSearchMovies(action: PayloadAction<string>) {
  const query = action.payload;
  if (query.length < 2) {
    const state: any = yield select();
    const currentCategory = state.movies.category;
    yield put(fetchMoviesRequest({ page: 1, category: currentCategory }));
    return;
  }

  try {
    yield put(searchMoviesRequest({ query, page: 1 }));
    const response: { results: any[]; total_pages: number } = yield call(searchMovies, query, 1);
    yield put(fetchMoviesSuccess(response));
  } catch (error: any) {
    yield put(fetchMoviesFailure(error.message || 'Search failed'));
  }
}

export function* moviesSaga() {
  yield takeLatest(fetchMoviesRequest.type, handleFetchMovies);
}

export function* searchSaga() {
  yield debounce(500, setSearchQuery.type, handleSearchMovies);
}
