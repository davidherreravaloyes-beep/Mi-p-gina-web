import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Gavel, Calendar, FileText, Heart, Star, ExternalLink, Gamepad2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const [userData, setUserData] = useState<any>(null);
  const [userScripts, setUserScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          const q = query(collection(db, 'scripts'), where('authorId', '==', userId));
          const querySnapshot = await getDocs(q);
          const scripts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserScripts(scripts);
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [isOpen, userId]);

  const isAdmin = userData?.email === 'davidherreravaloyes@gmail.com' || userData?.email === 'herreravaloyesa@gmail.com';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="min-h-screen w-full bg-[#0a0a0c] flex flex-col relative"
          >
            {/* Navigation Header */}
            <div className="sticky top-0 z-50 p-6 flex items-center justify-between bg-black/50 backdrop-blur-xl border-b border-white/5">
              <button 
                onClick={onClose} 
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand group-hover:text-black group-hover:border-brand transition-all">
                  <X size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest hidden sm:block">Close Window</span>
              </button>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-brand uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">CrazyGuiscripts</span>
                <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-[0.2em]">User Profile System v2.0</span>
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : userData ? (
              <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
                  {/* Sidebar Info */}
                  <aside className="space-y-8">
                    <div className="relative group">
                      <div className="w-full aspect-square rounded-[32px] border-4 border-zinc-800 p-2 bg-gradient-to-tr from-brand to-purple-600">
                        <img 
                          src={userData.photoURL || `https://ui-avatars.com/api/?name=${userData.displayName}`} 
                          alt={userData.displayName} 
                          className="w-full h-full object-cover rounded-[24px]"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-black border-2 border-brand rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        {isAdmin ? <Gavel size={20} className="text-brand" /> : <User size={20} className="text-brand" />}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{userData.displayName}</h2>
                        {isAdmin && (
                          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-lg w-fit">
                            <Gavel size={12} className="text-brand" />
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Administrator</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-4">
                        <div className="flex items-center gap-3 text-zinc-500">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                            <Calendar size={14} />
                          </div>
                          <span className="text-xs font-medium">Member since {new Date(userData.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-500">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                            <Star size={14} />
                          </div>
                          <span className="text-xs font-medium">{userScripts.length} Published Scripts</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10 text-center">
                        <div className="text-2xl font-black text-white italic">{userScripts.length}</div>
                        <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Uploads</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-3xl border border-white/10 text-center">
                        <div className="text-2xl font-black text-brand italic">
                          {userScripts.reduce((acc, s) => acc + (s.likes || 0), 0)}
                        </div>
                        <div className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Trust</div>
                      </div>
                    </div>
                  </aside>

                  {/* Main Content */}
                  <main className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <div className="w-2 h-6 bg-brand rounded-full shadow-[0_0_10px_#a855f7]" />
                        Latest Contributions
                      </h3>
                      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        Filtering by: All
                      </div>
                    </div>

                    {userScripts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                        {userScripts.map(script => (
                          <div key={script.id} className="p-6 bg-zinc-900/50 border border-white/5 rounded-[32px] hover:border-brand/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity" />
                            
                            <div className="relative">
                              <h4 className="text-lg font-black text-white truncate mb-4 italic group-hover:text-brand transition-colors uppercase tracking-tight">{script.title}</h4>
                              <div className="flex items-center justify-between text-xs text-zinc-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Gamepad2 size={12} />
                                  </div>
                                  <span className="font-mono">{script.game}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1.5 text-brand bg-brand/5 px-2 py-1 rounded-lg border border-brand/10 font-mono text-[10px]">
                                    <Heart size={10} fill="currentColor" /> {script.likes || 0}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-lg border border-yellow-500/10 font-mono text-[10px]">
                                    <Star size={10} fill="currentColor" /> {script.rating || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-24 bg-white/5 rounded-[48px] border border-dashed border-white/10 text-zinc-500">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="italic font-medium">Internal scan shows zero data footprints.</p>
                        <p className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-50">This user is currently inactive</p>
                      </div>
                    )}
                  </main>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <X size={64} className="text-red-500/20 mb-6" />
                <h2 className="text-2xl font-black text-white uppercase italic mb-2 tracking-tighter">Identity Not Found</h2>
                <p className="text-zinc-500 italic max-w-sm">The requested signature is not present in our centralized database.</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-brand hover:text-black hover:border-brand transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
