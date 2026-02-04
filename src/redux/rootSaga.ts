
import { all } from 'redux-saga/effects';
import { moviesSaga, searchSaga } from './feature/moviesSaga';

export default function* rootSaga() {
  yield all([
    moviesSaga(),
    searchSaga(), // Adding search saga
  ]);
}
