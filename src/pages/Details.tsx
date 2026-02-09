
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../api/tmdb';
import { type Movie } from '../redux/feature/moviesSlice';
import '../styles/Details.scss';
import classNames from 'classnames';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) return;
        const data = await getMovieDetails(parseInt(id));
        setMovie(data);
        
        // Check favorites (LocalStorage)
        const favs = JSON.parse(localStorage.getItem('my_favorites') || '[]');
        setIsFavorite(favs.some((m: Movie) => m.id === data.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Toggle Favorite
  const toggleFavorite = () => {
    if (!movie) return;
    
    const favs = JSON.parse(localStorage.getItem('my_favorites') || '[]');
    let newFavs;
    if (isFavorite) {
      newFavs = favs.filter((m: Movie) => m.id !== movie.id);
    } else {
      newFavs = [...favs, movie];
    }
    
    localStorage.setItem('my_favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        navigate(-1); // Back
      }
      
      if (e.key === 'Enter') {
        toggleFavorite();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isFavorite, movie]);

  if (loading) return <div className="details-page loading">Loading...</div>;
  if (!movie) return <div className="details-page error">Movie not found</div>;

  return (
    <div className="details-page">
      <div 
        className="backdrop" 
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.poster_path})` }}
      />
      <div className="content container">
        <div className="poster">
           <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        </div>
        <div className="info">
          <h1>{movie.title}</h1>
          <p className="rating">⭐ {movie.vote_average.toFixed(1)} / 10</p>
          <p className="overview">{movie.overview}</p>
          
          <button 
             className={classNames('btn-fav focused')} // Always focused as it's the main action
             onClick={toggleFavorite}
          >
            {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
          </button>
          
          <div className="hint">
            Press <strong>Enter</strong> to toggle favorite <br/>
            Press <strong>Escape</strong> to go back
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
