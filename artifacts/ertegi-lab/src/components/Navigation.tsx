import { Link, useLocation } from "wouter";
import { Sparkles, BookOpen, PlusCircle, Home, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Басты бет", icon: Home, color: "text-primary" },
    { path: "/library", label: "Кітапхана", icon: BookOpen, color: "text-secondary" },
    { path: "/add", label: "Қосу", icon: PlusCircle, color: "text-accent-foreground" },
    { path: "/stats", label: "Статистика", icon: BarChart3, color: "text-green-600" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b-4 border-primary/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">
              Ertegi<span className="text-primary">-lab</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className="relative group p-2">
                  <div className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 rounded-2xl transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? item.color : "text-muted-foreground"}`} />
                    <span className={`font-bold text-sm sm:text-base hidden sm:block ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute -bottom-1 left-4 right-4 h-1.5 bg-primary rounded-t-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
