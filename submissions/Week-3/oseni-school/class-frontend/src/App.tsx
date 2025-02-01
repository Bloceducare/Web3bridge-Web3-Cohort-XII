import  { useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import './App.css'
import abi from './abi.json';


declare global {
  interface Window {
    ethereum: any;
  }
}



const contractAddress = "0x2F884f98f7CF70e66F1eae7E50Ae4ce5a8C951aa";
const contractABI = abi.abi;


function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
      } else {
        console.error("Ethereum object not found");
      }
    };
    init();
  }, []);

  const registerStudent = async (id: number, name: string) => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      const tx = await contract.registerStudent(id, name);
      await tx.wait();
      setMessage("Student registered successfully!");
    } catch (error: any) {
      setMessage("Error registering student: " + error.message);
    }
  };

  return (
    <div className="container">
      <h1>Class Registration</h1>
      <button onClick={() => registerStudent(1, "John Doe")}>Register Student</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;