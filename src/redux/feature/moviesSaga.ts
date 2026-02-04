
import { takeLatest, put, call, debounce, select } from 'redux-saga/effects';
import { fetchMoviesRequest, fetchMoviesSuccess, fetchMoviesFailure, setSearchQuery } from './moviesSlice';
import { getMovies, searchMovies } from '../../api/tmdb';
import { type PayloadAction } from '@reduxjs/toolkit';
import { type RootState } from '../store';
import { type SagaIterator } from 'redux-saga';

function* handleFetchMovies(action: ReturnType<typeof fetchMoviesRequest>): SagaIterator {
  try {
    const { category, page, query } = action.payload;

    if (category === 'favorites') {
      const favs = JSON.parse(localStorage.getItem('my_favorites') || '[]');
      yield put(fetchMoviesSuccess({ results: favs, total_pages: 1 }));
      return;
    }

    const response: { results: any[]; total_pages: number } = query
      ? yield call(searchMovies, query, page)
      : yield call(getMovies, category, page);

    yield put(fetchMoviesSuccess({ ...response, page }));
  } catch (error: any) {
    yield put(fetchMoviesFailure(error.message || 'Failed to fetch movies'));
  }
}

function* handleSearchMovies(action: PayloadAction<string>): SagaIterator {
  const query = action.payload;
  if (query.length < 2) {
    const state: any = yield select();
    const currentCategory = state.movies.category;
    yield put(fetchMoviesRequest({ page: 1, category: currentCategory }));
    return;
  }

  try {
    const state: RootState = yield select();
    yield put(fetchMoviesRequest({ query, page: 1, category: state.movies.category }));
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
