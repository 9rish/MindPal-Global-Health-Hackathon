import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface TherapistScreenProps {
  onBack: () => void;
  userData: any;
  journalEntries: any[];
  coins: number;
  onCoinsUpdate: (coins: number) => void;
}

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  description: string;
  avatar: string;
  rating: number;
  isOnline: boolean;
  price: number;
  languages: string[];
  responseTime: string;
}

interface ConnectionRequest {
  id: string;
  userId: string;
  userName: string;
  therapistId: string;
  therapistName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  userNote: string;
  userMoodSummary: string;
}

// Mock therapists data
const therapists: Therapist[] = [
  {
    id: 'th1',
    name: 'Dr. Sarah Mitchell',
    specialization: 'Anxiety & Depression',
    experience: '8 years',
    description: 'Specializes in CBT and mindfulness-based approaches for anxiety and depression. Helps clients develop practical coping strategies.',
    avatar: 'SM',
    rating: 4.9,
    isOnline: true,
    price: 120,
    languages: ['English', 'Spanish'],
    responseTime: '< 2 hours'
  },
  {
    id: 'th2',
    name: 'Dr. James Wilson',
    specialization: 'Stress & Mindfulness',
    experience: '12 years',
    description: 'Expert in mindfulness-based therapy and stress management. Uses meditation and somatic techniques for emotional regulation.',
    avatar: 'JW',
    rating: 4.8,
    isOnline: false,
    price: 100,
    languages: ['English'],
    responseTime: '< 24 hours'
  },
  {
    id: 'th3',
    name: 'Dr. Emily Chen',
    specialization: 'Trauma & EMDR',
    experience: '6 years',
    description: 'Specializes in trauma recovery using EMDR and somatic approaches. Creates a safe space for healing and personal growth.',
    avatar: 'EC',
    rating: 4.9,
    isOnline: true,
    price: 130,
    languages: ['English', 'Mandarin'],
    responseTime: '< 1 hour'
  },
  {
    id: 'th4',
    name: 'Dr. Michael Rodriguez',
    specialization: 'Youth & Family Therapy',
    experience: '10 years',
    description: 'Focuses on adolescent mental health and family dynamics. Uses systemic approaches to improve relationships and communication.',
    avatar: 'MR',
    rating: 4.7,
    isOnline: true,
    price: 110,
    languages: ['English', 'Spanish'],
    responseTime: '< 3 hours'
  }
];

export const TherapistScreen: React.FC<TherapistScreenProps> = ({
  onBack,
  userData,
  journalEntries,
  coins,
  onCoinsUpdate
}) => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load saved requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindpal-therapist-requests');
    if (saved) {
      const parsedRequests = JSON.parse(saved).map((req: any) => ({
        ...req,
        timestamp: new Date(req.timestamp)
      }));
      setConnectionRequests(parsedRequests);
    }
  }, []);

  // Save requests to localStorage
  useEffect(() => {
    localStorage.setItem('mindpal-therapist-requests', JSON.stringify(connectionRequests));
  }, [connectionRequests]);

  const getMoodSummary = () => {
    if (journalEntries.length === 0) return 'No journal entries yet';
    
    const recentEntries = journalEntries.slice(-5);
    const moodCounts: { [key: string]: number } = {};
    
    recentEntries.forEach(entry => {
      const mood = entry.mood || entry.sentiment || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    return `${journalEntries.length} entries, recent mood: ${dominantMood}`;
  };

  const handleRequestConnection = () => {
    if (!selectedTherapist) return;
    
    const newRequest: ConnectionRequest = {
      id: Date.now().toString(),
      userId: userData.id,
      userName: userData.name,
      therapistId: selectedTherapist.id,
      therapistName: selectedTherapist.name,
      status: 'pending',
      timestamp: new Date(),
      userNote: requestNote,
      userMoodSummary: getMoodSummary()
    };
    
    setConnectionRequests(prev => [...prev, newRequest]);
    setShowRequestModal(false);
    setRequestNote('');
    setSelectedTherapist(null);
    setShowSuccessModal(true);
  };

  const getPendingRequests = () => {
    return connectionRequests.filter(req => req.status === 'pending');
  };

  const getAcceptedRequests = () => {
    return connectionRequests.filter(req => req.status === 'accepted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" className="rounded-full">
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Professional Therapy
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">🪙</span>
            <span className="text-sm font-medium">{coins}</span>
          </div>
        </div>

        {/* Connection Status */}
        {(getPendingRequests().length > 0 || getAcceptedRequests().length > 0) && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Your Connections</h3>
            
            {getPendingRequests().length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-700 mb-2">Pending Requests ({getPendingRequests().length})</h4>
                <div className="space-y-2">
                  {getPendingRequests().map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm">Request to {req.therapistName}</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getAcceptedRequests().length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2">Active Connections ({getAcceptedRequests().length})</h4>
                <div className="space-y-2">
                  {getAcceptedRequests().map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm">Connected with {req.therapistName}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Button size="sm" className="bg-blue-600 text-white rounded-full">
                          💬 Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Info Banner */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start space-x-4">
            <div className="text-3xl">🧠</div>
            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-2">Professional Mental Health Support</h3>
              <p className="text-purple-700 text-sm mb-3">
                Connect with licensed therapists who can provide personalized guidance based on your mood patterns and journal entries. 
                All conversations are confidential and secure.
              </p>
              <div className="flex items-center space-x-4 text-sm text-purple-600">
                <span>✓ Licensed professionals</span>
                <span>✓ Secure & confidential</span>
                <span>✓ Personalized approach</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Therapists */}
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Available Therapists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapists.map((therapist) => {
            const hasPendingRequest = connectionRequests.some(
              req => req.therapistId === therapist.id && req.status === 'pending'
            );
            const isConnected = connectionRequests.some(
              req => req.therapistId === therapist.id && req.status === 'accepted'
            );

            return (
              <motion.div
                key={therapist.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {therapist.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{therapist.name}</h3>
                        <p className="text-sm text-gray-600">{therapist.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={therapist.isOnline ? "default" : "secondary"} className={therapist.isOnline ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {therapist.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{therapist.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">⭐ {therapist.rating}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response time:</span>
                      <span className="font-medium">{therapist.responseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Languages:</span>
                      <span className="font-medium">{therapist.languages.join(', ')}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    {therapist.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-green-600">
                      ${therapist.price}/session
                    </span>
                    {isConnected ? (
                      <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
                        💬 Chat Now
                      </Button>
                    ) : hasPendingRequest ? (
                      <Button disabled className="bg-gray-400 text-white rounded-full px-6">
                        Request Sent
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedTherapist(therapist);
                          setShowRequestModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6"
                      >
                        Request Connection
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Request Modal */}
        {showRequestModal && selectedTherapist && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedTherapist.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Request Connection</h3>
                  <p className="text-gray-600">with {selectedTherapist.name}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• The therapist will review your mood analytics</li>
                  <li>• They'll decide if they can help with your needs</li>
                  <li>• If accepted, you can start secure messaging</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Personal Note (Optional)</label>
                <textarea
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tell the therapist what you'd like help with..."
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600 mb-1">Your mood summary to share:</p>
                <p className="text-sm font-medium text-gray-800">{getMoodSummary()}</p>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedTherapist(null);
                    setRequestNote('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestConnection}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                  Send Request
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full text-center"
            >
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
              <p className="text-gray-600 mb-6">
                The therapist will review your request and mood analytics. You'll be notified when they respond.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6"
              >
                Got it!
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};