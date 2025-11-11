import { Button } from "@/components/ui/button";
import { TrendingDown, Sparkles, PieChart, Target, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ExpenseDecoder</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Get Started
          </Button>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Money Coaching</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-hero">
              Understand Your Spending,
              <br />
              Transform Your Habits
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              ExpenseDecoder analyzes your spending patterns with AI to help you understand 
              why you overspend and how to build better financial habits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-8 shadow-glow hover:shadow-lg transition-all"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Categorization</h3>
              <p className="text-muted-foreground">
                Automatically organize expenses and visualize where your money goes with intuitive charts and breakdowns.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Discover emotional spending triggers and impulsive purchase patterns with friendly, motivating insights.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Actionable Tips</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations for building healthier spending habits and reaching your financial goals.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-primary py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to decode your expenses?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands taking control of their finances with AI-powered insights.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 ExpenseDecoder. Your AI Money Coach.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
