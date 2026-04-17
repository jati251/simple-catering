'use client';

import { pb, getMenuItems, addMenuItem, deleteMenuItem, getImageUrl } from '@/lib/pb';
import { MenuItem } from '@/types/pocketbase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, Utensils, Info, Tag, Image as ImageIcon, Upload, Loader2, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useTranslation, formatIDR } from '@/lib/utils';
import { Modal } from '@/components/UI/Modal';
import { Loader } from '@/components/UI/Loader';
import { useToast } from '@/components/UI/Toast';

export default function MenuManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  
  // Popup State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchMenu(silent = false) {
    if (!silent) setLoading(true);
    try {
      const items = await getMenuItems();
      setMenuItems(items);
    } catch (err) {
      toast("Failed to load menu", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.push('/login');
      return;
    }
    fetchMenu();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
      await addMenuItem(formData);
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setImagePreview(null);
      await fetchMenu(true);
      toast("Dish added to menu", "success");
    } catch (err: any) {
      toast(err.message || "Failed to add dish", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setActionLoading(true);
    try {
      await deleteMenuItem(itemToDelete);
      await fetchMenu(true);
      toast("Dish removed from menu", "success");
    } catch (err) {
      toast("Failed to remove dish", "error");
    } finally {
      setActionLoading(false);
      setItemToDelete(null);
      setDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Loader isLoading={loading} message="Fetching Menu..." />
      <Loader isLoading={actionLoading} message={t.deleting} />

      <Modal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t.remove}
        message={t.deleteConfirm}
        confirmText={t.remove}
        variant="danger"
      />

      <div className="max-w-6xl mx-auto px-6 py-12 pb-32">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
              <Link href="/admin/dashboard" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
                  <ChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-4xl font-black italic tracking-tighter leading-none">D'MBG</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{t.manageMenu}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* LEFT: Add Form */}
              <div className="lg:col-span-5 xl:col-span-4">
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass p-8 rounded-[2.5rem] sticky top-24 border border-white/5 shadow-2xl"
                  >
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Plus size={20} />
                        </div>
                        <h2 className="text-2xl font-black italic">{t.addNew}</h2>
                      </div>

                      <form onSubmit={handleAdd} className="space-y-6">
                          {/* Name Input */}
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.foodName}</label>
                              <div className="relative group">
                                  <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                  <input 
                                      type="text" required placeholder="e.g. Nasi Bakar D'MBG"
                                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none font-bold text-sm transition-all"
                                      value={name} onChange={(e) => setName(e.target.value)}
                                  />
                              </div>
                          </div>

                          {/* Image Drag & Drop / Upload */}
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.uploadImage}</label>
                              <div 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="relative h-40 w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
                              >
                                  {imagePreview ? (
                                      <>
                                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <Upload className="text-white" size={32} />
                                          </div>
                                      </>
                                  ) : (
                                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                          <ImageIcon size={32} strokeWidth={1.5} />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-center">{t.clickBrowse}</span>
                                      </div>
                                  )}
                                  <input 
                                      type="file" 
                                      ref={fileInputRef}
                                      onChange={handleImageChange}
                                      className="hidden" 
                                      accept="image/*"
                                  />
                              </div>
                          </div>

                          {/* Price Input */}
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.price} (IDR)</label>
                              <div className="relative group">
                                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                  <input 
                                      type="number" required placeholder="25000"
                                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none font-black italic tracking-wider text-sm transition-all"
                                      value={price} onChange={(e) => setPrice(e.target.value)}
                                  />
                              </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.description}</label>
                              <div className="relative group">
                                  <Info className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                  <textarea 
                                      placeholder={t.description}
                                      className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none font-medium text-xs transition-all"
                                      value={description} onChange={(e) => setDescription(e.target.value)}
                                  />
                              </div>
                          </div>

                          <button 
                              disabled={adding}
                              className="bg-primary text-black w-full h-16 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                          >
                              {adding ? <Loader2 className="animate-spin" size={20} /> : <>{t.addItem} <Plus size={20} /></>}
                          </button>
                      </form>
                  </motion.div>
              </div>

              {/* RIGHT: Items List */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  <div className="flex items-center justify-between mb-4 sticky top-24 z-10 bg-background/50 backdrop-blur-sm py-2 px-2 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{menuItems.length} {t.totalItems}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-primary">{t.liveDatabase}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AnimatePresence mode="popLayout">
                          {!loading && menuItems.length > 0 ? (
                              menuItems.map((item) => (
                                  <motion.div 
                                      key={item.id}
                                      layout
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      className="glass p-6 rounded-[2.5rem] flex flex-col gap-5 group relative overflow-hidden border border-white/5 hover:border-primary/30 transition-all shadow-xl"
                                  >
                                      <div className="flex gap-5">
                                          <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-white/10 shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden flex-shrink-0">
                                              {item.image ? (
                                                <img src={getImageUrl(item) || ''} alt={item.name} className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/5">
                                                  <Utensils size={40} />
                                                </div>
                                              )}
                                          </div>
                                          <div className="flex-1 space-y-1.5 pt-1">
                                              <h3 className="text-xl font-black italic tracking-tighter leading-tight line-clamp-1">{item.name}</h3>
                                              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed font-semibold uppercase tracking-tight">{item.description || t.noDescription}</p>
                                              <div className="mt-auto pt-2">
                                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black italic">
                                                  {formatIDR(item.price)}
                                                </span>
                                              </div>
                                          </div>
                                      </div>

                                      <button 
                                          onClick={() => handleDeleteClick(item.id)}
                                          className="absolute top-4 right-4 p-3 rounded-2xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 shadow-lg"
                                      >
                                          <Trash2 size={16} />
                                      </button>

                                      <div className="absolute -bottom-8 -right-8 text-white/5 group-hover:text-primary/5 transition-all duration-700 pointer-events-none rotate-12">
                                          <Utensils size={140} />
                                      </div>
                                  </motion.div>
                              ))
                          ) : !loading && (
                              <div className="col-span-full py-32 glass rounded-[4rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                                  <ChefHat size={64} className="text-white/5 mb-6" />
                                  <p className="text-muted-foreground italic font-medium">{t.noMenu}</p>
                                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-2">{t.kitchenEmpty}</p>
                              </div>
                          )}
                          {loading && (
                             [1,2,4,4].map(i => (
                               <div key={i} className="h-44 bg-white/5 animate-pulse rounded-[2.5rem] border border-white/5" />
                              ))
                          )}
                      </AnimatePresence>
                  </div>
              </div>
          </div>
      </div>
    </>
  );
}
