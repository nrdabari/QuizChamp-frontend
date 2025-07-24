import React, { useEffect, useState } from 'react';

export default function AddCorrectAnswerFromTxt() {
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [jsonData, setJsonData] = useState([]);
  const [answerLines, setAnswerLines] = useState([]);
  const [status, setStatus] = useState('');

  // Fetch available JSON filenames from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/list-json-files')
      .then(res => res.json())
      .then(data => setAvailableFiles(data.files))
      .catch(() => setStatus('❌ Failed to load file list'));
  }, []);

  // Load selected JSON file
  const handleFileSelect = async (e) => {
    const file = e.target.value;
    setSelectedFile(file);
    setStatus('📥 Loading file...');
    try {
      const res = await fetch(`http://localhost:5000/data/${file}`);
      const json = await res.json();

      setJsonData(json);
      setStatus('✅ File loaded');
    } catch (err) {
      setStatus('❌ Failed to load JSON file');
    }
  };

  // Load correct answers from text file
  const handleAnswerFileUpload = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    setAnswerLines(lines);
    setStatus('✅ Correct answer file loaded.');
  };

  // ✅ Apply correctAnswer by id = line number (1-based)
  const applyCorrectAnswers = () => {
    const idToAnswerMap = {};

     answerLines.forEach((line, index) => {
    const id = index + 1;
    const match = line.trim().match(/^\(?([A-D])\)?$/i); // Matches A, (A), B, etc.
    const correctAnswer = match ? match[1].toUpperCase() : line.trim();
    idToAnswerMap[id] = correctAnswer;
  });

    const updated = jsonData.data.map(entry => {
      if (entry.direction && Array.isArray(entry.questions)) {
        return {
          ...entry,
          questions: entry.questions.map(q => ({
            ...q,
            correctAnswer: idToAnswerMap[q.id] || ''
          }))
        };
      } else {
        return {
          ...entry,
          correctAnswer: idToAnswerMap[entry.id] || ''
        };
      }
    });

    setJsonData(updated);
  console.log(updated);
    
    setStatus('✅ Correct answers applied by ID.');
  };

  // Save updated JSON back to server
  const handleSave = async () => {
    if (!selectedFile) {
      setStatus('❌ Please select a file first');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/update-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFile, data: jsonData }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus(`✅ File updated successfully: ${result.path}`);
      } else {
        setStatus(`❌ Save failed: ${result.message}`);
      }
    } catch (err) {
      setStatus(`❌ Failed to save: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Update JSON with Correct Answers by ID</h2>

      <div>
        <label><b>Select Existing JSON File:</b></label><br />
        <select value={selectedFile} onChange={handleFileSelect}>
          <option value="">-- Select File --</option>
          {availableFiles.map((file, idx) => (
            <option key={idx} value={file}>{file}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label><b>Upload Correct Answer File (.txt):</b></label><br />
        <input type="file" accept=".txt" onChange={handleAnswerFileUpload} />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={applyCorrectAnswers}>🧩 Apply Correct Answers</button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleSave}>💾 Overwrite Existing JSON</button>
      </div>

      <p style={{ color: 'green' }}>{status}</p>

      <h4>Preview Updated JSON</h4>
      <pre style={{ background: '#f4f4f4', maxHeight: '400px', overflow: 'auto', padding: '1rem' }}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
}
