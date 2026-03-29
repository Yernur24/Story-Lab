import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/home";
import Library from "@/pages/library";
import StoryDetail from "@/pages/story-detail";
import StoryForm from "@/pages/story-form";
import QuizPage from "@/pages/quiz";
import QuizEditor from "@/pages/quiz-editor";
import StatsPage from "@/pages/stats";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins cache for local storage reads
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/story/:id" component={StoryDetail} />
      <Route path="/add" component={StoryForm} />
      <Route path="/edit/:id" component={StoryForm} />
      <Route path="/quiz/:id" component={QuizPage} />
      <Route path="/quiz-editor/:id" component={QuizEditor} />
      <Route path="/stats" component={StatsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-background font-sans selection:bg-primary/30">
            <Navigation />
            <main>
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
