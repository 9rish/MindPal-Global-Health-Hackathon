import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Timer, Flame, Star, ChevronUp, ChevronDown, Sparkles, Medal, Zap, ArrowLeft } from "lucide-react";

const palette = {
  bg: "#F0F4FF",
  card: "#ffffff",
  text: "#0f172a",
  subtext: "#64748b",
  gradBlue: "bg-gradient-to-r from-[#4F7CFB] via-[#5AB9F6] to-[#7BE3F2]",
  gradGreen: "bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#6EE7B7]",
  gradPurple: "bg-gradient-to-r from-[#7B3FE4] via-[#8B5CF6] to-[#A78BFA]",
  gradGold: "bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#FDE047]",
  gradRose: "bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#FBCFE8]",
  gold: "#F59E0B",
  silver: "#9CA3AF",
  bronze: "#D97706",
};

const floatingElements = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 40 + 20,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 5,
}));

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type Player = {
  id: number | string;
  name: string;
  country?: string;
  xp: number;
  streak?: number;
  avatar?: string;
  delta?: number;
  me?: boolean;
};

type Props = {
  league?: string;
  timeRemaining?: string;
  players?: Player[];
  onNavigate?: (screen: string) => void;
};

const Avatar: React.FC<{ label: string; isMe?: boolean; rank: number }> = ({ label, isMe, rank }) => (
  <div className={cx(
    "relative w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg transition-all duration-300 border-2 drop-shadow-md border-white/50",
    rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-100 shadow-yellow-300/50" :
    rank === 2 ? "bg-gradient-to-br from-slate-400 to-slate-600 text-slate-100 shadow-slate-300/50" :
    rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-orange-100 shadow-orange-300/50" :
    isMe ? "bg-gradient-to-br from-purple-500 to-purple-700 text-purple-100 shadow-purple-300/50" :
    "bg-gradient-to-br from-blue-500 to-blue-700 text-blue-100 shadow-blue-300/50"
  )}>
    {label}
    {rank <= 3 && (
      <motion.div 
        className="absolute -top-2 -right-2"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles size={16} className="text-white drop-shadow-lg" />
      </motion.div>
    )}
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; variant?: "blue" | "green" | "purple" | "gold" | "rose" }> = ({ children, variant = "blue" }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={cx(
      "px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20",
      variant === "blue" && palette.gradBlue,
      variant === "green" && palette.gradGreen,
      variant === "purple" && palette.gradPurple,
      variant === "gold" && palette.gradGold,
      variant === "rose" && palette.gradRose
    )}
  >
    {children}
  </motion.div>
);

const RankMovement: React.FC<{ delta?: number }> = ({ delta }) => {
  if (!delta) return null;
  const up = delta > 0;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cx(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border shadow-sm",
        up ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
      )}
      title={up ? `Up ${delta}` : `Down ${Math.abs(delta)}`}
    >
      {up ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {Math.abs(delta)}
    </motion.span>
  );
};

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const iconProps = { size: 20 };
  if (rank === 1) return (
    <motion.div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <Crown {...iconProps} className="text-yellow-900" />
    </motion.div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
      <Medal {...iconProps} className="text-gray-100" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
      <Trophy {...iconProps} className="text-orange-100" />
    </div>
  );
  return <div className="w-8" />;
};

const Row: React.FC<{ index: number; p: Player }> = ({ index, p }) => {
  const rank = index + 1;
  const [isHovered, setIsHovered] = useState(false);
  const bgClass = p.me ? "bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50" : rank <= 3 ? "bg-gradient-to-r from-white via-yellow-50 to-white" : "bg-white";
  const borderClass = p.me ? "border-purple-200" : rank <= 3 ? "border-yellow-200" : "border-slate-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring", damping: 20 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cx("relative flex items-center gap-4 px-6 py-5 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden", bgClass, borderClass)}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: "200%" } : { x: "-100%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div className={cx("w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg border border-white/30", rank <= 3 ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900" : "bg-white text-slate-800 shadow-slate-200")}>
        {rank}
      </div>
      <RankIcon rank={rank} />
      <Avatar label={p.avatar ?? p.name[0].toUpperCase()} isMe={p.me} rank={rank} />
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <motion.span className={cx("truncate font-bold text-lg drop-shadow-md", p.me ? "text-purple-900" : rank <= 3 ? "text-slate-900" : "text-slate-800")}
            animate={p.me ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {p.name}
          </motion.span>
          {p.country && <span className="text-xl leading-none drop-shadow-md" title="Country">{p.country}</span>}
          {p.me && <Chip variant="purple"><Sparkles size={12} className="mr-1" />You</Chip>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700 font-semibold drop-shadow-md">MindPal XP</span>
          {p.streak && <motion.div className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          ><Flame size={14} /> {p.streak} day streak</motion.div>}
          <RankMovement delta={p.delta} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Chip variant={rank === 1 ? "gold" : rank === 2 ? "blue" : rank === 3 ? "rose" : "green"}><Zap size={14} className="mr-1" />{p.xp.toLocaleString()} XP</Chip>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC = () => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 text-center">
    <motion.div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
      <Trophy className="text-slate-400" size={32} />
    </motion.div>
    <h3 className="text-xl font-bold text-slate-800 mb-2 drop-shadow-sm">No players yet!</h3>
    <p className="text-slate-600 font-medium">Complete quests to appear on the leaderboard and compete with others.</p>
  </motion.div>
);

const LeaderboardHeader: React.FC<{ league: string; timeRemaining: string }> = ({ league, timeRemaining }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl shadow-xl p-8 bg-gradient-to-br from-white via-purple-50 to-blue-50 border border-purple-100 mb-8 relative overflow-hidden">
    {/* Header content (league name, XP badges, timer, etc.) */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full -translate-y-16 translate-x-16" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12" />
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className="flex items-center gap-4">
        <motion.div className={cx("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl", palette.gradPurple)} animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          <Trophy size={32} />
        </motion.div>
        <div>
          <motion.h1 className="text-3xl font-bold text-yellow-800 drop-shadow-md" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {league}
          </motion.h1>
          <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <Timer size={16} className="text-orange-500" /> 
            <span className="font-semibold text-orange-600">{timeRemaining}</span> remaining
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Chip variant="blue">Weekly Challenge</Chip>
        <Chip variant="green">Top 10 Advance</Chip>
      </div>
    </div>
    {/* Trophy showcase */}
    <div className="flex items-center gap-6 relative z-10">
      <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
        <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg">
          <Crown className="text-yellow-900" size={24} />
        </div>
        <span className="text-sm font-bold text-yellow-700 ml-2">1st</span>
      </motion.div>
      <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
        <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-gray-300 to-gray-500 flex items-center justify-center shadow-lg">
          <Medal className="text-gray-100" size={24} />
        </div>
        <span className="text-sm font-bold text-gray-600 ml-2">2nd</span>
      </motion.div>
      <motion.div className="flex items-center gap-1" whileHover={{ scale: 1.05 }}>
        <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-orange-300 to-orange-500 flex items-center justify-center shadow-lg">
          <Trophy className="text-orange-100" size={24} />
        </div>
        <span className="text-sm font-bold text-orange-700 ml-2">3rd</span>
      </motion.div>
      <div className="flex items-center gap-1 opacity-60">
        <div className="w-12 h-14 rounded-xl bg-gradient-to-b from-slate-200 to-slate-400 flex items-center justify-center">
          <Star className="text-slate-600" size={20} />
        </div>
        <span className="text-sm font-medium text-slate-500 ml-2">4th+</span>
      </div>
    </div>
  </motion.div>
);

const defaultPlayers: Player[] = [
  { id: 1, name: "Deep", country: "🇮🇳", xp: 2450, streak: 12, delta: 2, me: false },
  { id: 2, name: "Vaibhav", country: "🇮🇳", xp: 2380, streak: 8, delta: -1, me: true },
  { id: 3, name: "Nax", country: "🇮🇳", xp: 2320, streak: 15, delta: 1, me: false },
  { id: 4, name: "Prisha", country: "🇮🇳", xp: 2280, streak: 6, delta: 3, me: false },
  { id: 5, name: "Arjun", country: "🇮🇳", xp: 2150, streak: 4, delta: -2, me: false },
  { id: 6, name: "Kavya", country: "🇮🇳", xp: 2090, streak: 9, delta: 0, me: false },
  { id: 7, name: "Dev", country: "🇮🇳", xp: 1980, streak: 3, delta: 1, me: false },
  { id: 8, name: "Ishika", country: "🇮🇳", xp: 1920, streak: 7, delta: -1, me: false },
];

export default function MindPalLeaderboard({ league = "Gold League", timeRemaining = "3 days", players = defaultPlayers, onNavigate }: Props) {
  const safePlayers = Array.isArray(players) ? players : defaultPlayers;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: palette.bg }}>
      {floatingElements.map(e => (
        <motion.div key={e.id} className="absolute rounded-full opacity-10"
          style={{ width: e.size, height: e.size, left: `${e.x}%`, top: `${e.y}%` }}
          animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 flex items-start justify-center p-8">
        <div className="max-w-2xl w-full">
          
          {/* Back button outside header */}
          {onNavigate && (
            <button
              onClick={() => onNavigate("home")}
              className="absolute -top-4 left-0 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition z-20"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <LeaderboardHeader league={league} timeRemaining={timeRemaining} />

          <motion.div className="space-y-4 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <AnimatePresence>
              {safePlayers.length === 0 ? <EmptyState /> : safePlayers.map((p, i) => <Row key={p.id} index={i} p={p} />)}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
