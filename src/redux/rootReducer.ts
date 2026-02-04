
import { combineReducers } from '@reduxjs/toolkit';
import moviesReducer from './feature/moviesSlice';

const rootReducer = combineReducers({
  movies: moviesReducer,
});

export default rootReducer;
