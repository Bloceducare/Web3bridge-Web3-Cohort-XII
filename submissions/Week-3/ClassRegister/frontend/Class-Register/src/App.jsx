import { useState } from 'react'
import './App.css'
import { ethers } from 'ethers'
import abi from './abi.json'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [name, setName] = useState('')
  const [id, setId] = useState(0)
  const [students, setStudents] = useState([])
  
  const contractAddress = '0x88Fb99843Ee62d7DD60fdf73e59f7Fe78D171096'

  async function requestAccounts() {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function registerStudent(){
    if (typeof window.ethereum !== "undefined") {
      await requestAccounts()
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const loadingToastId = toast.loading("Processing registration...")
      const tx = await contract.registerStudent(name)
      const receipt = await tx.wait()
      setName('')
      allStudents()
      toast.update(loadingToastId, { render: 'Registration Successful', type: "success", isLoading: false, autoClose: 5000 })
    } catch(err) {
      console.error("Transaction failed", err);

      let errorMessage = "Transaction failed";

      // Extract revert reason from different sources
      if (err.revert?.args?.length) {
        errorMessage = err.revert.args[0]; // This should contain "Student already deleted"
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`Error: ${errorMessage}`);
    }
  }

  async function deleteStudent(){
    if (typeof window.ethereum !== "undefined") {
      await requestAccounts()
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const loadingToastId = toast.loading("Processing deletion...")
      const tx = await contract.deleteStudent(id)
      const receipt = await tx.wait()
      setId()
      allStudents()
      toast.update(loadingToastId, { render: 'Deletion Successful', type: "success", isLoading: false, autoClose: 5000 })
    } catch(err) {
      console.error("Transaction failed", err);

      let errorMessage = "Transaction failed";

      // Extract revert reason from different sources
      if (err.revert?.args?.length) {
        errorMessage = err.revert.args[0]; // This should contain "Student already deleted"
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`Error: ${errorMessage}`);
    }
  }

  async function allStudents(){
    if (typeof window.ethereum !== "undefined") {
      await requestAccounts()
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(contractAddress, abi, provider)
    try {
      const loadingToastId = toast.loading("Retrieving students...")
      const students = await contract.allStudents()
      console.log(students)
      const formattedStudents = students.map(task => ({
        id: task[0].toString(),
        name: task[1],
        deleted: task[2]
      }));
      setStudents(formattedStudents)
      console.log(formattedStudents)
      toast.update(loadingToastId, { render: 'Students retrieved successfully', type: "success", isLoading: false, autoClose: 5000 })
    } catch(err) {
      console.error("Transaction failed", err);

      let errorMessage = "Transaction failed";

      // Extract revert reason from different sources
      if (err.revert?.args?.length) {
        errorMessage = err.revert.args[0]; // This should contain "Student already deleted"
      } else if (err.reason) {
        errorMessage = err.reason;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(`Error: ${errorMessage}`);
    }
  }
  

  return (
    <>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f4f4f4",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <header
      style={{
        backgroundColor: "#6200ea",
        color: "#fff",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        width: "80%",
        marginBottom: "20px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: "10px" }}>Class Register</h1>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Enter student name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={registerStudent}
          style={{
            padding: "8px 12px",
            border: "none",
            backgroundColor: "#03dac6",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Enter id to delete"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={deleteStudent}
          style={{
            padding: "8px 12px",
            border: "none",
            backgroundColor: "#e53935",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
      <button
        onClick={allStudents}
        style={{
          padding: "8px 12px",
          border: "none",
          backgroundColor: "#6200ea",
          color: "#fff",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        All Students
      </button>
    </header>
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        width: "80%",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      <ul style={{ listStyle: "none", padding: 0 }}>
        {students.map((student) => (
          <li
            key={student.id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ccc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "16px",
              color: "#333"
            }}>
              <strong>{student.id}</strong> - {student.name}
            </span>
            <span
              style={{
                padding: "5px 10px",
                borderRadius: "4px",
                backgroundColor: student.deleted ? "#e53935" : "#03dac6",
                color: "#fff",
                fontSize: "12px",
              }}
            >
              {student.deleted ? "Deleted" : "Active"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
  <ToastContainer />
</>
  )
}

export default App
