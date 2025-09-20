"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Coins, ShoppingBag, Sparkles, Star, Crown, Heart, Zap } from 'lucide-react';
import { PetAnimation } from './PetAnimation';
import { Pet } from '../types';

interface Accessory {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'hat' | 'outfit' | 'accessory' | 'background';
  description: string;
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface CustomizationScreenProps {
  pet: Pet;
  coins: number;
  onCoinsUpdate: (coins: number) => void;
  onBack: () => void;
}

export function CustomizationScreen({ pet, coins, onCoinsUpdate, onBack }: CustomizationScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('hat');
  const [ownedItems, setOwnedItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('mindpal-owned-items');
    return saved ? JSON.parse(saved) : [];
  });
  const [petMood, setPetMood] = useState<'calm' | 'dancing' | 'hungry'>('calm');
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  const accessories: Accessory[] = [
    // Hats
    { id: 'hat1', name: 'Party Hat', emoji: '🎉', price: 50, category: 'hat', description: 'Perfect for celebrations!', rarity: 'uncommon' },
    { id: 'hat2', name: 'Royal Crown', emoji: '👑', price: 150, category: 'hat', description: 'Fit for royalty', rarity: 'legendary' },
    { id: 'hat3', name: 'Wizard Hat', emoji: '🧙‍♂️', price: 100, category: 'hat', description: 'Magical vibes', rarity: 'epic' },
    { id: 'hat4', name: 'Sun Hat', emoji: '👒', price: 40, category: 'hat', description: 'Stay cool in style', rarity: 'uncommon' },
    { id: 'hat5', name: 'Santa Hat', emoji: '🎅', price: 75, category: 'hat', description: 'Ho ho ho!', rarity: 'rare' },
    { id: 'hat6', name: 'Graduation Cap', emoji: '🎓', price: 80, category: 'hat', description: 'Smart and scholarly', rarity: 'rare' },

    // Outfits
    { id: 'outfit1', name: 'Superhero Cape', emoji: '🦸‍♀️', price: 120, category: 'outfit', description: 'Save the day!', rarity: 'epic' },
    { id: 'outfit2', name: 'Cozy Sweater', emoji: '🧥', price: 60, category: 'outfit', description: 'Warm and comfy', rarity: 'uncommon' },
    { id: 'outfit3', name: 'Formal Tuxedo', emoji: '🤵', price: 180, category: 'outfit', description: 'Dressed to impress', rarity: 'legendary' },
    { id: 'outfit4', name: 'Rainbow Scarf', emoji: '🌈', price: 45, category: 'outfit', description: 'Colorful and cheerful', rarity: 'uncommon' },
    { id: 'outfit5', name: 'Ninja Outfit', emoji: '🥷', price: 110, category: 'outfit', description: 'Stealthy and cool', rarity: 'epic' },
    { id: 'outfit6', name: 'Princess Dress', emoji: '👗', price: 90, category: 'outfit', description: 'Royal elegance', rarity: 'rare' },

    // Accessories
    { id: 'acc1', name: 'Cool Sunglasses', emoji: '😎', price: 35, category: 'accessory', description: 'Cool and trendy', rarity: 'uncommon' },
    { id: 'acc2', name: 'Bow Tie', emoji: '🎀', price: 30, category: 'accessory', description: 'Classy touch', rarity: 'uncommon' },
    { id: 'acc3', name: 'Flower Crown', emoji: '🌸', price: 55, category: 'accessory', description: 'Nature-inspired beauty', rarity: 'rare' },
    { id: 'acc4', name: 'Magic Wand', emoji: '🪄', price: 85, category: 'accessory', description: 'Cast happiness spells', rarity: 'epic' },
    { id: 'acc5', name: 'Golden Necklace', emoji: '📿', price: 120, category: 'accessory', description: 'Luxurious shine', rarity: 'legendary' },
    { id: 'acc6', name: 'Butterfly Wings', emoji: '🦋', price: 70, category: 'accessory', description: 'Fly with grace', rarity: 'rare' },

    // Backgrounds
    { id: 'bg1', name: 'Beach Paradise', emoji: '🏖️', price: 90, category: 'background', description: 'Tropical vibes', rarity: 'rare' },
    { id: 'bg2', name: 'Space Odyssey', emoji: '🚀', price: 140, category: 'background', description: 'Out of this world', rarity: 'epic' },
    { id: 'bg3', name: 'Enchanted Forest', emoji: '🌲', price: 85, category: 'background', description: 'Mystical and magical', rarity: 'rare' },
    { id: 'bg4', name: 'Cozy Cabin', emoji: '🏠', price: 70, category: 'background', description: 'Home sweet home', rarity: 'uncommon' },
    { id: 'bg5', name: 'Crystal Palace', emoji: '🏰', price: 200, category: 'background', description: 'Majestic royal setting', rarity: 'legendary' },
    { id: 'bg6', name: 'Cherry Blossom', emoji: '🌸', price: 95, category: 'background', description: 'Serene beauty', rarity: 'rare' },
  ];

  const categories = [
    { id: 'hat', name: 'Hats', emoji: '🎩', gradient: 'from-blue-400 to-blue-600' },
    { id: 'outfit', name: 'Outfits', emoji: '👔', gradient: 'from-purple-400 to-purple-600' },
    { id: 'accessory', name: 'Accessories', emoji: '✨', gradient: 'from-pink-400 to-pink-600' },
    { id: 'background', name: 'Backgrounds', emoji: '🎨', gradient: 'from-teal-400 to-teal-600' },
  ];

  const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'uncommon': return 'from-green-10 to-green-500'; // Light green
    case 'rare': return 'to-blue-600 from-blue-400'; // Blue
    case 'epic': return 'from-purple-200 to-purple-600'; // Purple
    case 'legendary': return 'from-amber-400 to-orange-500'; // Gold/Orange
    default: return 'from-gray-500 to-gray-600';
  }
};


  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return <Star className="w-3 h-3" />;
      case 'rare': return <Sparkles className="w-3 h-3" />;
      case 'epic': return <Zap className="w-3 h-3" />;
      case 'legendary': return <Crown className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const filteredAccessories = accessories
    .filter(acc => acc.category === selectedCategory)
    .sort((a, b) => {
      // Sort by rarity (legendary first), then by price
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, uncommon: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      return rarityDiff !== 0 ? rarityDiff : b.price - a.price;
    });

  const purchaseItem = async (accessory: Accessory) => {
    if (coins >= accessory.price && !ownedItems.includes(accessory.id)) {
      setPurchasingItem(accessory.id);
      
      // Simulate purchase delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newCoins = coins - accessory.price;
      const newOwnedItems = [...ownedItems, accessory.id];

      onCoinsUpdate(newCoins);
      setOwnedItems(newOwnedItems);
      localStorage.setItem('mindpal-owned-items', JSON.stringify(newOwnedItems));

      // Show pet dancing animation
      setPetMood('dancing');
      setTimeout(() => setPetMood('calm'), 3000);

      // Enhanced purchase celebration
      const celebration = document.createElement('div');
      celebration.innerHTML = `
        <div class="flex items-center gap-2 bg-gradient-to-r ${getRarityColor(accessory.rarity)} text-white px-6 py-3 rounded-2xl shadow-2xl">
          <span class="text-2xl">${accessory.emoji}</span>
          <div>
            <div class="font-bold">${accessory.name}</div>
            <div class="text-sm opacity-90">Successfully purchased!</div>
          </div>
        </div>
      `;
      celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-bounce';
      document.body.appendChild(celebration);
      setTimeout(() => celebration.remove(), 3000);

      setPurchasingItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full px-4 py-2 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-6 py-3 rounded-full shadow-lg">
              <Coins className="w-5 h-5 text-yellow-700" />
              <span className="font-bold text-yellow-800 text-lg">{coins}</span>
            </div>
            
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              {ownedItems.length} Items Owned
            </Badge>
          </div>
        </div>

        {/* Enhanced Title Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="text-7xl mb-4"
          >
            🛍️
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Pet Boutique
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transform {pet.name} with magical outfits, enchanting accessories, and stunning backgrounds!
          </p>
        </div>

        {/* Enhanced Pet Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <Card className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600"></div>
            <CardContent className="p-8 text-center">
              <div className="relative">
                <motion.div
                  animate={petMood === 'dancing' ? { 
                    scale: [1, 1.1, 1], 
                    rotate: [0, 5, -5, 0] 
                  } : {}}
                  transition={{ duration: 0.5, repeat: petMood === 'dancing' ? 3 : 0 }}
                >
                  <PetAnimation pet={pet} mood={petMood} size={200} />
                </motion.div>
                
                {petMood === 'dancing' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-4 -right-4 text-4xl"
                  >
                    🎉
                  </motion.div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-4">{pet.name}</h2>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Ready for a magical makeover!
              </p>
              
              <div className="flex justify-center gap-2 mt-4">
                <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                  Level {(pet as any).level || 1}
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border border-blue-200">
                  {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
</Badge>
</div>
</CardContent>
</Card>
</motion.div>
  {/* Enhanced Category Tabs */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mb-10"
  >
    <div className="flex justify-center">
      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/30">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-3 rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-white/70 hover:shadow-md'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span>{category.name}</span>
              <Badge variant="secondary" className="ml-1 bg-white/20 text-current border-0">
                {accessories.filter(acc => acc.category === category.id).length}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  </motion.div>

  {/* Enhanced Items Grid */}
  <AnimatePresence mode="wait">
    <motion.div
      key={selectedCategory}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10"
    >
      {filteredAccessories.map((accessory, index) => {
        const isOwned = ownedItems.includes(accessory.id);
        const canAfford = coins >= accessory.price;
        const isPurchasing = purchasingItem === accessory.id;

        return (
          <motion.div
            key={accessory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={!isOwned ? { scale: 1.03, y: -5 } : {}}
          >
            <Card className={`border-0 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 ${
              isOwned 
                ? 'bg-gradient-to-br from-green-100 via-emerald-50 to-green-100 ring-2 ring-green-300' 
                : 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm hover:shadow-2xl'
            }`}>
              {/* Rarity Indicator */}
              <div className={`h-2 bg-gradient-to-r ${getRarityColor(accessory.rarity)}`} />
              
              <CardContent className="p-6">
                {/* Item Header */}
                <div className="text-center mb-4 flex flex-col items-center gap-2">
                  {/* Rarity Badge on top */}
                  <Badge
                    className={`bg-gradient-to-r ${getRarityColor(accessory.rarity)} text-white border-0 px-2 py-1 flex items-center gap-1`}
                  >
                    {getRarityIcon(accessory.rarity)}
                    <span className="text-xs capitalize">{accessory.rarity}</span>
                  </Badge>

                  {/* Emoji */}
                  <motion.div 
                    className="text-5xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {accessory.emoji}
                  </motion.div>

                  {/* Name & Description */}
                  <h3 className="font-bold text-gray-800 text-lg">{accessory.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{accessory.description}</p>
                </div>
                
                {/* Item Footer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="font-bold text-yellow-700">{accessory.price}</span>
                    </div>
                  </div>

                  {isOwned ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-full font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Owned</span>
                    </motion.div>
                  ) : (
                    <Button
                      onClick={() => purchaseItem(accessory)}
                      disabled={!canAfford || isPurchasing}
                      className={`w-full rounded-full py-3 font-medium transition-all duration-200 ${
                        canAfford && !isPurchasing
                          ? `bg-gradient-to-r ${getRarityColor(accessory.rarity)} hover:shadow-lg text-white`
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isPurchasing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Purchasing...
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          {canAfford ? 'Purchase' : 'Not Enough Coins'}
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  </AnimatePresence>

  {/* Empty State */}
  {filteredAccessories.length === 0 && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="text-8xl mb-6">🎨</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon!</h3>
      <p className="text-gray-600 text-lg max-w-md mx-auto">
        We're working on adding more amazing items to this category. Check back soon for new arrivals!
      </p>
    </motion.div>
  )}

  {/* Enhanced Tips Section */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <Card className="bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 border-0 shadow-xl rounded-3xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-400 to-pink-500"></div>
      <CardContent className="p-8">
        <div className="flex items-center gap-6">
          <motion.div 
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            💡
          </motion.div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Pro Shopping Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span>Complete daily quests to earn coins</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📝</span>
                <span>Journal regularly for bonus rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span>Legendary items are the rarest finds</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span>Mix and match for unique looks</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
</div>
</div> );
}