import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./index.css";

export const App = () => {
  const contractAddress = "0x5FCa4659a2fb727566e46C9605E849c5D499aBf5";
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentIdr, setStudentIdr] = useState("");
  const [students, setStudents] = useState([]);

  async function requestAccounts() {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask!");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function addStudent() {
    if (!studentId || !studentName) {
      toast.error("Please enter student ID and name.");
      return;
    }

    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccounts();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await myContract.registerStudent(studentId, studentName);
        await tx.wait();
        toast.success("Student Added Successfully!");

        setStudentName("");
        setStudentId("");
        
      } catch (err) {
        console.error("Transaction Failed", err);
        toast.error("Failed to Add Student. Please try again.");
      }
    }
  }

  async function removeStudent() {
    if (!studentIdr) {
      toast.error("Please enter a valid Student ID.");
      return;
    }

    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccounts();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await myContract.removeStudent(studentIdr);
        await tx.wait();
        toast.success("Student Removed Successfully!");

        setStudentIdr("");
        
        
      } catch (err) {
        console.error("Transaction Failed", err);
        toast.error("Invalid Student Id. Please try again.");
      }
    }
  }

  async function getStudents() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccounts();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const myContract = new ethers.Contract(contractAddress, abi, signer);
  
        const studentList = await myContract.getAllStudents();
  
        // Convert to an array and filter out duplicates
        const uniqueStudents = Array.from(
          new Map(
            studentList.map((student) => [student.id.toString(), student])
          ).values()
        ).map((student) => ({
          id: student.id.toString(),
          name: student.name,
          isRegistered: student.isRegistered,
        }));
  
        setStudents(uniqueStudents);
        toast.success("Students Fetched Successfully!");
      } catch (err) {
        console.error("Transaction Failed", err);
        toast.error("Failed to Fetch Students. Please try again.");
      }
    }
  }
  
  return (
    <>
      <ToastContainer />
      <div className="container">
        <h1>Student Registration System</h1>

        <div className="form-group">
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student ID"
            className="input-field"
          />
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter Student Name"
            className="input-field"
          />
          <button onClick={addStudent} className="btn">
            Register Student
          </button>
        </div>

        <div className="form-group">
          <input
            type="text"
            value={studentIdr}
            onChange={(e) => setStudentIdr(e.target.value)}
            placeholder="Enter Student ID to Remove"
            className="input-field"
          />
          <button onClick={removeStudent} className="btn">
            Remove Student
          </button>
        </div>

        <div className="form-group">
          <button onClick={getStudents} className="btn">
            Get Students
          </button>
          {students.length > 0 && (
            <ul className="student-list">
              {students.map((student, index) => (
                <li key={index} className="student-item">
                  <strong>ID:</strong> {student.id}
                  <br />
                  <strong>Name:</strong> {student.name}
                  <br />
                  <strong>Status:</strong>{" "}
                  {student.isRegistered ? "Registered" : "Not Registered"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default App;
