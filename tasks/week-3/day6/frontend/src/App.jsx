import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

const contractAddress = "0x8ccc2d03f38b5816c23d956a9aa467ea7f3269c9"; // deployed contract address
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllStudents",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getStudent",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "registerStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "removeStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "studentIds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "students",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function App() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectContract = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Request account access
      const signer = await provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signer);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect MetaMask");
    }
  };
  

  const registerStudent = async () => {
    if (!studentId || !studentName) return alert("Enter student details");
    try {
      const contract = await connectContract();
      const tx = await contract.registerStudent(studentId, studentName);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("Student registered successfully!");
      setStudentId("");
      setStudentName("");
      fetchStudents();
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Error registering student: " + error.message);
    }    
  };

  const fetchStudents = async () => {
    try {
      const contract = await connectContract();
      const ids = await contract.getAllStudents();
      const studentsData = await Promise.all(ids.map(async (id) => {
        const name = await contract.getStudent(id);
        return { id: id.toString(), name };
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Error fetching students: " + error.message);
    }    
  };

  return (
    <div className="container">
      <h2>Class Registration</h2>
      <input
        type="text"
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
      <button onClick={registerStudent} disabled={loading}>
        {loading ? "Registering..." : "Register Student"}
      </button>
      <button onClick={fetchStudents}>Fetch Students</button>
      
      <h3>Registered Students:</h3>
      <ul>
        {students.map((s, index) => (
          <li key={index}>
            {s.id}: {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
