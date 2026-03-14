import { useState } from "react";
import { Link } from "wouter";
import { useStories, useDeleteStory, useToggleFavorite } from "@/hooks/use-stories";
import { BookOpen, Tv, Image as ImageIcon, Sparkles, Search, Trash2, PlusCircle, Heart, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryCategory } from "@/lib/storage";

type FilterType = StoryCategory | 'all' | 'favorites';
type SortType = 'newest' | 'oldest' | 'title' | 'popular';

export default function Library() {
  const { data: stories, isLoading } = useStories();
  const deleteStory = useDeleteStory();
  const toggleFavorite = useToggleFavorite();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortType>('newest');
  const [showSort, setShowSort] = useState(false);

  const allStories = stories || [];

  const counts = {
    all: allStories.length,
    'fairy-tale': allStories.filter(s => s.category === 'fairy-tale').length,
    comic: allStories.filter(s => s.category === 'comic').length,
    cartoon: allStories.filter(s => s.category === 'cartoon').length,
    custom: allStories.filter(s => s.category === 'custom').length,
    favorites: allStories.filter(s => s.isFavorite).length,
  };

  const categories: { id: FilterType; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'Барлығы', icon: Sparkles, color: '' },
    { id: 'fairy-tale', label: 'Ертегілер', icon: BookOpen, color: '' },
    { id: 'comic', label: 'Комикстер', icon: ImageIcon, color: '' },
    { id: 'cartoon', label: 'Мультфильмдер', icon: Tv, color: '' },
    { id: 'favorites', label: 'Таңдаулылар', icon: Heart, color: '' },
  ];

  const sortOptions: { id: SortType; label: string }[] = [
    { id: 'newest', label: 'Жаңасы бірінші' },
    { id: 'oldest', label: 'Ескісі бірінші' },
    { id: 'title', label: 'Атауы бойынша' },
    { id: 'popular', label: 'Танымалдылық' },
  ];

  const filteredStories = allStories
    .filter(s => {
      if (filter === 'favorites') return s.isFavorite;
      if (filter !== 'all') return s.category === filter;
      return true;
    })
    .filter(s => {
      if (!search) return true;
      return (
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === 'newest') return b.createdAt - a.createdAt;
      if (sort === 'oldest') return a.createdAt - b.createdAt;
      if (sort === 'title') return a.title.localeCompare(b.title, 'kk');
      if (sort === 'popular') return (b.readCount || 0) - (a.readCount || 0);
      return 0;
    });

  const getCategoryLabel = (cat: string) => {
    if (cat === 'fairy-tale') return 'Ертегі';
    if (cat === 'comic') return 'Комикс';
    if (cat === 'cartoon') return 'Мультфильм';
    return 'Басқа';
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'fairy-tale') return 'bg-primary/10 text-primary';
    if (cat === 'comic') return 'bg-secondary/10 text-secondary';
    if (cat === 'cartoon') return 'bg-orange-100 text-orange-600';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground mb-2">
              📚 Ертегілер кітапханасы
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Жалпы: <span className="font-bold text-foreground">{allStories.length}</span> ертегі
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Іздеу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 bg-white border-4 border-border rounded-2xl py-3 pl-12 pr-4 font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 bg-white border-4 border-border rounded-2xl py-3 px-4 font-bold text-foreground hover:border-primary transition-all shadow-sm"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{sortOptions.find(s => s.id === sort)?.label}</span>
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 bg-white border-4 border-border rounded-2xl shadow-xl z-20 min-w-[180px] overflow-hidden"
                  >
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSort(opt.id); setShowSort(false); }}
                        className={`w-full text-left px-4 py-3 font-bold hover:bg-primary/5 transition-colors ${sort === opt.id ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add Button */}
            <Link
              href="/add"
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Қосу</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-3 mb-8 gap-3 snap-x">
          {categories.map((cat) => {
            const isActive = filter === cat.id;
            const Icon = cat.icon;
            const count = counts[cat.id as keyof typeof counts] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                  isActive
                    ? cat.id === 'favorites'
                      ? 'bg-rose-500 text-white shadow-[0_4px_0_hsl(350,80%,40%)] -translate-y-0.5'
                      : 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-border))] -translate-y-0.5'
                    : 'bg-white border-2 border-border text-muted-foreground hover:border-primary/50 shadow-sm'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : cat.id === 'favorites' ? 'text-rose-500' : ''}`} />
                {cat.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-3xl h-72 animate-pulse border-4 border-border" />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="relative group"
                >
                  <Link href={`/story/${story.id}`} className="block h-full">
                    <div className="bg-card rounded-3xl p-5 border-4 border-border hover:border-primary shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col cursor-pointer">
                      {/* Cover */}
                      <div className="w-full aspect-square bg-gradient-to-br from-muted to-border/50 rounded-2xl flex items-center justify-center text-7xl mb-4 group-hover:scale-105 transition-transform shadow-inner overflow-hidden">
                        {story.images && story.images.length > 0 ? (
                          <img src={story.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : story.videoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 relative">
                            <span className="text-7xl">{story.coverEmoji}</span>
                            <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">▶ VIDEO</div>
                          </div>
                        ) : (
                          story.coverEmoji
                        )}
                      </div>

                      {/* Category badge */}
                      <span className={`self-start text-xs font-extrabold px-3 py-1 rounded-full mb-2 ${getCategoryColor(story.category)}`}>
                        {getCategoryLabel(story.category)}
                      </span>

                      <h3 className="text-lg font-display font-bold line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {story.title}
                      </h3>

                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-4">
                        {story.description}
                      </p>

                      {/* Footer */}
                      <div className="mt-auto pt-3 border-t-2 border-dashed border-border flex items-center justify-between">
                        <div className="flex gap-2 text-muted-foreground">
                          {story.audioFile && <MicIcon className="w-4 h-4 text-primary" />}
                          {story.videoUrl && <Tv className="w-4 h-4 text-orange-500" />}
                          {story.images && story.images.length > 0 && <ImageIcon className="w-4 h-4 text-secondary" />}
                          {story.voiceRecordings && story.voiceRecordings.length > 0 && (
                            <span className="text-xs font-bold text-primary">🎙 {story.voiceRecordings.length}</span>
                          )}
                        </div>
                        {story.readCount ? (
                          <span className="text-xs text-muted-foreground font-bold">👁 {story.readCount}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite.mutate(story.id);
                    }}
                    className={`absolute top-4 left-4 p-2 rounded-full shadow-md transition-all z-10 ${
                      story.isFavorite
                        ? 'bg-rose-500 text-white opacity-100'
                        : 'bg-white/90 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-500'
                    }`}
                    title={story.isFavorite ? 'Таңдаулылардан алу' : 'Таңдаулыларға қосу'}
                  >
                    <Heart className={`w-4 h-4 ${story.isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Бұл ертегіні өшіруге сенімдісіз бе?')) {
                        deleteStory.mutate(story.id);
                      }
                    }}
                    className="absolute top-4 right-4 bg-white/90 text-destructive p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all shadow-md z-10"
                    title="Өшіру"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border-4 border-dashed border-border rounded-3xl">
            <div className="text-6xl mb-4">
              {filter === 'favorites' ? '💔' : '🕵️‍♂️'}
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              {filter === 'favorites' ? 'Таңдаулылар жоқ' : 'Ештеңе табылмады'}
            </h3>
            <p className="text-muted-foreground font-medium mb-6">
              {filter === 'favorites'
                ? 'Ертегіні ❤️ басып таңдаулыларға қосыңыз'
                : search
                  ? `"${search}" бойынша нәтиже жоқ`
                  : 'Бұл бөлімде әзірге ертегі жоқ'}
            </p>
            {filter !== 'favorites' && (
              <Link
                href="/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <PlusCircle className="w-5 h-5" /> Жаңасын қосу
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MicIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}
