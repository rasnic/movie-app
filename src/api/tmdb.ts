
import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 10000;
const requestTimestamps: number[] = [];

const processRequest = async (config: any) => {
  const now = Date.now();

  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length < RATE_LIMIT_COUNT) {
    requestTimestamps.push(now);
    return config;
  }

  const oldestTimestamp = requestTimestamps[0];
  const delay = RATE_LIMIT_WINDOW - (now - oldestTimestamp) + 100;

  return new Promise((resolve) => {
    setTimeout(() => {
      requestTimestamps.push(Date.now());
      resolve(config);
    }, delay);
  });
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

apiClient.interceptors.request.use(async (config) => {
  await processRequest(config);
  return config;
});

export const getMovies = async (category: string, page: number = 1) => {
  let endpoint = 'movie/popular';
  if (category === 'now_playing') endpoint = 'movie/now_playing';

  if (category === 'favorites') {
    return { results: [], total_pages: 1 };
  }

  const response = await apiClient.get(endpoint, {
    params: { page },
  });
  return response.data;
};

export const searchMovies = async (query: string, page: number = 1) => {
  if (query.length < 2) return { results: [], total_pages: 1 };

  const response = await apiClient.get('search/movie', {
    params: { query, page },
  });
  return response.data;
};

export const getMovieDetails = async (id: number) => {
  const response = await apiClient.get(`movie/${id}`);
  return response.data;
};
