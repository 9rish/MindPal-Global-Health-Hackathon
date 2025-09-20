// src/components/DashboardWidgets.tsx
import React from "react";

// === Header ===
export const Header = ({ user, resetToPetSelection, handleLogout, isPremium, getStreakCount, coins }: any) => (
  <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow">
    <h1 className="text-xl font-bold">Welcome {user?.name || "Friend"}!</h1>
    <div className="flex items-center gap-4">
      <span>🔥 {getStreakCount()} day streak</span>
      <span>💰 {coins}</span>
      <button onClick={resetToPetSelection} className="px-3 py-1 bg-blue-500 text-white rounded-lg">
        Change Pet
      </button>
      <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded-lg">
        Logout
      </button>
    </div>
  </div>
);

// === MoodDisplay ===
export const MoodDisplay = ({ petMood }: { petMood: string }) => (
  <div className="p-4 text-center bg-yellow-100 rounded-xl shadow">
    <p className="text-lg font-medium">Your pet feels <strong>{petMood}</strong> today 🐾</p>
  </div>
);

// === ActionGroups ===
export const ActionGroups = ({ openGroup, toggleGroup, handlePremiumFeature, isPremium, setCurrentScreen, setShowPremiumModal }: any) => (
  <div className="grid grid-cols-2 gap-4 mt-6">
    <button onClick={() => setCurrentScreen("journal")} className="p-4 bg-white rounded-xl shadow">📝 Journal</button>
    <button onClick={() => setCurrentScreen("quests")} className="p-4 bg-white rounded-xl shadow">🎯 Quests</button>
    <button onClick={() => handlePremiumFeature("play")} className="p-4 bg-white rounded-xl shadow">🎮 Play</button>
    <button onClick={() => handlePremiumFeature("feed")} className="p-4 bg-white rounded-xl shadow">🍎 Feed</button>
    <button onClick={() => handlePremiumFeature("therapist")} className="p-4 bg-white rounded-xl shadow">🧑‍⚕️ Therapy</button>
    <button onClick={() => handlePremiumFeature("community")} className="p-4 bg-white rounded-xl shadow">🌍 Community</button>
  </div>
);

// === AnalyticsButton ===
export const AnalyticsButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl shadow">
    📊 View Analytics
  </button>
);

// === RecentJournals ===
export const RecentJournals = ({ journalEntries, selectedPet }: any) => (
  <div className="mt-6">
    <h2 className="text-lg font-bold mb-2">Recent Journals</h2>
    {journalEntries.slice(-3).map((entry: any) => (
      <div key={entry.id} className="p-3 bg-white rounded-xl shadow mb-2">
        <p className="text-sm">{entry.content}</p>
        <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
      </div>
    ))}
  </div>
);

// === RiskNudgeModal ===
export const RiskNudgeModal = ({ selectedPet, setShowRiskNudge }: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center">
      <h2 className="text-xl font-bold mb-4">We’re here for you 💙</h2>
      <p className="mb-4">Your pet {selectedPet?.name || "buddy"} noticed you’ve been feeling down lately. Want to talk to a therapist?</p>
      <button onClick={() => setShowRiskNudge(false)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Close</button>
    </div>
  </div>
);

// === PremiumModal ===
export const PremiumModal = ({ handleSubscribe, setShowPremiumModal }: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center">
      <h2 className="text-xl font-bold mb-4">Go Premium 👑</h2>
      <p className="mb-4">Unlock therapy, community, and more!</p>
      <button onClick={handleSubscribe} className="px-4 py-2 bg-green-500 text-white rounded-xl mr-2">Subscribe</button>
      <button onClick={() => setShowPremiumModal(false)} className="px-4 py-2 bg-gray-300 rounded-xl">Later</button>
    </div>
  </div>
);

// === MoodRewardModal ===
export const MoodRewardModal = ({ currentMoodReward, setUserData, setShowMoodReward, setCurrentMoodReward }: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center">
      <h2 className="text-xl font-bold mb-4">🎉 Reward Unlocked!</h2>
      <p className="mb-4">{currentMoodReward?.message || "You earned a bonus!"}</p>
      <button onClick={() => { setShowMoodReward(false); setCurrentMoodReward(null); }} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
        Awesome!
      </button>
    </div>
  </div>
);

// === PremiumSuccessModal ===
export const PremiumSuccessModal = ({ setShowPremiumSuccess }: any) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center">
      <h2 className="text-xl font-bold mb-4">🎉 Welcome to Premium!</h2>
      <p className="mb-4">You’ve unlocked all premium features.</p>
      <button onClick={() => setShowPremiumSuccess(false)} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
        Start Exploring
      </button>
    </div>
  </div>
);
