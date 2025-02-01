import { useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import './App.css';
import abi from './abi.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x2F884f98f7CF70e66F1eae7E50Ae4ce5a8C951aa";
const contractABI = abi.abi;

function App() {
  const [, setProvider] = useState<BrowserProvider | null>(null);
  const [, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [message, setMessage] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        await fetchAllStudents(contract);
      } else {
        console.error("Ethereum object not found");
      }
    };
    init();
  }, []);

  const fetchAllStudents = async (contract: ethers.Contract) => {
    try {
      const students = await contract.getAllStudents();
      console.log("Fetched students:", students); // Debugging line
      const formattedStudents = students.map((student: any) => ({
        id: student.id.toNumber(),
        name: student.name,
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const registerStudent = async () => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      const tx = await contract.registerStudent(studentId, studentName);
      await tx.wait();
      setMessage("Student registered successfully!");
      await fetchAllStudents(contract);
    } catch (error: any) {
      setMessage("Error registering student: " + error.message);
    }
  };

  const removeStudent = async (id: number) => {
    try {
      if (!contract) {
        throw new Error("Contract not initialized");
      }
      const tx = await contract.removeStudent(id);
      await tx.wait();
      setMessage("Student removed successfully!");
      await fetchAllStudents(contract);
    } catch (error: any) {
      setMessage("Error removing student: " + error.message);
    }
  };

  return (
    <div className="container">
      <h1>Class Registration</h1>
      <div className="form">
        <input
          type="number"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <button onClick={registerStudent}>Register Student</button>
      </div>
      {message && <p>{message}</p>}
      <h2>Registered Students</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.id}: {student.name}
            <button onClick={() => removeStudent(student.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;