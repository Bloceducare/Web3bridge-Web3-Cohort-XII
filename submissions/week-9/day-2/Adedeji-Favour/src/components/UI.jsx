import React, { useEffect, useState } from 'react'
import FetchData from './FetchData';

const UI = () => { 
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [stars, setStars] = useState([]);
    const [planets, setPlanets] = useState([]);
  
    // Generate random stars on component mount
    useEffect(() => {
      const newStars = [];
      for (let i = 0; i < 50; i++) {
        newStars.push({
          id: i,
          top: Math.random() * 100,
          left: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDuration: Math.random() * 3 + 2
        });
      }
      setStars(newStars);
      
      // Generate planets
      const newPlanets = [
        { id: 1, color: 'bg-red-400', size: 'h-6 w-6', orbit: '12', speed: '30s' },
        { id: 2, color: 'bg-blue-400', size: 'h-8 w-8', orbit: '24', speed: '40s' },
        { id: 3, color: 'bg-yellow-400', size: 'h-5 w-5', orbit: '36', speed: '60s' }
      ];
      setPlanets(newPlanets);
    }, []);
    
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-gray-900 overflow-hidden fixed inset-0">
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.animationDuration}s`
              }}
            />
          ))}
        </div>
  
        {/* Orbiting planets */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          {planets.map(planet => (
            <div 
              key={planet.id} 
              className="absolute rounded-full animate-spin opacity-70"
              style={{
                width: `${planet.orbit}rem`,
                height: `${planet.orbit}rem`,
                border: '1px solid rgba(255,255,255,0.2)',
                marginTop: `-${parseInt(planet.orbit)/2}rem`,
                marginLeft: `-${parseInt(planet.orbit)/2}rem`,
                animationDuration: planet.speed
              }}
            >
              <div className={`absolute rounded-full ${planet.color} ${planet.size}`} 
                   style={{ top: 0, transform: 'translateX(-50%)' }} />
            </div>
          ))}
        </div>
  
        {/* Search interface container */}
        <div className={`relative z-10 w-full max-w-150 transition-all duration-500 ease-in-out ${isSearching ? 'scale-105' : 'scale-100'}`}>
          <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-2xl p-8 mx-4 shadow-2xl border border-gray-700">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">MultiCall</h2>
            
            {/* Input and search button */}
            <div className="flex mb-6">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter contract address (0x...)"
                className="flex-1 bg-gray-900 text-white rounded-l-lg rounded-r-lg px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
                  
            {query.length === 42 && <FetchData pairAddress={query} />}
          </div>
        </div>
      </div>
    );
}

export default UI
