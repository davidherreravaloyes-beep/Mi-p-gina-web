import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Camera, Check, Loader2, Gavel, Upload } from 'lucide-react';
import { auth, updateProfile, db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin?: boolean;
}

export function ProfileModal({ isOpen, onClose, user, isAdmin }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isOpen]);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setPhotoURL(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Make sure you have permission to upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: photoURL
        });

        // Also update Firestore users collection
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: displayName,
          photoURL: photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Update profile failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-black">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="min-h-screen w-full bg-[#0a0a0c] flex flex-col relative"
          >
            {/* Navigation Header */}
            <div className="sticky top-0 z-50 p-6 flex items-center justify-between bg-black/50 backdrop-blur-xl">
              <button 
                onClick={onClose} 
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-zinc-800 transition-all">
                  <X size={20} />
                </div>
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center pt-12 pb-24 px-6 overflow-y-auto">
              <div className="flex flex-col items-center mb-12 text-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                    <span className="text-2xl font-black text-brand italic tracking-tighter">CG</span>
                  </div>
                  <div className="flex flex-col items-start translate-y-1">
                    <span className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">CrazyGui<span className="text-brand">scripts</span></span>
                    <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em] mt-1 ml-0.5">Profile System</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Set up your profile</h2>
                <p className="text-zinc-400 text-sm">Pick a handle and photo so people can find you</p>
              </div>

              <div className="w-full max-w-[440px] bg-[#161617] border border-white/5 rounded-[24px] p-8 space-y-8 shadow-2xl">
                <form onSubmit={handleUpdate} className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Profile Picture <span className="text-zinc-600 font-normal ml-1">Optional</span></label>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-800 p-0.5 bg-zinc-900 overflow-hidden">
                          {photoURL ? (
                            <img src={photoURL} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex bg-black border border-white/5 rounded-xl overflow-hidden h-10">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold px-4 transition-colors border-r border-white/5 h-full"
                          >
                            Seleccionar archivo
                          </button>
                          <div className="flex-1 flex items-center px-4 overflow-hidden">
                            <span className="text-zinc-500 text-[11px] truncate">
                              {uploading ? 'Uploading...' : 'Sin archiv...ccionados'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">Cropped to square. Max 5 MB.</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* Username Section */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      Username <span className="text-red-500 text-sm">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-black border border-white/5 rounded-xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-brand/50 transition-all font-medium placeholder:text-zinc-800"
                        placeholder="your_name"
                        required
                      />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] text-zinc-500 font-medium">3-20 chars, letters, numbers & underscores</span>
                      <span className="text-[10px] text-zinc-500 font-mono">0/20</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || success || uploading}
                    className="w-full py-4 bg-zinc-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-30 disabled:scale-100"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : success ? (
                      <>
                        <Check size={20} />
                        Profile Updated
                      </>
                    ) : (
                      <>
                        Get started
                        <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <X size={16} className="rotate-[-135deg]" />
                        </motion.span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <footer className="mt-12 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em]">Identity Protocol 2.1</span>
              </footer>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
