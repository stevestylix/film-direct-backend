import React, { useState } from 'react';
import axios from 'axios';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUploadFile = async () => {
    if (!file) return setMessage("❗ Please select a video file");
    setLoading(true);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedUrl(res.data.url);
      setMessage('✅ Video file uploaded. Now add title and description.');
    } catch (err) {
      setMessage('❌ File upload failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMetadata = async () => {
    if (!title || !uploadedUrl) return setMessage("❗ Please fill title and upload video first");
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/upload', {
        title,
        description,
        videoUrl: uploadedUrl,
      });

      setMessage('✅ Video metadata saved!');
      // Reset fields
      setFile(null);
      setTitle('');
      setDescription('');
      setUploadedUrl('');
    } catch (err) {
      setMessage('❌ Failed to save metadata.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>🎥 Upload Video</h2>

      <input type="file" onChange={handleChange} accept="video/mp4" />
      {file && <p>Selected: {file.name}</p>}
      <button onClick={handleUploadFile} disabled={loading} style={{ marginTop: '0.5rem' }}>
        {loading ? 'Uploading...' : 'Upload Video File'}
      </button>

      {uploadedUrl && (
        <>
          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}
          />
          <textarea
            placeholder="Video Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem' }}
          />
          <button onClick={handleUploadMetadata} disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Save Metadata'}
          </button>
        </>
      )}

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}

export default VideoUpload;
