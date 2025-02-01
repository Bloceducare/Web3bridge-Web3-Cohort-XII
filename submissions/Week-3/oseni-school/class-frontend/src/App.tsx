


import  { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './ClassRegistration.css';
import './App.css'
import abi from './abi.json';
const contractAddress = "0x2F884f98f7CF70e66F1eae7E50Ae4ce5a8C951aa";
const contractABI = abi.abi;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
    };
    init();
  }, []);

  const registerClass = async () => {
    try {
      const tx = await contract.registerClass();
      await tx.wait();
      setMessage("Class registered successfully!");
    } catch (error) {
      setMessage("Error registering class: " + error.message);
    }
  };

  return (
    <div className="container">
      <h1>Class Registration</h1>
      <button onClick={registerClass}>Register Class</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App
