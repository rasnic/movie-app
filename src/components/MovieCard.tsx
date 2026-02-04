
import React from 'react';
import classNames from 'classnames';
import { type Movie } from '../redux/feature/moviesSlice';
import '../styles/MovieCard.scss';

interface Props {
  movie: Movie;
  isFocused: boolean;
  id: string;
  onClick: () => void;
}

const MovieCard: React.FC<Props> = ({ movie, isFocused, id, onClick }) => {
  return (
    <div
      id={id}
      className={classNames('movie-card', { focused: isFocused })}
      onClick={onClick}
    >
      <div className="poster-wrapper">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="placeholder">No Image</div>
        )}
      </div>
      <div className="info">
        <h3>{movie.title}</h3>
        <p>⭐ {movie.vote_average.toFixed(1)}</p>
      </div>
    </div>
  );
};

export default MovieCard;
