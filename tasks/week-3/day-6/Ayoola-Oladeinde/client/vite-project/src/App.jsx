import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from '../src/utils/constants';

export default function ClassRegistrationDApp() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        const signer = await web3Provider.getSigner();
        const classContract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(classContract);
      }
    };
    initContract();
  }, []);

  const registerStudent = async () => {
    if (contract) {
      try {
        const tx = await contract.registerStudent(studentId, studentName);
        await tx.wait();
        alert('Student registered successfully');
        fetchStudents();
      } catch (error) {
        setError('Only admin can register students.');
        console.error('Error registering student:', error);
      }
    }
  };

  const removeStudent = async () => {
    if (contract) {
      try {
        const tx = await contract.removeStudent(studentId);
        await tx.wait();
        alert('Student removed successfully');
        fetchStudents();
      } catch (error) {
        setError('Only admin can remove students.');
        console.error('Error removing student:', error);
      }
    }
  };

  const fetchStudents = async () => {
    if (contract) {
      try {
        const studentList = await contract.getAllStudents();
        const formattedStudents = studentList.map((student) => ({
          id: student.id.toString(),
          name: student.name,
          isRegistered: student.isRegistered,
        }));
        setStudents(formattedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    }
  };

  const fetchStudentById = async () => {
    if (contract) {
      try {
        const student = await contract.getStudentById(studentId);
        setStudentInfo({ name: student[0], isRegistered: student[1] });
      } catch (error) {
        console.error('Error fetching student by ID:', error);
      }
    }
  };

  useEffect(() => {
    if (contract) {
      fetchStudents();
    }
  }, [contract]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Class Registration DApp</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="border p-2 mb-2 w-full"
        type="text"
        placeholder="Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 w-full mb-2"
        onClick={registerStudent}
      >
        Register Student
      </button>
      <button
        className="bg-red-500 text-white p-2 w-full"
        onClick={removeStudent}
      >
        Remove Student
      </button>
      <button
        className="bg-green-500 text-white p-2 w-full"
        onClick={fetchStudentById}
      >
        Get Student by ID
      </button>
      {studentInfo && (
        <p>
          Student: {studentInfo.name}, Registered:{' '}
          {studentInfo.isRegistered ? 'Yes' : 'No'}
        </p>
      )}
      <h2 className="text-lg font-bold mt-4">Registered Students</h2>
      <ul className="list-disc pl-5">
        {students.map((student) => (
          <li key={student.id}>
            {student.name} (ID: {student.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
