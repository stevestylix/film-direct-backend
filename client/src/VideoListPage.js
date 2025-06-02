// src/pages/VideoListPage.jsx
import React, { useEffect, useState } from 'react';

function VideoListPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error('Failed to fetch videos:', err));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2>All Videos</h2>
      {videos.map(video => (
        <div key={video._id} style={{ marginBottom: '2rem' }}>
          <h3>{video.title}</h3>
          <p>{video.description}</p>
          <p>Uploaded by: {video.uploadedBy?.username || 'Unknown'}</p>
          <video
            width="100%"
            controls
            src={video.videoUrl.startsWith('/uploads') ? video.videoUrl : `/uploads/${video.videoUrl}`}
          />
        </div>
      ))}
    </div>
  );
}

export default VideoListPage;

