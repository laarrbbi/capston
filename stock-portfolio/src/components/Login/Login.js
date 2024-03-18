import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook for React Router v6
import './Login.css';

const Login = () => {
  const navigate = useNavigate(); // Hook to get the navigate function
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleInputChange = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // This will send cookies along with the request.
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.message === "Login successful") {
        // Use setTimeout to redirect after a short delay
        setTimeout(() => {
          navigate('/portfolio');
        }, 100); // Delay of 100 milliseconds
      } else {
        // Handle the case where login is not successful
        alert(`Login failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error('There was an error!', error);
      alert(`Login failed: ${error.message || "Unknown error"}`);
    }
  };
  
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleInputChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleInputChange} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

