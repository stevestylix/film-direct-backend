import React, { useEffect, useState } from 'react';
import VideoUpload from './VideoUpload';
import VideoList from './VideoList';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h1>FILM DIRECT</h1>
      <p>{message}</p>
      <VideoUpload />
      <hr />
      <VideoList />
    </div>
  );
}

export default App;

