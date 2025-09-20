import React, { useState, useEffect } from "react";
import {
  analyzeMoods,
  JournalEntry,
  MoodAnalytics,
  MoodReward,
  getMoodEmoji,
  getMoodColor,
} from "../utils/moodAnalytics";
import { getApiStatus, testSentimentAnalysis, isApiConfigured } from "../utils/sentimentAnalysis";

// --- UI COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost";
  size?: "default" | "sm";
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses =
    variant === "ghost"
      ? "hover:bg-gray-100 hover:text-accent-foreground"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  const sizeClasses = size === "sm" ? "h-9 px-3" : "h-10 py-2 px-4";
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
  >
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive";
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
}) => {
  const variantClass =
    variant === "destructive"
      ? "border-transparent bg-red-500 text-white"
      : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80";
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variantClass} ${className}`}
    >
      {children}
    </div>
  );
};

interface ProgressProps {
  value?: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value = 0, className = "" }) => (
  <div
    className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
  >
    <div
      className="h-full w-full flex-1 bg-purple-500 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

const ConfidenceTooltip = ({ confidence }: { confidence: number }) => {
  return (
    <div className="relative flex flex-col items-center group">
      <div className="w-full h-1 bg-gray-200 rounded-full">
        <div
          className="h-1 bg-purple-500 rounded-full"
          style={{ width: `${confidence * 100}%` }}
        ></div>
      </div>
      <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
        <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
          AI Confidence: {Math.round(confidence * 100)}%
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    </div>
  );
};

// Enhanced Mood Card Component (without recent trend)
const MoodCard = ({ analytics, journalEntries, selectedTimeframe }: { 
  analytics: MoodAnalytics; 
  journalEntries: JournalEntry[]; 
  selectedTimeframe: string;
}) => {
  const getTimeframeText = () => {
    switch(selectedTimeframe) {
      case "week": return "this week";
      case "month": return "this month";
      default: return "overall";
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
      </div>

      <div className="relative p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Mood Insights</h3>
            <p className="text-purple-200 text-sm">Your emotional journey {getTimeframeText()}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl mb-2">{getMoodEmoji(analytics.dominantMood)}</div>
            <p className="text-purple-200 text-xs capitalize">{analytics.dominantMood}</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 text-green-300">
              {analytics.positivePercentage}%
            </div>
            <div className="text-purple-200 text-sm">Positive</div>
            <div className="w-full h-1 bg-purple-500 rounded-full mt-2">
              <div 
                className="h-1 bg-green-400 rounded-full transition-all duration-500"
                style={{ width: `${analytics.positivePercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 text-blue-300">
              {analytics.neutralPercentage}%
            </div>
            <div className="text-purple-200 text-sm">Neutral</div>
            <div className="w-full h-1 bg-purple-500 rounded-full mt-2">
              <div 
                className="h-1 bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${analytics.neutralPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 text-orange-300">
              {analytics.negativePercentage}%
            </div>
            <div className="text-purple-200 text-sm">Challenging</div>
            <div className="w-full h-1 bg-purple-500 rounded-full mt-2">
              <div 
                className="h-1 bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${analytics.negativePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Entries Only */}
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-white font-bold text-lg">{analytics.totalEntries}</p>
            <p className="text-purple-200 text-xs">
              {analytics.totalEntries === 1 ? 'Entry' : 'Entries'}
            </p>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Debug Panel Component
const DebugPanel = ({ journalEntries }: { journalEntries: JournalEntry[] }) => {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    getApiStatus().then(status => {
      setApiStatus(status);
      console.log('🔍 API Status:', status);
    });
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await testSentimentAnalysis();
      console.log('✅ Test completed - check console for results');
    } catch (error) {
      console.error('❌ Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  if (!apiStatus) return null;

  return (
    <Card className="mb-8 bg-blue-50 border-blue-200">
      <div 
        className="p-4 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-blue-800">
            🔧 Debug Panel (Click to {isExpanded ? 'collapse' : 'expand'})
          </h3>
          <span className="text-blue-600">{isExpanded ? '−' : '+'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">API Status</h4>
              <ul className="space-y-1 text-blue-700">
                <li>Configured: {apiStatus.configured ? '✅' : '❌'}</li>
                <li>Working: {apiStatus.working ? '✅' : '❌'}</li>
                <li>Emotion Model: j-hartmann/emotion-english-distilroberta-base</li>
                <li>Sarcasm Model: helinivan/english-sarcasm-detector</li>
                {apiStatus.error && <li className="text-red-600">Error: {apiStatus.error}</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Available Emotions</h4>
              <div className="text-blue-700 max-h-24 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  {['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'neutral'].map((emotion, idx) => (
                    <span key={idx} className="bg-blue-100 px-1 py-0.5 rounded text-xs">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTest}
              disabled={!apiStatus.configured || isTesting}
              size="sm"
              className="text-xs"
            >
              {isTesting ? 'Testing...' : 'Test API'}
            </Button>
            {!apiStatus.configured && (
              <span className="text-xs text-red-600">
                Set REACT_APP_HUGGING_FACE_API_KEY environment variable
              </span>
            )}
          </div>
          
          {journalEntries.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Current Journal Moods</h4>
              <div className="flex flex-wrap gap-1">
                {[...new Set(journalEntries.map(e => e.mood))].map(mood => (
                  <span key={mood} className="bg-purple-100 px-2 py-1 rounded text-xs">
                    {getMoodEmoji(mood)} {mood}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// --- MAIN COMPONENT ---

interface AnalyticsScreenProps {
  journalEntries: JournalEntry[];
  onBack: () => void;
  onCoinsUpdate: (coins: number) => void;
  coins: number;
  petName: string;
}

export function AnalyticsScreen({
  journalEntries,
  onBack,
  onCoinsUpdate,
  coins,
  petName,
}: AnalyticsScreenProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "all"
  >("all");
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const getFilteredEntries = () => {
    const now = new Date();
    if (selectedTimeframe === "all") return journalEntries;
    const days = selectedTimeframe === "week" ? 7 : 30;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return journalEntries.filter((entry) => new Date(entry.date) >= cutoffDate);
  };

  const filteredEntries = getFilteredEntries();
  const analytics: MoodAnalytics = analyzeMoods(filteredEntries);

  const handleClaimReward = (reward: MoodReward) => {
    const rewardId = `${reward.type}-${reward.coinReward}`;
    if (!claimedRewards.includes(rewardId)) {
      setClaimedRewards((prev) => [...prev, rewardId]);
      onCoinsUpdate(coins + reward.coinReward);

      const celebration = document.createElement("div");
      celebration.innerHTML = `${reward.emoji} +${reward.coinReward} coins!`;
      celebration.className =
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-yellow-600 pointer-events-none z-50 animate-bounce";
      document.body.appendChild(celebration);
      setTimeout(() => celebration.remove(), 3000);
    }
  };

  if (journalEntries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card className="p-8 bg-white/80 shadow-lg rounded-3xl text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl mb-4">No Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Start journaling to see your mood analytics and insights from{" "}
              {petName}!
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-6"
            >
              Start Journaling ✨
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="rounded-full bg-white/50 hover:bg-white/70"
          >
            ← Back
          </Button>
          <h1 className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mood Analytics
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowDebug(!showDebug)}
              variant="ghost"
              size="sm"
              className="text-xs bg-blue-100 hover:bg-blue-200"
            >
              🔧
            </Button>
            <div className="flex items-center space-x-2 bg-yellow-200 px-3 py-1 rounded-full shadow">
              <span>🪙</span>
              <span className="text-sm font-medium">{coins}</span>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && <DebugPanel journalEntries={journalEntries} />}

        {/* Timeframe filter */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/50 rounded-2xl p-1 shadow-inner">
            {[
              { key: "week", label: "Past Week" },
              { key: "month", label: "Past Month" },
              { key: "all", label: "All Time" },
            ].map((o) => (
              <Button
                key={o.key}
                variant={selectedTimeframe === o.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(o.key as any)}
                className={`rounded-xl ${
                  selectedTimeframe === o.key
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-white/30"
                }`}
              >
                {o.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Enhanced Mood Card - Featured prominently */}
        <div className="mb-8">
          <MoodCard 
            analytics={analytics} 
            journalEntries={filteredEntries} 
            selectedTimeframe={selectedTimeframe}
          />
        </div>

        {/* Detailed Breakdown - now full width */}
        <div className="mb-8">
          <Card className="p-6 bg-white/80 rounded-3xl">
            <h3 className="text-lg font-medium mb-4">Detailed Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(analytics.moodCounts)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([mood, count]) => (
                  <div
                    key={mood}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMoodEmoji(mood)}</span>
                      <span className="capitalize font-medium">{mood}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getMoodColor(mood)}>
                        {count} {count > 1 ? "entries" : "entry"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.round((count / analytics.totalEntries) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Fine-Grained Emotions */}
        {analytics.topFineEmotions?.length > 0 && (
          <Card className="p-6 bg-white/80 rounded-3xl mb-8">
            <h3 className="text-lg font-medium mb-4">Top Fine-Grained Emotions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {analytics.topFineEmotions.map((e, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                >
                  <span className="text-2xl mb-1">{getMoodEmoji(e.label)}</span>
                  <span className="capitalize font-medium text-sm">{e.label}</span>
                  <span className="text-xs text-gray-600">
                    {Math.round(e.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Rewards */}
        {analytics.rewards.length > 0 && (
          <div className="mb-8">
            <Card className="p-6 bg-yellow-50 rounded-3xl">
              <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                <span>🏆</span>
                <span>Achievements & Rewards</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.rewards.map((reward, index) => {
                  const rewardId = `${reward.type}-${reward.coinReward}`;
                  const isClaimed = claimedRewards.includes(rewardId);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border-2 ${
                        isClaimed
                          ? "bg-gray-100 border-gray-300"
                          : "bg-white border-yellow-300 shadow-lg"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{reward.emoji}</div>
                        <Button
                          size="sm"
                          disabled={isClaimed}
                          onClick={() => handleClaimReward(reward)}
                          className={`rounded-full ${
                            isClaimed
                              ? "bg-gray-300 text-gray-500"
                              : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                          }`}
                        >
                          {isClaimed
                            ? "Claimed ✓"
                            : `Claim +${reward.coinReward} 🪙`}
                        </Button>
                      </div>
                      <h4 className="font-medium mb-2">{reward.title}</h4>
                      <p className="text-sm text-gray-600">
                        {reward.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Journal History */}
        <Card className="p-6 bg-white/80 rounded-3xl">
          <h3 className="text-lg font-medium mb-4">
            Journal History ({selectedTimeframe})
          </h3>
          <div className="max-h-96 overflow-y-auto space-y-3 -mr-2 pr-2">
            {filteredEntries
              .slice()
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-3 rounded-xl bg-gray-50 border"
                >
                  <div className="text-2xl pt-1">
                    {getMoodEmoji(entry.mood)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm mb-2">
                      {entry.content.slice(0, 150)}
                      {entry.content.length > 150 && "..."}
                    </p>
                    {entry.aiAnalysis && (
                      <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-2 py-1 mb-2">
                        🤖 {entry.aiAnalysis}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-2">
                        {entry.sarcastic && (
                          <Badge variant="destructive" className="text-xs">
                            Sarcastic
                          </Badge>
                        )}
                        <Badge
                          className={`${getMoodColor(
                            entry.mood
                          )} text-xs capitalize`}
                        >
                          {entry.mood}
                        </Badge>
                      </div>
                    </div>
                    {entry.confidence !== undefined && (
                      <div className="mt-2">
                        <ConfidenceTooltip confidence={entry.confidence} />
                      </div>
                    )}
                    {entry.fineEmotions && entry.fineEmotions.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        Fine emotions:{" "}
                        {entry.fineEmotions
                          .slice(0, 3)
                          .map(
                            (fe) =>
                              `${fe.label} (${Math.round(fe.score * 100)}%)`
                          )
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
