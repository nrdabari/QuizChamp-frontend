import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, Target, TrendingUp, MessageSquare, CheckCircle, BarChart3, Languages, Mic, MicOff } from 'lucide-react';

const LanguageTutor = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    proficiencyLevel: 'Beginner',
    totalMessages: 0,
    vocabularyCount: new Set(),
    grammarAccuracy: 0,
    sessionCount: 0
  });
  const [learningGoals, setLearningGoals] = useState([
    { id: 1, text: 'Practice daily conversation starters', completed: false, progress: 20 },
    { id: 2, text: 'Learn common workplace phrases', completed: false, progress: 10 },
    { id: 3, text: 'Master ordering food and shopping', completed: false, progress: 0 }
  ]);
  const [feedback, setFeedback] = useState(null);
  const [showLessonMode, setShowLessonMode] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState(new Set());
  const [progressStats, setProgressStats] = useState({
    vocabularyGrowth: [20, 35, 50, 65, 78],
    grammarAccuracy: [60, 65, 70, 75, 80],
    conversationLength: [5, 8, 12, 15, 18]
  });
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const languages = {
    english: { name: 'English (Indian Context)', flag: '🇮🇳' },
    spanish: { name: 'Spanish (Español)', flag: '🇪🇸' },
    french: { name: 'French (Français)', flag: '🇫🇷' },
    german: { name: 'German (Deutsch)', flag: '🇩🇪' }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        setSpeechSupported(true);
        
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          
          const recognition = recognitionRef.current;
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;
          recognition.lang = selectedLanguage === 'english' ? 'en-IN' : 'en-US';
          
          recognition.onstart = () => {
            setIsListening(true);
          };
          
          recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }
            
            setCurrentMessage(finalTranscript || interimTranscript);
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };
          
        } catch (error) {
          console.error('Error setting up speech recognition:', error);
          setSpeechSupported(false);
        }
      } else {
        setSpeechSupported(false);
      }
    };
    
    checkSpeechRecognition();
  }, [selectedLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMockTutorResponse = (userMessage, detectedLevel) => {
    const message = userMessage.toLowerCase();
    
    const suggestions = [];
    const positive = [];
    
    if (message.includes('i am having') || message.includes('i am doing')) {
      suggestions.push("Instead of 'I am having/doing', try 'I have' or 'I do' for simple statements");
    }
    
    if (message.includes('good name') || message.includes('what is your good name')) {
      suggestions.push("Instead of 'good name', simply ask 'What's your name?' in English");
    }
    
    if (message.includes('prepone') || message.includes('out of station')) {
      suggestions.push("These are Indian English terms. Try 'reschedule earlier' and 'out of town'");
    }
    
    if (message.length > 10) {
      positive.push("Great job forming a complete sentence!");
    }
    
    if (message.includes('please') || message.includes('thank you') || message.includes('sorry')) {
      positive.push("Excellent use of polite expressions!");
    }
    
    if (message.includes('?')) {
      positive.push("Good question formation!");
    }
    
    let tutorResponse = "";
    
    if (message.includes('hello') || message.includes('hi') || message.includes('good morning')) {
      tutorResponse = "Hello! It's wonderful to meet you. I can hear that your speech recognition is working perfectly! How can I help you practice English today?";
    } else if (message.includes('practice') || message.includes('learn')) {
      tutorResponse = "That's fantastic! I'm here to help you improve your English. What specific area would you like to focus on - pronunciation, grammar, or conversation skills?";
    } else if (message.includes('work') || message.includes('office') || message.includes('job')) {
      tutorResponse = "Workplace English is very important! Let's practice some professional phrases. Can you tell me about a typical day at your work?";
    } else if (message.includes('food') || message.includes('restaurant') || message.includes('order')) {
      tutorResponse = "Great topic! Ordering food is essential. Instead of saying 'I want', try 'I'd like' or 'Could I have'. What's your favorite food to order?";
    } else if (message.includes('how are you')) {
      tutorResponse = "I'm doing well, thank you for asking! That's a perfect conversational starter. You can also say 'How's it going?' or 'How have you been?' for variety.";
    } else {
      tutorResponse = `I can see you're practicing speaking - that's excellent! Your message was: "${userMessage}". Let's work on making your English sound even more natural.`;
    }
    
    const accuracy = Math.max(70, Math.min(95, 80 + (positive.length * 5) - (suggestions.length * 3)));
    const vocabularyUsed = userMessage.toLowerCase().match(/\b\w+\b/g) || [];
    
    return {
      tutorResponse,
      englishTranslation: "Pronunciation tip: Focus on clear pronunciation of each word, especially the ending sounds.",
      feedback: {
        positive: positive.length > 0 ? positive : ["You're making great progress with English!"],
        corrections: [],
        suggestions: suggestions.length > 0 ? suggestions : ["Keep practicing speaking clearly and confidently!"]
      },
      grammarAnalysis: {
        accuracy,
        detectedLevel,
        strengths: positive.length > 0 ? positive : ["Good effort in speaking English"],
        improvements: suggestions.length > 0 ? suggestions : ["Continue practicing daily conversations"]
      },
      vocabularyUsed,
      progressNotes: "Excellent work using voice input for English practice!"
    };
  };

  const getProficiencyColor = (level) => {
    const colors = {
      'Beginner': 'text-green-600 bg-green-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Advanced': 'text-red-600 bg-red-100',
      'Native': 'text-purple-600 bg-purple-100'
    };
    return colors[level] || colors.Beginner;
  };

  const analyzeProficiencyLevel = (messageHistory) => {
    if (messageHistory.length < 3) return 'Beginner';
    if (messageHistory.length < 10) return 'Beginner';
    if (messageHistory.length < 20) return 'Intermediate';
    return 'Advanced';
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage];
      const detectedLevel = analyzeProficiencyLevel(conversationHistory);
      
      const parsedResponse = generateMockTutorResponse(currentMessage, detectedLevel);

      const tutorMessage = {
        id: Date.now() + 1,
        text: parsedResponse.tutorResponse,
        englishTranslation: parsedResponse.englishTranslation,
        sender: 'tutor',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, tutorMessage]);
      setFeedback(parsedResponse.feedback);

      setUserProfile(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        proficiencyLevel: parsedResponse.grammarAnalysis.detectedLevel,
        grammarAccuracy: parsedResponse.grammarAnalysis.accuracy,
        vocabularyCount: new Set([...prev.vocabularyCount, ...parsedResponse.vocabularyUsed])
      }));

    } catch (error) {
      console.error('Error getting tutor response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Great job using your voice! Let's continue practicing. Can you tell me more about what you'd like to learn or practice in English?",
        sender: 'tutor',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    setMessages([]);
    setFeedback(null);
    setTranslatedMessages(new Set());
  };

  const toggleListening = async () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    } else {
      try {
        setCurrentMessage('');
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('Error accessing microphone. Please ensure microphone permissions are granted.');
      }
    }
  };

  const toggleGoalCompletion = (goalId) => {
    setLearningGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 }
          : goal
      )
    );
  };

  const toggleMessageTranslation = (messageId) => {
    setTranslatedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">English Language Tutor</h1>
              </div>
              
              <select 
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(userProfile.proficiencyLevel)}`}>
                {userProfile.proficiencyLevel}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLessonMode(!showLessonMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showLessonMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showLessonMode ? 'Lesson Mode' : 'Chat Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{languages[selectedLanguage].flag}</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to practice {languages[selectedLanguage].name}?
              </h2>
              <p className="text-gray-500">
                Start a conversation and I'll help you learn with personalized feedback!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors'
              } ${message.sender === 'tutor' ? 'cursor-pointer' : ''}`}
              onClick={message.sender === 'tutor' ? () => toggleMessageTranslation(message.id) : undefined}
              >
                {message.sender === 'tutor' && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Languages className="h-3 w-3 text-gray-400" />
                  </div>
                )}
                <p className="pr-4">
                  {message.sender === 'tutor' && translatedMessages.has(message.id) 
                    ? message.englishTranslation || message.text
                    : message.text
                  }
                </p>
                {message.sender === 'tutor' && translatedMessages.has(message.id) && (
                  <p className="text-xs mt-1 text-gray-500 italic">
                    English translation
                  </p>
                )}
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">Tutor is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Type your message in ${languages[selectedLanguage].name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            
            {speechSupported && (
              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {isListening && (
            <div className="mt-2 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                <span className="text-sm font-medium">🎤 Listening... Speak now!</span>
              </div>
            </div>
          )}
          
          {!speechSupported && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  🎤 Want to use voice input for English practice?
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  Voice input isn't available in this embedded environment, but you can copy this app to use with full microphone support!
                </p>
                <div className="text-xs text-blue-600">
                  <p><strong>How to get voice input:</strong></p>
                  <p>1. Copy this code and save it as an HTML file</p>
                  <p>2. Open it directly in Chrome or Edge</p>
                  <p>3. Allow microphone access when prompted</p>
                  <p>4. Practice speaking English with voice recognition!</p>
                </div>
              </div>
            </div>
          )}
          
          {speechSupported && !isListening && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                💡 Click the microphone to start speaking in {languages[selectedLanguage].name}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Overview
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Messages:</span>
              <span className="font-medium">{userProfile.totalMessages}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vocabulary:</span>
              <span className="font-medium">{userProfile.vocabularyCount.size} words</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Accuracy:</span>
              <span className="font-medium">{userProfile.grammarAccuracy}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Learning Goals
            </h3>
          </div>
          <div className="space-y-2">
            {learningGoals.map((goal) => (
              <div key={goal.id} className="p-2 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {goal.text}
                    </p>
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    className="ml-2 mt-1"
                  >
                    {goal.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Feedback
            </h3>
            {feedback.positive.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-600 mb-1">Great job!</p>
                {feedback.positive.map((item, idx) => (
                  <p key={idx} className="text-sm text-green-700 bg-green-50 p-2 rounded mb-1">
                    {item}
                  </p>
                ))}
              </div>
            )}
            {feedback.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-blue-600 mb-1">Try this:</p>
                {feedback.suggestions.map((item, idx) => (
                  <p key={idx} className="text-sm text-blue-700 bg-blue-50 p-2 rounded mb-1">
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Learning Stats
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vocabulary Growth</p>
              <div className="flex items-end space-x-1 h-8">
                {progressStats.vocabularyGrowth.slice(-5).map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-600 rounded-t"
                    style={{ height: `${(value / 100) * 100}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Grammar Accuracy</p>
              <div className="flex items-end space-x-1 h-8">
                {progressStats.grammarAccuracy.slice(-5).map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-green-600 rounded-t"
                    style={{ height: `${value}%`, width: '20%' }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTutor;