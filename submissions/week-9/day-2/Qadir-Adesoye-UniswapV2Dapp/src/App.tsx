import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import PairList from './pages/PairList';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Uniswap V2 Explorer</h1>
            <div className="space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-300 ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-200'}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/pairs"
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors duration-300 ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-200'}`
                }
              >
                Pair List
              </NavLink>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pairs" element={<PairList />} />
        </Routes>
      </div>
    </Router>
  );
}