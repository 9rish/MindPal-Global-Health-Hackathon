"use client";
import { Button } from './ui/button';
import { api } from '../utils/api';
import { useState, useEffect, React } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { ArrowLeft, Coins, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { PetAnimation } from './PetAnimation';
import { Pet } from '../types';
import { supabase } from '../utils/supabase/client'; // Import the Supabase client

interface Accessory {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'hat' | 'outfit' | 'accessory' | 'background';
  description: string;
}

interface CustomizationScreenProps {
  pet: Pet;
  coins: number;
  onCoinsUpdate: (coins: number) => void;
  onBack: () => void;
}

// Define a simple User type for state management
interface User {
  id: string;
}

export function CustomizationScreen({ pet, coins, onCoinsUpdate, onBack }: CustomizationScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('hat');
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [petMood, setPetMood] = useState<'calm' | 'dancing' | 'hungry'>('calm');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch the current user from Supabase auth when the component loads
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user as User);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('owned_items')
          .eq('id', user.id)
          .single();
        if (profile) {
          setOwnedItems(profile.owned_items || []);
        }
      }
    };

    fetchUser();
  }, []);

  const accessories: Accessory[] = [
    // Your accessories data remains unchanged...
    // Hats
    { id: 'hat1', name: 'Party Hat', emoji: '🎉', price: 50, category: 'hat', description: 'Perfect for celebrations!' },
    { id: 'hat2', name: 'Crown', emoji: '👑', price: 100, category: 'hat', description: 'Fit for royalty' },
    { id: 'hat3', name: 'Wizard Hat', emoji: '🧙‍♂️', price: 75, category: 'hat', description: 'Magical vibes' },
    { id: 'hat4', name: 'Sun Hat', emoji: '👒', price: 40, category: 'hat', description: 'Stay cool in style' },

    // Outfits
    { id: 'outfit1', name: 'Superhero Cape', emoji: '🦸‍♀️', price: 80, category: 'outfit', description: 'Save the day!' },
    { id: 'outfit2', name: 'Cozy Sweater', emoji: '🧥', price: 60, category: 'outfit', description: 'Warm and comfy' },
    { id: 'outfit3', name: 'Formal Tux', emoji: '🤵', price: 120, category: 'outfit', description: 'Dressed to impress' },
    { id: 'outfit4', name: 'Rainbow Scarf', emoji: '🌈', price: 45, category: 'outfit', description: 'Colorful and cheerful' },

    // Accessories
    { id: 'acc1', name: 'Sunglasses', emoji: '😎', price: 35, category: 'accessory', description: 'Cool and trendy' },
    { id: 'acc2', name: 'Bow Tie', emoji: '🎀', price: 30, category: 'accessory', description: 'Classy touch' },
    { id: 'acc3', name: 'Flower Crown', emoji: '🌸', price: 55, category: 'accessory', description: 'Nature-inspired beauty' },
    { id: 'acc4', name: 'Magic Wand', emoji: '🪄', price: 65, category: 'accessory', description: 'Cast happiness spells' },

    // Backgrounds
    { id: 'bg1', name: 'Beach Paradise', emoji: '🏖️', price: 90, category: 'background', description: 'Tropical vibes' },
    { id: 'bg2', name: 'Space Station', emoji: '🚀', price: 110, category: 'background', description: 'Out of this world' },
    { id: 'bg3', name: 'Enchanted Forest', emoji: '🌲', price: 85, category: 'background', description: 'Mystical and magical' },
    { id: 'bg4', name: 'Cozy Cabin', emoji: '🏠', price: 70, category: 'background', description: 'Home sweet home' },
  ];

  const categories = [
    { id: 'hat', name: 'Hats', emoji: '🎩' },
    { id: 'outfit', name: 'Outfits', emoji: '👔' },
    { id: 'accessory', name: 'Accessories', emoji: '✨' },
    { id: 'background', name: 'Backgrounds', emoji: '🎨' },
    { id: 'premium', name: 'Premium', emoji: '💎' } // Added for the new section
  ];

  const filteredAccessories = accessories.filter(acc => acc.category === selectedCategory);

  const purchaseItem = async (accessory: Accessory) => {
    if (coins >= accessory.price && !ownedItems.includes(accessory.id)) {
      const newCoins = coins - accessory.price;
      const newOwnedItems = [...ownedItems, accessory.id];

      onCoinsUpdate(newCoins);
      setOwnedItems(newOwnedItems);

      if (user) {
        await supabase
          .from('profiles')
          .update({ owned_items: newOwnedItems })
          .eq('id', user.id);
      }


      setPetMood('dancing');
      setTimeout(() => setPetMood('calm'), 2000);

      const celebration = document.createElement('div');
      celebration.innerHTML = `${accessory.emoji} Purchased!`;
      celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-purple-600 pointer-events-none z-50 animate-bounce';
      document.body.appendChild(celebration);
      setTimeout(() => celebration.remove(), 2000);
    }
  };

  const handleEnablePremium = async () => {
    if (!user) {
      alert('You must be logged in to enable premium.');
      return;
    }

    try {
      await api.updateProfile(user.id, { is_premium: true });
      alert('Premium enabled successfully! ✨ You now have access to all exclusive features.');
    } catch (error) {
      console.error('Failed to enable premium:', error);
      alert('There was an error enabling premium. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-100 via-purple-50 to-violet-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-200 to-yellow-300 px-4 py-2 rounded-full">
            <Coins className="w-5 h-5" />
            <span className="font-medium">{coins}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-6xl mb-4"
          >
            🛍️
          </motion.div>
          <h1 className="text-3xl font-medium text-gray-800 mb-2">Pet Boutique</h1>
          <p className="text-gray-600">Customize {pet.name} with adorable outfits and accessories!</p>
        </div>

        {/* Pet Preview */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-8 mb-8 text-center">
          <PetAnimation pet={pet} mood={petMood} size={180} />
          <h2 className="text-2xl font-medium text-gray-800 mb-2">{pet.name}</h2>
          <p className="text-gray-600">Ready for a makeover!</p>
        </Card>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`flex items-center space-x-2 rounded-full px-6 py-3 font-medium ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                  : 'hover:bg-purple-50'
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Conditional Rendering for Premium Section */}
        {selectedCategory === 'premium' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
                <h2 className="text-2xl font-medium text-gray-800">MindPal Premium</h2>
              </div>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Upgrade to unlock exclusive pets, accessories, and special features to enhance your wellness journey!
              </p>
              <Button
                onClick={handleEnablePremium}
                className="w-full max-w-xs mx-auto bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-full px-6 py-3 font-medium"
                disabled={!user} // Button is disabled if user is not logged in
              >
                Enable Premium
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAccessories.map((accessory, index) => {
                const isOwned = ownedItems.includes(accessory.id);
                const canAfford = coins >= accessory.price;

                return (
                  <motion.div
                    key={accessory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-6 border-0 shadow-lg rounded-2xl transition-all duration-300 ${
                      isOwned
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200'
                        : 'bg-white/80 backdrop-blur-sm hover:shadow-xl hover:scale-105'
                    }`}>
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{accessory.emoji}</div>
                        <h3 className="font-medium text-gray-800 mb-1">{accessory.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{accessory.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <Coins className="w-4 h-4" />
                          <span className="font-medium">{accessory.price}</span>
                        </div>

                        {isOwned ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium text-sm">Owned</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => purchaseItem(accessory)}
                            disabled={!canAfford}
                            className={`rounded-full px-4 py-2 font-medium text-sm ${
                              canAfford
                                ? 'bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Buy
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            {filteredAccessories.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Coming Soon!</h3>
                  <p className="text-gray-600">More items will be added to this category soon.</p>
                </div>
              )}
          </>
        )}

        {/* Tips Card */}
        <Card className="bg-gradient-to-r from-blue-100 to-indigo-100 border-0 shadow-lg rounded-2xl p-6 mt-8">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">Pro Tip</h3>
              <p className="text-gray-600 text-sm">
                Complete daily quests and journal regularly to earn more coins for customization!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}