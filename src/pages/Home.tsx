
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
  const { list, category, loading, page, totalPages, error, searchQuery } = useSelector((state: RootState) => state.movies);

  const [activeSection, setActiveSection] = useState<'search' | 'categories' | 'grid' | 'pagination'>('categories');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [gridIndex, setGridIndex] = useState(0);
  const [paginationIndex, setPaginationIndex] = useState(0); // 0: Prev, 1: Next
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchMoviesRequest({ page, category, query: searchQuery }));
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
        setGridIndex(0);
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
             setGridIndex(0);
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
           if (gridIndex + columns < count) {
             setGridIndex(prev => prev + columns);
           } else if (category !== 'favorites') {
             setActiveSection('pagination');
             setPaginationIndex(page > 1 ? 0 : 1);
           }
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

      else if (activeSection === 'pagination') {
        if (e.key === 'ArrowUp') {
          setActiveSection('grid');
          // Try to focus the last row of the grid
          const columns = 4;
          const count = list.length;
          const lastRowStart = Math.floor((count - 1) / columns) * columns;
          setGridIndex(lastRowStart);
        }
        if (e.key === 'ArrowLeft' && page > 1) setPaginationIndex(0);
        if (e.key === 'ArrowRight' && page < totalPages) setPaginationIndex(1);
        
        if (e.key === 'Enter') {
          if (paginationIndex === 0 && page > 1) {
            dispatch(fetchMoviesRequest({ page: page - 1, category, query: searchQuery }));
            setGridIndex(0);
            setActiveSection('grid');
          } else if (paginationIndex === 1 && page < totalPages) {
            dispatch(fetchMoviesRequest({ page: page + 1, category, query: searchQuery }));
            setGridIndex(0);
            setActiveSection('grid');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, categoryIndex, gridIndex, paginationIndex, list, dispatch, navigate, category, page, totalPages, searchQuery]);

  // Scroll to top when page or category changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, category]);

  useEffect(() => {
     if (activeSection === 'grid' && !loading) {
        const el = document.getElementById(`movie-${gridIndex}`);
        if (el) {
           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
     } else if (activeSection === 'pagination') {
        const el = document.querySelector('.pagination-controls');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
     }
  }, [gridIndex, activeSection, loading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     setLocalSearchQuery(value);
     dispatch(setSearchQuery(value));
     setGridIndex(0);
  };

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

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
                 setGridIndex(0);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="movie-grid">
         {loading && <div className="loader">Loading...</div>}
         {error && <div className="error-message">Error: {error}</div>}
         {!loading && !error && list.length === 0 && <div className="no-results">No movies found.</div>}
         {!loading && !error && list.map((movie: any, idx: number) => (
            <MovieCard
               key={movie.id}
               id={`movie-${idx}`}
               movie={movie}
               isFocused={activeSection === 'grid' && gridIndex === idx}
               onClick={() => navigate(`/movie/${movie.id}`)}
            />
         ))}
      </main>

      {category !== 'favorites' && totalPages > 1 && !error && (
        <div className="pagination-controls">
          <button
            className={classNames('btn-pagination', {
              focused: activeSection === 'pagination' && paginationIndex === 0,
              disabled: page <= 1
            })}
            onClick={() => {
              if (page > 1) {
                dispatch(fetchMoviesRequest({ page: page - 1, category, query: searchQuery }));
                setGridIndex(0);
              }
            }}
          >
            Previous
          </button>
          <span className="page-info">
            Page {page} of {totalPages}
          </span>
          <button
            className={classNames('btn-pagination', {
              focused: activeSection === 'pagination' && paginationIndex === 1,
              disabled: page >= totalPages
            })}
            onClick={() => {
              if (page < totalPages) {
                dispatch(fetchMoviesRequest({ page: page + 1, category, query: searchQuery }));
                setGridIndex(0);
              }
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
