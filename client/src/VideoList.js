import React, { useEffect, useState } from 'react';
import axios from 'axios';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('light');

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = videos.filter(video =>
      video.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [search, videos]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/videos');
      setVideos(res.data);
      setFilteredVideos(res.data);
      setMessage('');
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setMessage('Error fetching videos.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/videos/${id}`);
      setMessage('Video deleted.');
      fetchVideos();
    } catch (err) {
      console.error('Failed to delete video:', err);
      setMessage('Failed to delete video.');
    }
  };

  const handleEdit = (video) => {
    setEditId(video._id);
    setEditTitle(video.title);
    setEditDescription(video.description);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/videos/${editId}`, {
        title: editTitle,
        description: editDescription,
      });
      setEditId(null);
      setMessage('Video updated.');
      fetchVideos();
    } catch (err) {
      console.error('Failed to update video:', err);
      setMessage('Failed to update video.');
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const containerStyle = {
    background: theme === 'dark' ? '#1e1e1e' : '#f9f9f9',
    color: theme === 'dark' ? '#f1f1f1' : '#1e1e1e',
    minHeight: '100vh',
    padding: '2rem',
  };

  return (
    <div style={containerStyle}>
      <button onClick={toggleTheme} style={{ marginBottom: '1rem' }}>
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>

      <input
        type="text"
        placeholder="Search videos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '0.5rem', marginBottom: '2rem', width: '100%' }}
      />

      {message && <p style={{ color: 'orange' }}>{message}</p>}

      {filteredVideos.map((video) => (
        <div key={video._id} style={{ marginBottom: '2rem' }}>
          {editId === video._id ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ display: 'block', marginBottom: '0.5rem' }}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{ display: 'block', marginBottom: '0.5rem' }}
              />
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setEditId(null)} style={{ marginLeft: '0.5rem' }}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <h3>{video.title}</h3>
              <video
                width="400"
                height="250"
                controls
                src={`http://localhost:5000${video.videoUrl}`}
                style={{ display: 'block', marginBottom: '0.5rem' }}
              />
              <p>{video.description}</p>
              <button onClick={() => handleEdit(video)}>Edit</button>
              <button
                onClick={() => handleDelete(video._id)}
                style={{ marginLeft: '0.5rem', color: 'red' }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default VideoList;

