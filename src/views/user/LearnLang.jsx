import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Settings, Play, Pause, Upload, Save } from 'lucide-react';

const AIInterviewAssistant = () => {
  // States
  const [isListening, setIsListening] = useState(false);
  const [isAIActive, setIsAIActive] = useState(true);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversation, setConversation] = useState([]);
  
  // User Profile States
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    experience: '',
    skills: '',
    achievements: '',
    currentRole: '',
    education: ''
  });
  
  const [jobDescription, setJobDescription] = useState('');
  const [interviewType, setInterviewType] = useState('general');
  
  // Refs
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const speechSynthRef = useRef(null);
  
  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
    
    // Initialize Speech Synthesis
    speechSynthRef.current = window.speechSynthesis;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        toggleAI();
      }
      if (e.code === 'KeyM' && e.ctrlKey) {
        e.preventDefault();
        toggleListening();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const handleSpeechResult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    
    if (finalTranscript) {
      // Reset silence timer when speech is detected
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      // Set new silence timer
      silenceTimerRef.current = setTimeout(() => {
        if (isAIActive && finalTranscript.trim()) {
          generateAIResponse(finalTranscript);
        }
      }, 3000);
      
      setConversation(prev => [...prev, {
        type: 'user',
        text: finalTranscript,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };
  
  const generateAIResponse = async (userSpeech) => {
    if (isGeneratingResponse) return;
    
    setIsGeneratingResponse(true);
    
    // Enhanced mock responses based on common interview questions
    const getContextualResponse = (speech) => {
      const lowerSpeech = speech.toLowerCase();
      
      if (lowerSpeech.includes('tell me about yourself') || lowerSpeech.includes('introduce yourself')) {
        return `Start with: "I'm ${profile.name || 'a professional'} with ${profile.experience || 'experience'} in ${profile.currentRole || 'my field'}. My key strengths include ${profile.skills || 'various technical skills'}."`;
      }
      
      if (lowerSpeech.includes('strength') || lowerSpeech.includes('skills')) {
        return `Highlight: "${profile.skills || 'Your technical skills'}" and connect it to "${profile.achievements || 'specific achievements'}" from your background.`;
      }
      
      if (lowerSpeech.includes('weakness') || lowerSpeech.includes('improve')) {
        return `Show growth mindset: "I've been working on [specific area], and here's how I'm improving..." Then mention concrete steps you're taking.`;
      }
      
      if (lowerSpeech.includes('why') && lowerSpeech.includes('company')) {
        return `Reference the JD: "I'm excited about [specific aspect from job description] because it aligns with my experience in [your relevant background]."`;
      }
      
      if (lowerSpeech.includes('example') || lowerSpeech.includes('situation') || lowerSpeech.includes('time when')) {
        return `Use STAR method: Situation → Task → Action → Result. Draw from "${profile.achievements || 'your achievements'}" and quantify the impact.`;
      }
      
      if (lowerSpeech.includes('questions') || lowerSpeech.includes('ask me')) {
        return `Ask: "What does success look like in this role?" or "What are the biggest challenges the team is facing?" Shows engagement.`;
      }
      
      // Default contextual responses
      const contextualResponses = [
        `Connect this to your ${profile.currentRole || 'role'} experience and emphasize ${profile.skills || 'your skills'}.`,
        `Reference your background: "${profile.experience || 'your experience'}" and highlight "${profile.achievements || 'key achievements'}."`,
        `Structure your answer with specific examples and quantify the results when possible.`,
        `This matches the JD requirements - emphasize your relevant experience and show enthusiasm.`,
        `Be specific and concise. Give a concrete example that demonstrates your capabilities.`
      ];
      
      return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
    };
    
    // Simulate API delay (500ms for quick responses)
    setTimeout(() => {
      const response = getContextualResponse(userSpeech);
      setCurrentResponse(response);
      
      // Add to conversation
      setConversation(prev => [...prev, {
        type: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Speak the response quietly and quickly
      if (speechSynthRef.current) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.volume = 0.2; // Very quiet whisper
        utterance.rate = 1.4; // Faster speech for quick delivery
        utterance.pitch = 0.8; // Slightly lower pitch to be less noticeable
        speechSynthRef.current.speak(utterance);
      }
      
      setIsGeneratingResponse(false);
    }, 500); // Faster response time
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  const toggleAI = () => {
    setIsAIActive(!isAIActive);
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  };
  
  const saveProfile = () => {
    // Save to localStorage for now - replace with PostgreSQL API call
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profile saved successfully!');
  };
  
  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  };
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Interview Assistant</h1>
          <p className="text-blue-200">Your personal interview coaching companion</p>
        </div>
        
        {/* Control Panel */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleListening}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </button>
              
              <button
                onClick={toggleAI}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isAIActive 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                {isAIActive ? <Play size={20} /> : <Pause size={20} />}
                <span>AI {isAIActive ? 'Active' : 'Paused'}</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
          </div>
          
          {/* Status */}
          <div className="flex items-center space-x-6 text-sm">
            <div className={`flex items-center space-x-2 ${isListening ? 'text-green-300' : 'text-gray-300'}`}>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>Listening</span>
            </div>
            <div className={`flex items-center space-x-2 ${isAIActive ? 'text-blue-300' : 'text-gray-300'}`}>
              <div className={`w-2 h-2 rounded-full ${isAIActive ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
              <span>AI Assistant</span>
            </div>
            <div className="text-gray-300">
              Shortcuts: Ctrl+Space (Toggle AI) | Ctrl+M (Toggle Mic)
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className={`lg:col-span-1 ${showSettings ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Settings size={20} className="mr-2" />
                Profile & Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Current Role</label>
                  <input
                    type="text"
                    value={profile.currentRole}
                    onChange={(e) => setProfile({...profile, currentRole: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none"
                    placeholder="Software Engineer, Marketing Manager, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Key Skills</label>
                  <textarea
                    value={profile.skills}
                    onChange={(e) => setProfile({...profile, skills: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none h-24 resize-none"
                    placeholder="React, Python, Leadership, Project Management..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Summary</label>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none h-24 resize-none"
                    placeholder="Brief summary of your work experience..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Key Achievements</label>
                  <textarea
                    value={profile.achievements}
                    onChange={(e) => setProfile({...profile, achievements: e.target.value})}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none h-24 resize-none"
                    placeholder="Major accomplishments, awards, recognitions..."
                  />
                </div>
                
                <button
                  onClick={saveProfile}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all"
                >
                  <Save size={16} />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
            
            {/* Job Description */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Job Description</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none h-32 resize-none"
                placeholder="Paste the job description for this interview..."
              />
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:border-blue-400 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="hr">HR</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Main Panel */}
          <div className="lg:col-span-2">
        {/* Demo Section */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 mb-6 border border-green-400/30">
          <h3 className="text-xl font-semibold mb-4 text-green-300">🎯 Demo Mode - Try It Out!</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Sample Interview Questions:</h4>
              <div className="space-y-2">
                {[
                  "Tell me about yourself",
                  "What are your greatest strengths?",
                  "Why do you want to work here?", 
                  "Give me an example of a challenge you faced",
                  "Do you have any questions for me?"
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log('Button clicked:', question); // Debug log
                      console.log('AI Active:', isAIActive); // Debug log
                      if (isAIActive) {
                        generateAIResponse(question);
                      } else {
                        alert('Please activate AI first by clicking the "AI Active" button above!');
                      }
                    }}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40"
                    disabled={isGeneratingResponse}
                  >
                    <span className="text-sm text-gray-300">Click to simulate: </span>
                    <span className="text-white">"{question}"</span>
                    {isGeneratingResponse && <span className="text-yellow-300 ml-2">⏳</span>}
                  </button>
                ))}
              </div>
              
              {/* Quick Test Section */}
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                <h5 className="text-orange-300 font-semibold mb-2">Quick Test</h5>
                <button
                  onClick={() => {
                    setCurrentResponse("Test response is working! This is a sample AI suggestion to verify the text display is functioning properly.");
                  }}
                  className="w-full p-2 bg-orange-500/30 hover:bg-orange-500/50 rounded text-white text-sm"
                >
                  🧪 Test Text Display
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Demo Instructions:</h4>
              <div className="space-y-2 text-sm text-gray-200">
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">1.</span>
                  <span>Fill in your profile details on the left panel</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">2.</span>
                  <span>Add a job description to get tailored responses</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">3.</span>
                  <span>Make sure AI is active (blue button above)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">4.</span>
                  <span>Click any sample question to see AI response</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">5.</span>
                  <span>In real interviews, enable microphone and speak naturally</span>
                </div>
              </div>
              
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 text-yellow-300">
                  <span className="text-lg">💡</span>
                  <span className="font-semibold">Pro Tip:</span>
                </div>
                <p className="text-sm text-yellow-100 mt-1">
                  Use earphones during real interviews so only you can hear the AI suggestions. 
                  The AI responds in whisper volume and won't be picked up by your microphone.
                </p>
              </div>
            </div>
          </div>
        </div>
            {currentResponse && (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 mb-6 border border-blue-400/30">
                <h3 className="text-lg font-semibold mb-3 text-blue-300">💡 AI Suggestion</h3>
                <p className="text-white leading-relaxed">{currentResponse}</p>
                {isGeneratingResponse && (
                  <div className="mt-3 flex items-center space-x-2 text-blue-300">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Generating response...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Conversation History */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Conversation History</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversation.length === 0 ? (
                  <div className="text-center py-8 text-gray-300">
                    <Mic size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Start speaking to see the conversation history</p>
                  </div>
                ) : (
                  conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-green-500/20 border-l-4 border-green-400' 
                          : 'bg-blue-500/20 border-l-4 border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">
                          {msg.type === 'user' ? '🎤 You spoke' : '🤖 AI Assistant'}
                        </span>
                        <span className="text-xs text-gray-300">{msg.timestamp}</span>
                      </div>
                      <p className="text-white">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewAssistant;