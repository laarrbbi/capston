import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/continue-watching')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setEpisodes(data))
      .catch(error => setError(error.toString()));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Continue Watching</h1>
        {error && <p>Error: {error}</p>}
        <ul>
          {episodes.map((episodeId, index) => (
            <li key={index}>Episode ID: {episodeId}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;

