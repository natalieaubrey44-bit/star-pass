import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { CreditCard, Package, Trash2, ChevronRight, User, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CardData {
  celebrity: string;
  previewUrl: string;
  formData: {
    cardFor: string;
    location?: string;
    memberId?: string;
    memberSince?: string;
    validUntil?: string;
  };
}

interface PurchaseHistory {
  id: string;
  created_at: string;
  tier: string;
  status: string;
  card_data: CardData;
}


export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      
      if (!isSupabaseConfigured) {
        setPurchases([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        toast.error('Failed to load purchase history');
      } else {
        setPurchases(data || []);
      }
      setLoading(false);
    };

    fetchPurchases();
  }, [user]);

  const clearHistory = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to clear history');
    } else {
      setPurchases([]);
      toast.success('Purchase history cleared');
    }
  };

  const deletePurchase = async (id: string) => {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete record');
    } else {
      setPurchases(prev => prev.filter(p => p.id !== id));
      toast.success('Record deleted');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* ... existing header ... */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-indigo-600">{(user?.email || 'Guest').split('@')[0]}</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Manage your orders and track your fan status.
            </p>
          </div>
          {purchases.length > 0 && (
            <button 
              onClick={clearHistory}
              className="px-6 py-3 rounded-2xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-all text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm space-y-6 self-start">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Profile Details</h3>
              <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Total Orders</span>
                <span className="text-sm font-bold text-gray-900">{purchases.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Member Since</span>
                <span className="text-sm font-bold text-gray-900">
                  {new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Activity/History List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-600" /> Recent Purchases
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-[32px] border border-black/5">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-gray-400 font-medium">Fetching history...</p>
              </div>
            ) : purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <motion.div
                    key={purchase.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[28px] border border-black/5 shadow-sm group hover:border-indigo-100 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{purchase.tier} Fan Card</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                            {purchase.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                          Ordered on {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <button 
                        onClick={() => deletePurchase(purchase.id)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSelectedPurchase(purchase)}
                        className="px-5 py-2.5 bg-gray-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 group/btn"
                      >
                        View Details <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[32px] border border-black/5 space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">No purchases found</h4>
                <p className="text-gray-400 max-w-xs font-medium">
                  You haven't ordered any fan cards yet. Start your journey today!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Purchase Detail Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setSelectedPurchase(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Card Details</h2>
                  <p className="text-gray-400 font-medium">Order ID: {selectedPurchase.id.slice(0, 8)}...</p>
                </div>
                <button 
                  onClick={() => setSelectedPurchase(null)}
                  className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="aspect-4/5 bg-gray-100 rounded-[32px] overflow-hidden border border-black/5 shadow-inner">
                  <img 
                    src={selectedPurchase.card_data.previewUrl} 
                    alt="Card Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Star Talent</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedPurchase.card_data.celebrity}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Card Holder</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedPurchase.card_data.formData.cardFor}</p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-sm font-bold text-emerald-600">{selectedPurchase.status}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tier</p>
                      <p className="text-sm font-bold text-gray-900">{selectedPurchase.tier}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 flex justify-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Official StarPass Verified Asset</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
