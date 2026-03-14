import { useState } from "react";
import { Link } from "wouter";
import { useStories } from "@/hooks/use-stories";
import { BookOpen, Tv, Image as ImageIcon, Sparkles, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeleteStory } from "@/hooks/use-stories";
import { StoryCategory } from "@/lib/storage";

export default function Library() {
  const { data: stories, isLoading } = useStories();
  const deleteStory = useDeleteStory();
  const [filter, setFilter] = useState<StoryCategory | 'all'>('all');
  const [search, setSearch] = useState("");

  const categories = [
    { id: 'all', label: 'Барлығы', icon: Sparkles, color: 'bg-gradient-to-r from-primary to-secondary text-white' },
    { id: 'fairy-tale', label: 'Ертегілер', icon: BookOpen, color: 'bg-primary/10 text-primary hover:bg-primary/20' },
    { id: 'comic', label: 'Комикстер', icon: ImageIcon, color: 'bg-secondary/10 text-secondary hover:bg-secondary/20' },
    { id: 'cartoon', label: 'Мультфильмдер', icon: Tv, color: 'bg-accent/20 text-accent-foreground hover:bg-accent/30' },
  ];

  const filteredStories = stories?.filter(s => {
    const matchesFilter = filter === 'all' || s.category === filter;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-foreground mb-4">
              Ертегілер кітапханасы
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Өзіңе ұнайтын ертегіні таңда немесе жаңасын қос!
            </p>
          </div>
          
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Іздеу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-4 border-border rounded-2xl py-3 pl-12 pr-4 font-bold text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 snap-x hide-scrollbar">
          {categories.map((cat) => {
            const isActive = filter === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id as any)}
                className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-border))] translate-y-[-2px]' 
                    : `bg-white border-2 border-border text-muted-foreground hover:border-primary/50 shadow-sm`
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
                    <div className="bg-card rounded-3xl p-6 border-4 border-border hover:border-primary shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col cursor-pointer">
                      <div className="w-full aspect-square bg-gradient-to-br from-muted to-border/50 rounded-2xl flex items-center justify-center text-7xl mb-4 group-hover:scale-105 transition-transform shadow-inner overflow-hidden">
                        {story.images && story.images.length > 0 ? (
                          <img src={story.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          story.coverEmoji
                        )}
                      </div>
                      
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-display font-bold line-clamp-2 group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-4">
                        {story.description}
                      </p>
                      
                      <div className="mt-auto pt-4 border-t-2 border-dashed border-border flex items-center justify-between">
                        <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary font-extrabold text-xs rounded-full">
                          {story.category === 'fairy-tale' ? 'Ертегі' : 
                           story.category === 'comic' ? 'Комикс' : 
                           story.category === 'cartoon' ? 'Мультфильм' : 'Басқа'}
                        </span>
                        
                        <div className="flex gap-1 text-muted-foreground">
                          {story.audioFile && <MicIcon className="w-4 h-4 text-primary" />}
                          {story.videoUrl && <Tv className="w-4 h-4 text-secondary" />}
                          {story.images && story.images.length > 0 && <ImageIcon className="w-4 h-4 text-accent-foreground" />}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Бұл ертегіні өшіруге сенімдісіз бе? (Are you sure you want to delete?)")) {
                        deleteStory.mutate(story.id);
                      }
                    }}
                    className="absolute top-4 right-4 bg-white/90 text-destructive p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all shadow-md z-10"
                    title="Өшіру (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white border-4 border-dashed border-border rounded-3xl">
            <div className="text-6xl mb-4">🕵️‍♂️</div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">Ештеңе табылмады</h3>
            <p className="text-muted-foreground font-medium mb-6">Бұл бөлімде әзірге ертегі жоқ немесе іздеу сөзі қате.</p>
            <Link href="/add" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_4px_0_hsl(var(--primary-border))] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all">
              <PlusCircle className="w-5 h-5" /> Жаңасын қосу
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple fallback icon
function MicIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  )
}
