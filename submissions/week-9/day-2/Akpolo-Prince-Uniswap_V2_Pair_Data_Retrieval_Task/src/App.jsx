import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import UniswapV2 from './components/UniSwap/index'


function App() {
  return (
    <>
      <div className="min-h-screen bg-[#0F0B1A]">
        <UniswapV2/>
      </div>
    </>
  )
}

export default App