import { Link } from "wouter";
import { Sparkles, ArrowRight, Play, BookOpen, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useStories } from "@/hooks/use-stories";

export default function Home() {
  const { data: stories, isLoading } = useStories();
  
  const featuredStories = stories?.slice(0, 3) || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative w-full pt-12 pb-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-primary/10 via-secondary/10 to-transparent" />
          {/* We use the requested generated image */}
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Magical background"
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-primary font-bold shadow-sm mb-6 border-2 border-primary/20">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Ғажайып әлемге қош келдіңіз!
                </span>
                
                <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-foreground mb-6 leading-tight">
                  Өз <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ертегіңді</span> <br/>
                  жарат!
                </h1>
                
                <p className="text-xl text-muted-foreground font-medium mb-10 max-w-2xl mx-auto lg:mx-0">
                  Ertegi-lab — балаларға арналған сиқырлы кітапхана. Мұнда ертегі оқып, дауыс жазып, суреттерден мультфильм жасауға болады!
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/library" className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl shadow-[0_8px_0_hsl(var(--primary-border))] hover:-translate-y-1 hover:shadow-[0_12px_0_hsl(var(--primary-border))] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                    Кітапхананы көру <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/add" className="w-full sm:w-auto px-8 py-4 bg-white text-foreground text-lg font-bold rounded-2xl shadow-[0_8px_0_hsl(var(--border))] border-2 border-border hover:-translate-y-1 hover:shadow-[0_12px_0_hsl(var(--border))] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-2">
                    Жаңа ертегі <PlusCircle className="w-5 h-5 text-primary" />
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1 w-full max-w-md animate-float"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}images/magic-book.png`}
                alt="Magic Book"
                className="w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-display font-bold flex items-center gap-3">
            <div className="p-2 bg-accent rounded-xl rotate-3">
              <BookOpen className="w-6 h-6 text-foreground" />
            </div>
            Танымал ертегілер
          </h2>
          <Link href="/library" className="text-primary font-bold hover:underline hidden sm:block">
            Барлығын көру →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-3xl h-64 animate-pulse border-4 border-border" />
            ))}
          </div>
        ) : featuredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStories.map((story, i) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/story/${story.id}`} className="block group">
                  <div className="bg-card rounded-3xl p-6 border-4 border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 h-full flex flex-col">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                      {story.coverEmoji}
                    </div>
                    <div className="inline-block px-3 py-1 bg-secondary/20 text-secondary-foreground font-bold text-xs rounded-full mb-3 w-fit">
                      {story.category === 'fairy-tale' ? 'Ертегі' : 
                       story.category === 'comic' ? 'Комикс' : 
                       story.category === 'cartoon' ? 'Мультфильм' : 'Басқа'}
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-muted-foreground font-medium line-clamp-2 mt-auto">
                      {story.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-3xl border-4 border-dashed border-border">
            <p className="text-xl font-bold text-muted-foreground">Әзірге ертегілер жоқ :(</p>
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link href="/library" className="inline-block text-primary font-bold hover:underline">
            Барлығын көру →
          </Link>
        </div>
      </section>
    </div>
  );
}
