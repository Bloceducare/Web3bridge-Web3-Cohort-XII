import PairInfo from './components/PairInfo'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-blue-600">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Uniswap V2 Pair Information
        </h1>
        <PairInfo />
      </div>
    </div>
  )
}

export default App
