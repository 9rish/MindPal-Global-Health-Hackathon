import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

interface DuelProps {
  petEmoji: string;
  onBack: () => void;
  onFinish: (reward: { happiness: number; coins: number }) => void;
}

type Lane = 0 | 1 | 2; // 3 lanes

const GOOD_ITEMS = ["💰", "❤️", "⚡"];
const BAD_ITEMS = ["❌", "🚧", "💣"];
const NUM_LANES = 3;
const STARTING_LIVES = 3;

export default function PetTrainerDuel({ petEmoji, onBack, onFinish }: DuelProps) {
  const [lane, setLane] = useState<Lane>(1);
  const [lives, setLives] = useState<number>(STARTING_LIVES);
  const [coins, setCoins] = useState<number>(0);
  const [objects, setObjects] = useState<{ id: number; lane: Lane; y: number; type: string; good: boolean }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isHit, setIsHit] = useState(false);

  // Refs
  const objectId = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const gameTime = useRef(0);
  const objectSpeed = useRef(150);

  // Movement controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isRunning) return;
      if (e.code === "ArrowLeft" && lane > 0) setLane((l) => (l - 1) as Lane);
      if (e.code === "ArrowRight" && lane < NUM_LANES - 1) setLane((l) => (l + 1) as Lane);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, lane]);

  // Game loop
  const gameLoop = (timestamp: number) => {
    if (!lastTime.current) lastTime.current = timestamp;
    const deltaTime = (timestamp - lastTime.current) / 1000;
    lastTime.current = timestamp;
    gameTime.current += deltaTime;

    // Speed ramps up
    objectSpeed.current = 150 + Math.floor(gameTime.current / 10) * 40;

    // Move objects
    setObjects((obs) =>
      obs
        .map((o) => ({
          ...o,
          y: o.y + objectSpeed.current * deltaTime,
        }))
        .filter((o) => o.y < 700)
    );

    // Spawn objects
    if (Math.random() < 0.009 + gameTime.current * 0.0003) {
      objectId.current++;
      const isGood = Math.random() < 0.55; 
      const type = isGood
        ? GOOD_ITEMS[Math.floor(Math.random() * GOOD_ITEMS.length)]
        : BAD_ITEMS[Math.floor(Math.random() * BAD_ITEMS.length)];
      setObjects((obs) => [
        ...obs,
        {
          id: objectId.current,
          lane: Math.floor(Math.random() * NUM_LANES) as Lane,
          y: -50,
          type,
          good: isGood,
        },
      ]);
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  // Collision check
  useEffect(() => {
    if (!isRunning || isHit) return;
    const petY = 640;

    const collision = objects.find(
      (o) => o.lane === lane && o.y > petY - 50 && o.y < petY + 50
    );

    if (collision) {
      if (collision.good) {
        // ✅ Collect rewards
        if (collision.type === "💰") setCoins((c) => c + 2);
        if (collision.type === "❤️") setLives((prev) => Math.min(STARTING_LIVES, prev + 1));
        if (collision.type === "⚡") setCoins((c) => c + 1); // temporary boost
      } else {
        // ❌ Take damage
        setLives((prevLives) => {
          if (prevLives > 1) {
            setIsHit(true);
            setTimeout(() => setIsHit(false), 300);
            return prevLives - 1;
          } else {
            setIsRunning(false);
            setGameOver(true);
            return 0;
          }
        });
      }

      // Remove collided object
      setObjects((obs) => obs.filter((o) => o.id !== collision.id));
    }
  }, [objects, lane, isRunning, isHit]);

  // Stop game loop on end
  useEffect(() => {
    if (isRunning) {
      lastTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isRunning]);

  const startGame = () => {
    setObjects([]);
    setLane(1);
    setLives(STARTING_LIVES);
    setCoins(0);
    setIsRunning(true);
    setGameOver(false);
    lastTime.current = 0;
    gameTime.current = 0;
    objectSpeed.current = 150;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-200 to-blue-400 rounded-2xl shadow-xl w-full max-w-lg mx-auto">
      {!isRunning && !gameOver && (
        <button
          onClick={startGame}
          className="w-full py-3 bg-green-500 text-white rounded-xl mb-4"
        >
          Start Duel
        </button>
      )}

      {gameOver && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-red-600 mb-2">💥 Game Over!</p>
          <p className="text-lg mb-2">You collected {coins} coins!</p>
          <button
            onClick={() => {
              onFinish({ happiness: coins, coins });
              startGame();
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Collect Rewards & Play Again
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1 text-2xl">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i}>❤️</span>
          ))}
        </div>
        <span className="text-lg">🪙 {coins}</span>
        <span className="text-sm text-gray-700">
          Time: {Math.floor(gameTime.current)}s
        </span>
      </div>

      <div className="relative w-[470px] h-[700px] bg-blue-100 rounded-lg overflow-hidden flex border-b-4 border-blue-500">
        {Array.from({ length: NUM_LANES }).map((_, i) => (
          <div key={i} className="flex-1 relative border-r-4 border-blue-300 last:border-r-0">
            {objects
              .filter((o) => o.lane === i)
              .map((o) => (
                <div
                  key={o.id}
                  className={`absolute w-14 h-14 rounded-lg flex items-center justify-center text-2xl ${
                    o.good ? "text-yellow-500" : "text-red-600"
                  }`}
                  style={{
                    top: o.y,
                    left: `calc(50%)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {o.type}
                </div>
              ))}
          </div>
        ))}

        <motion.div
          className={`absolute bottom-0 text-5xl transition-all duration-200 ${
            isHit ? "opacity-50" : ""
          }`}
          style={{
            left: `${(lane * 100) / NUM_LANES + (100 / NUM_LANES) / 2}%`,
            transform: "translateX(-50%)",
          }}
        >
          {petEmoji}
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <button onClick={onBack} className="px-4 py-2 bg-red-500 text-white rounded-lg">
          Quit
        </button>
      </div>
    </div>
  );
}
