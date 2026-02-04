
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Details from './pages/Details';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movie/:id" element={<Details />} />
    </Routes>
  );
};

export default App;
