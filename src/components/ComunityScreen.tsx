import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CommunityGroup, GroupMessage, User } from "../types";

interface CommunityScreenProps {
  onBack: () => void;
  user: User;
  isPremium: boolean;
  onUpgrade: () => void;
}

type CommunityView = "groups" | "chat" | "create";

const mockGroups: CommunityGroup[] = [
  {
    id: "1",
    name: "Anxiety Support Circle",
    description: "A safe space to share experiences and coping strategies for managing anxiety",
    category: "anxiety",
    memberCount: 247,
    isPrivate: false,
    rules: [
      "Be respectful and supportive",
      "No medical advice - share experiences only",
      "Maintain confidentiality",
      "Use content warnings for sensitive topics"
    ],
    moderators: ["mod1", "mod2"],
    createdAt: new Date("2024-01-15"),
    lastActivity: new Date()
  },
  {
    id: "2", 
    name: "Mindful Moments",
    description: "Daily mindfulness practices and meditation discussions",
    category: "general",
    memberCount: 189,
    isPrivate: false,
    rules: [
      "Share your mindfulness journey",
      "Be present and supportive",
      "No judgment zone"
    ],
    moderators: ["mod3"],
    createdAt: new Date("2024-02-01"),
    lastActivity: new Date()
  },
  {
    id: "3",
    name: "Young Adults Mental Health",
    description: "Support group for young adults (18-30) navigating life challenges",
    category: "youth",
    memberCount: 156,
    isPrivate: true,
    rules: [
      "Age verification required (18-30)",
      "Respectful communication only",
      "Share resources and support"
    ],
    moderators: ["mod4", "mod5"],
    createdAt: new Date("2024-01-20"),
    lastActivity: new Date()
  }
];

const mockMessages: GroupMessage[] = [
  {
    id: "1",
    groupId: "1",
    userId: "user1",
    userName: "Sarah M.",
    userAvatar: "🌸",
    content: "Had a really challenging day with anxiety today, but I used the breathing technique we discussed last week and it helped so much!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    reactions: [
      { emoji: "❤️", count: 5, userIds: ["user2", "user3", "user4", "user5", "user6"] },
      { emoji: "🙏", count: 2, userIds: ["user7", "user8"] }
    ]
  },
  {
    id: "2",
    groupId: "1",
    userId: "user2",
    userName: "Mike L.",
    userAvatar: "🌟",
    content: "That's amazing Sarah! Those breathing exercises are game-changers. What specific technique did you use?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    reactions: []
  },
  {
    id: "3",
    groupId: "1", 
    userId: "user3",
    userName: "Emma K.",
    userAvatar: "🦋",
    content: "I've been practicing the 4-7-8 breathing method. Inhale for 4, hold for 7, exhale for 8. It's been incredibly helpful during panic moments.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    reactions: [
      { emoji: "👍", count: 3, userIds: ["user1", "user4", "user5"] }
    ]
  }
];

export function CommunityScreen({ onBack, user, isPremium, onUpgrade }: CommunityScreenProps) {
  const [view, setView] = useState<CommunityView>("groups");
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load joined groups from localStorage
    const saved = localStorage.getItem("mindpal-joined-groups");
    if (saved) {
      setJoinedGroups(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setMessages(mockMessages.filter(m => m.groupId === selectedGroup.id));
    }
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isPremium) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl text-center">
            <div className="text-6xl mb-6">👥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Premium Feature: Community Support
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with others on similar mental health journeys. Join support groups, share experiences, and build meaningful connections in a safe, moderated environment.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Community Features:</h3>
              <ul className="text-left text-sm text-gray-700 space-y-2">
                <li>• Join specialized support groups</li>
                <li>• 24/7 peer support & encouragement</li>
                <li>• Moderated safe spaces</li>
                <li>• Share resources & coping strategies</li>
                <li>• Anonymous participation options</li>
              </ul>
            </div>

            <Button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-medium"
            >
              Upgrade to Premium
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const handleJoinGroup = (groupId: string) => {
    const updated = [...joinedGroups, groupId];
    setJoinedGroups(updated);
    localStorage.setItem("mindpal-joined-groups", JSON.stringify(updated));
  };

  const handleLeaveGroup = (groupId: string) => {
    const updated = joinedGroups.filter(id => id !== groupId);
    setJoinedGroups(updated);
    localStorage.setItem("mindpal-joined-groups", JSON.stringify(updated));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const message: GroupMessage = {
      id: Date.now().toString(),
      groupId: selectedGroup.id,
      userId: user.id,
      userName: user.name,
      userAvatar: "🐾", // Default avatar
      content: newMessage,
      timestamp: new Date(),
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.userIds.includes(user.id)) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, userIds: r.userIds.filter(id => id !== user.id) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, userIds: [...r.userIds, user.id] }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, userIds: [user.id] }]
          };
        }
      }
      return msg;
    }));
  };

  if (view === "groups") {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                onClick={onBack}
                variant="ghost"
                className="mb-4 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </Button>
              <h1 className="text-3xl text-gray-800 font-medium">
                Community Support
              </h1>
              <p className="text-gray-600">
                Connect with others on similar journeys
              </p>
            </div>
            <Button
              onClick={() => setView("create")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium"
            >
              Create Group
            </Button>
          </div>

          {/* Safety Notice */}
          <Card className="p-4 bg-yellow-50 border-yellow-200 rounded-xl mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Community Guidelines</h3>
                <p className="text-sm text-yellow-700">
                  Our community is a supportive space for sharing experiences. This is not a substitute for professional mental health care. If you're experiencing a crisis, please contact emergency services or a crisis hotline immediately.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {mockGroups.map((group) => {
              const isJoined = joinedGroups.includes(group.id);
              
              return (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-800 text-lg">{group.name}</h3>
                          {group.isPrivate && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              🔒 Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>👥</span>
                            <span>{group.memberCount} members</span>
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {group.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {isJoined ? (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedGroup(group);
                              setView("chat");
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
                          >
                            Open Chat
                          </Button>
                          <Button
                            onClick={() => handleLeaveGroup(group.id)}
                            variant="outline"
                            className="w-full rounded-xl font-medium text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Leave Group
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleJoinGroup(group.id)}
                          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-medium"
                        >
                          Join Group
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Crisis Resources */}
          <Card className="p-6 bg-red-50 border-red-200 rounded-xl mt-8">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🆘</div>
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Crisis Resources</h3>
                <div className="space-y-1 text-sm text-red-700">
                  <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                  <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                  <p><strong>Emergency:</strong> 911</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (view === "chat" && selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-4xl mx-auto flex flex-col h-screen">
          {/* Chat Header */}
          <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setView("groups")}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </Button>
                <div>
                  <h2 className="font-semibold text-gray-800">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-500">{selectedGroup.memberCount} members</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Badge className="bg-green-100 text-green-800">
                  🟢 Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{message.userAvatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-800">{message.userName}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{message.content}</p>
                      
                      {/* Reactions */}
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 transition-colors ${
                                reaction.userIds.includes(user.id)
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                        
                        {/* Quick reaction buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          {["❤️", "👍", "🙏"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
            <div className="flex space-x-3">
              <div className="text-2xl">🐾</div>
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your thoughts with the group..."
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "create") {
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [groupCategory, setGroupCategory] = useState<CommunityGroup['category']>("general");
    const [isPrivate, setIsPrivate] = useState(false);

    const categories: { value: CommunityGroup['category'], label: string, emoji: string }[] = [
      { value: "general", label: "General Support", emoji: "🤝" },
      { value: "anxiety", label: "Anxiety Support", emoji: "😰" },
      { value: "depression", label: "Depression Support", emoji: "💙" },
      { value: "stress", label: "Stress Management", emoji: "😤" },
      { value: "youth", label: "Young Adults", emoji: "🌟" },
      { value: "seniors", label: "Seniors Support", emoji: "👴" },
    ];

    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-violet-100 via-blue-50 to-teal-100">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => setView("groups")}
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-gray-800"
          >
            ← Back to Groups
          </Button>

          <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Create Support Group
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a supportive and welcoming name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe the purpose and goals of your group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setGroupCategory(cat.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        groupCategory === cat.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.emoji}</div>
                      <div className="text-xs font-medium">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="private" className="text-sm text-gray-700">
                  Make this group private (requires approval to join)
                </label>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Group Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All groups must follow our Community Standards</li>
                  <li>• Groups will be moderated by our safety team</li>
                  <li>• Inappropriate content will result in group removal</li>
                  <li>• Focus on peer support, not medical advice</li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  // In a real app, this would create the group
                  alert("Group creation submitted for review!");
                  setView("groups");
                }}
                disabled={!groupName.trim() || !groupDescription.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium py-3"
              >
                Create Group
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}