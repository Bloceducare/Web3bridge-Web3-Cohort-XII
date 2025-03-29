"use client"

import { useState } from "react"
import { TokenSearch } from "./components/TokenSearch"
import { PairSearch } from "./components/PairSearch"
import "./styles/global.css"

import { FaExchangeAlt } from 'react-icons/fa';

function App() {
  const [activeTab, setActiveTab] = useState("pair") // 'pair' or 'token'

  return (
    <div className="container">
      <header className="header">
        <h1 className="header-title">
          Uniswap DEX Explorer <FaExchangeAlt size={24} className="icon" />
        </h1>
        <p className="header-description">
          Explore Uniswap V2 pairs and tokens on the Ethereum blockchain
        </p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === "pair" ? "active" : ""}`} onClick={() => setActiveTab("pair")}>
          Pair Explorer
        </button>
        <button className={`tab ${activeTab === "token" ? "active" : ""}`} onClick={() => setActiveTab("token")}>
          Token Search
        </button>
      </div>

      {activeTab === "pair" ? <PairSearch /> : <TokenSearch />}

      <footer className="footer">
        <p>Powered by Uniswap V2 & Ethereum | Built with Multicall for efficient blockchain data retrieval</p>
      </footer>
    </div>
  )
}

export default App

