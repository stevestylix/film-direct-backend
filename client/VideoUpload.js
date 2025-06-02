import React, { useState } from 'react';

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    setStatus('Uploading file...');

    const formData = new FormData();
    formData.append('video', video);

    try {
      // Step 1: Upload the file
      const fileRes = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!fileRes.ok) {
        setStatus('File upload failed');
        return;
      }

      const { url } = await fileRes.json();
      setStatus('File uploaded. Saving metadata...');

      // Step 2: Save metadata
      const metaRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, videoUrl: url }),
      });

      if (!metaRes.ok) {
        setStatus('Metadata upload failed');
        return;
      }

      const metaData = await metaRes.json();
      setStatus('Upload complete!');

      console.log('Uploaded:', metaData);
    } catch (err) {
      console.error('Upload failed:', err);
      setStatus('Upload error');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 500 }}>
      <h2>Upload a Video</h2>
      <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} /><br /><br />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: '100%', marginBottom: '0.5rem' }}
      />
      <button onClick={handleUpload} disabled={!video || !title}>Upload Video</button>
      <p>{status}</p>
    </div>
  );
};

export default VideoUpload;
