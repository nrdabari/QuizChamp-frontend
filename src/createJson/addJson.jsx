import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const parseMCQ = (text) => {
 
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  let i = 0;
  let currentDirection = null;
  let directionQuestions = [];
  let questionId = 1; // 🔢 Start question ID from 1

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('Directions')) {
      if (currentDirection && directionQuestions.length > 0) {
        result.push({ direction: currentDirection, questions: directionQuestions });
        directionQuestions = [];
      }
      currentDirection = line;
      i++;
      continue;
    }

    const question = line;
    const optionLines = [];
    for (let j = 0; j < 4 && i + 1 + j < lines.length; j++) {
      optionLines.push(lines[i + 1 + j]);
    }

    const optionMap = {};
    const fallbackOptions = [];

    optionLines.forEach(line => {
      const match = line.match(/\(([A-D])\)\s*(.*)/);
      if (match) {
        const [_, label, text] = match;
        optionMap[label] = text;
      } else {
        fallbackOptions.push(line);
      }
    });

    const options = Object.keys(optionMap).length === 4
      ? ['A', 'B', 'C', 'D'].map(k => optionMap[k])
      : Object.values(optionMap).concat(fallbackOptions);

    const qObj = { id: questionId++, question, options }; // 👈 Add ID here

    currentDirection ? directionQuestions.push(qObj) : result.push(qObj);
    i += 1 + optionLines.length;
  }

  if (currentDirection && directionQuestions.length > 0) {
    result.push({ direction: currentDirection, questions: directionQuestions });
  }

  return result;
};



export default function AddJson() {
    const navigate = useNavigate();
  const [jsonData, setJsonData] = useState([]);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const parsed = parseMCQ(text);
    setJsonData(parsed);
    setStatus('✅ File parsed successfully.');
  };

  const handleSave = async () => {
    if (!subject || !chapter) {
      setStatus('❌ Subject and Chapter are required.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/save-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          chapter,
          data: jsonData
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus(`✅ Saved to: ${result.path}`);
      } else {
        setStatus(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      setStatus(`❌ Failed to connect to server: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Upload & Save MCQ JSON</h2>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <br /><br />

      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{ marginRight: '1rem' }}
      />
      <input
        type="text"
        placeholder="Chapter"
        value={chapter}
        onChange={(e) => setChapter(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSave}>💾 Save JSON</button>
      <p>{status}</p>

      <hr />
      <h4>Preview:</h4>
      <pre style={{ maxHeight: '400px', overflow: 'auto', background: '#f4f4f4', padding: '1rem' }}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
       <button onClick={() => navigate('/add-correct-answer')}>
        ➡️ Go to Add Correct Answers Page
      </button>
    </div>
  );
}
