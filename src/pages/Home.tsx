
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type RootState } from '../redux/store';
import { fetchMoviesRequest, setCategory, setSearchQuery } from '../redux/feature/moviesSlice';
import MovieCard from '../components/MovieCard';
import '../styles/Home.scss';
import classNames from 'classnames';

const CATEGORIES = [
  { id: 'popular', label: 'Popular' },
  { id: 'now_playing', label: 'Airing Now' },
  { id: 'favorites', label: 'My Favorites' },
];

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, category, loading } = useSelector((state: RootState) => state.movies);

  const [activeSection, setActiveSection] = useState<'search' | 'categories' | 'grid'>('categories');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [gridIndex, setGridIndex] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMoviesRequest({ page: 1, category }));
  }, [dispatch]);

  const categoryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeSection === 'categories') {
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);

      const targetCategory = CATEGORIES[categoryIndex].id;
      if (targetCategory === category) return;

      categoryTimerRef.current = window.setTimeout(() => {
        dispatch(setCategory(targetCategory as any));
        dispatch(fetchMoviesRequest({ page: 1, category: targetCategory }));
      }, 2000);
    }
    return () => {
      if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
    };
  }, [activeSection, categoryIndex, category, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSection === 'search') {
         if (e.key === 'ArrowDown') {
           setActiveSection('categories');
           e.preventDefault();
         }
         return;
      }
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (activeSection === 'categories') {
        if (e.key === 'ArrowRight') setCategoryIndex(prev => Math.min(prev + 1, CATEGORIES.length - 1));
        if (e.key === 'ArrowLeft') setCategoryIndex(prev => Math.max(prev - 1, 0));
        if (e.key === 'ArrowDown') {
           setActiveSection('grid');
           setGridIndex(0);
        }
        if (e.key === 'ArrowUp') setActiveSection('search');
        if (e.key === 'Enter') {
           if (categoryTimerRef.current) clearTimeout(categoryTimerRef.current);
           const target = CATEGORIES[categoryIndex].id;
           if (target !== category) {
             dispatch(setCategory(target as any));
             dispatch(fetchMoviesRequest({ page: 1, category: target }));
           }
        }
      }

      else if (activeSection === 'grid') {
        const columns = 4;
        const count = list.length;
        
        if (e.key === 'Enter') {
           const movie = list[gridIndex];
           if (movie) navigate(`/movie/${movie.id}`);
        }

        if (e.key === 'ArrowRight') setGridIndex(prev => Math.min(prev + 1, count - 1));
        if (e.key === 'ArrowLeft') setGridIndex(prev => Math.max(prev - 1, 0));
        
        if (e.key === 'ArrowDown') {
           setGridIndex(prev => (prev + columns < count ? prev + columns : prev));
        }
        
        if (e.key === 'ArrowUp') {
          setGridIndex(prev => {
             if (prev - columns < 0) {
                setActiveSection('categories');
                return 0; 
             }
             return prev - columns;
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, categoryIndex, gridIndex, list, dispatch, navigate, category]);

  useEffect(() => {
     if (activeSection === 'grid') {
        const el = document.getElementById(`movie-${gridIndex}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
     }
  }, [gridIndex, activeSection]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     setLocalSearchQuery(value);
     dispatch(setSearchQuery(value));
  };

  return (
    <div className="home-page container">
      <header className="app-header">
        <h1>MovieDB</h1>
        
        <input
          type="text"
          placeholder="Search movies..."
          value={localSearchQuery}
          onChange={handleSearchChange}
          className={activeSection === 'search' ? 'focused' : ''}
          autoFocus
          onFocus={() => setActiveSection('search')}
        />

        <div className="categories-nav">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              className={classNames('btn-category', {
                active: category === cat.id,
                focused: activeSection === 'categories' && categoryIndex === idx
              })}
              onClick={() => {
                 setCategoryIndex(idx);
                 setActiveSection('categories');
                 dispatch(setCategory(cat.id as any));
                 dispatch(fetchMoviesRequest({ page: 1, category: cat.id }));
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="movie-grid">
         {loading && <div className="loader">Loading...</div>}
         {!loading && list.map((movie: any, idx: number) => (
            <MovieCard
               key={movie.id}
               id={`movie-${idx}`}
               movie={movie}
               isFocused={activeSection === 'grid' && gridIndex === idx}
               onClick={() => navigate(`/movie/${movie.id}`)}
            />
         ))}
      </main>
    </div>
  );
};

export default Home;
