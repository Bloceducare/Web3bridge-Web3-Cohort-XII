import React from 'react';
import { PairDataProvider } from './context/PairDataProvider';
import PairDataViewer from './components/PairDataViewer';
import './styles/global.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Uniswap V2 Pair Data Explorer</h1>
      </header>
      <main>
        <PairDataProvider>
          <PairDataViewer />
        </PairDataProvider>
      </main>
      <footer>
        <p>Built with Vite & ethers.js</p>
      </footer>
    </div>
  );
}

export default App;