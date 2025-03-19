import { SetStateAction, useState } from "react";
import Pair from "./components/Pair";
import PairsList from "./components/PairsList";

function App() {
  const [selectedPairAddress, setSelectedPairAddress] = useState("");

  // Handler for when a pair is selected from the PairsList
  const handlePairSelect = (pairAddress: SetStateAction<string>) => {
    setSelectedPairAddress(pairAddress);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Uniswap V2 Explorer
        </h1>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pairs List Component */}
          <div className="w-full">
            <PairsList onSelectPair={handlePairSelect} />
          </div>
          
          {/* Pair Details Component */}
          <div className="w-full">
            <Pair initialPairAddress={selectedPairAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;