import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { AnalyticsScreen } from './AnalyticsScreen';

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

interface TherapistDashboardProps {
  onBack: () => void;
  currentTherapistId?: string;
}

// Mock user data for analytics demonstration
const getMockUserData = (userId: string) => {
  return {
    journalEntries: [
      {
        id: '1',
        content: 'Feeling anxious about work presentation tomorrow. Keep overthinking what could go wrong and imagining worst case scenarios.',
        date: new Date('2024-01-15'),
        mood: 'anxious',
        aiAnalysis: 'User expressing work-related anxiety and catastrophic thinking patterns. May benefit from cognitive restructuring techniques.',
        confidence: 0.85,
        sarcastic: false,
        fineEmotions: [
          { label: 'fear', score: 0.7 },
          { label: 'sadness', score: 0.3 }
        ]
      },
      {
        id: '2', 
        content: 'Had a good day today. Managed to complete all my tasks at work and felt really productive. Even helped a colleague with their project.',
        date: new Date('2024-01-16'),
        mood: 'happy',
        aiAnalysis: 'Positive mood with sense of accomplishment and productivity. Shows good social support behaviors.',
        confidence: 0.92,
        sarcastic: false,
        fineEmotions: [
          { label: 'joy', score: 0.8 },
          { label: 'pride', score: 0.6 }
        ]
      },
      {
        id: '3',
        content: 'Meeting went better than expected. Still feeling stressed about upcoming deadlines though. Need to find better work-life balance.',
        date: new Date('2024-01-17'),
        mood: 'content',
        aiAnalysis: 'Mixed emotions - relief about past event but ongoing stress about future. Recognizes need for self-care.',
        confidence: 0.78,
        sarcastic: false,
        fineEmotions: [
          { label: 'relief', score: 0.5 },
          { label: 'worry', score: 0.6 }
        ]
      },
      {
        id: '4',
        content: 'Tried meditation today for 10 minutes. It was harder than I thought but I felt calmer afterwards. Maybe I should do this more often.',
        date: new Date('2024-01-18'),
        mood: 'calm',
        aiAnalysis: 'User experimenting with mindfulness practices. Shows openness to new coping strategies and self-awareness.',
        confidence: 0.88,
        sarcastic: false,
        fineEmotions: [
          { label: 'peace', score: 0.7 },
          { label: 'curiosity', score: 0.4 }
        ]
      },
      {
        id: '5',
        content: 'Had an argument with my partner about money. Feeling frustrated and misunderstood. We never seem to communicate well about finances.',
        date: new Date('2024-01-19'),
        mood: 'frustrated',
        aiAnalysis: 'Relationship conflict around financial communication. May benefit from couples communication techniques.',
        confidence: 0.81,
        sarcastic: false,
        fineEmotions: [
          { label: 'anger', score: 0.6 },
          { label: 'sadness', score: 0.5 }
        ]
      }
    ]
  };
};

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  onBack,
  currentTherapistId = 'th1'
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'clients'>('requests');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Load requests from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mindpal-therapist-requests');
    if (saved) {
      const parsedRequests = JSON.parse(saved).map((req: any) => ({
        ...req,
        timestamp: new Date(req.timestamp)
      }));
      setRequests(parsedRequests);
    }
  }, []);

  // Save requests to localStorage
  useEffect(() => {
    localStorage.setItem('mindpal-therapist-requests', JSON.stringify(requests));
  }, [requests]);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : req
      )
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleViewAnalytics = (userId: string) => {
    setSelectedUserId(userId);
    setShowAnalytics(true);
  };

  const getTherapistRequests = () => {
    return requests.filter(req => req.therapistId === currentTherapistId);
  };

  const getPendingRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'pending');
  };

  const getAcceptedRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'accepted');
  };

  const getRejectedRequests = () => {
    return getTherapistRequests().filter(req => req.status === 'rejected');
  };

  if (showAnalytics && selectedUserId) {
    const userData = getMockUserData(selectedUserId);
    return (
      <AnalyticsScreen
        journalEntries={userData.journalEntries}
        onBack={() => setShowAnalytics(false)}
        onCoinsUpdate={() => {}} // Therapists don't earn coins
        coins={0}
        petName="Client's Companion"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" className="rounded-full">
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Therapist Dashboard
          </h1>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">Dr. Sarah Mitchell</Badge>
            <Badge className="bg-green-100 text-green-800">Online</Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getPendingRequests().length}</div>
              <div className="text-sm text-blue-600">New Requests</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getAcceptedRequests().length}</div>
              <div className="text-sm text-green-600">Active Clients</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{getRejectedRequests().length}</div>
              <div className="text-sm text-orange-600">Declined</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getTherapistRequests().length}</div>
              <div className="text-sm text-purple-600">Total Requests</div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'requests' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            New Requests ({getPendingRequests().length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'clients' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active Clients ({getAcceptedRequests().length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {getPendingRequests().length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">New connection requests from users will appear here.</p>
              </Card>
            ) : (
              getPendingRequests().map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {request.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.userName}</h3>
                          <p className="text-sm text-gray-600">
                            Requested: {request.timestamp.toLocaleDateString()} at {request.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">New Request</Badge>
                    </div>

                    {request.userMoodSummary && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <h4 className="font-medium text-blue-800 mb-2">📊 Mood Summary</h4>
                        <p className="text-sm text-blue-700">{request.userMoodSummary}</p>
                      </div>
                    )}

                    {request.userNote && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                        <h4 className="font-medium text-gray-800 mb-2">💬 Personal Note</h4>
                        <p className="text-sm text-gray-700">"{request.userNote}"</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleViewAnalytics(request.userId)}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        📊 View Full Analytics
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 rounded-full"
                      >
                        Decline
                      </Button>
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600"
                      >
                        Accept & Connect
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            {getAcceptedRequests().length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Clients</h3>
                <p className="text-gray-600">Accepted clients will appear here for ongoing therapy sessions.</p>
              </Card>
            ) : (
              getAcceptedRequests().map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {request.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{request.userName}</h3>
                          <p className="text-sm text-gray-600">
                            Connected since: {request.timestamp.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">✓ Active therapy relationship</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={() => handleViewAnalytics(request.userId)}
                          variant="outline"
                          size="sm"
                          className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          📊 View Analytics
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600"
                          onClick={() => alert('In a real app, this would open the secure chat interface')}
                        >
                          💬 Open Chat
                        </Button>
                      </div>
                    </div>

                    {/* Client Status Summary */}
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Last session: 3 days ago</span>
                        <span className="text-green-700">Next scheduled: Tomorrow 2 PM</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};