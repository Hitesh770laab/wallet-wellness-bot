import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { TrendingDown, LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExpenseForm from "@/components/ExpenseForm";
import ExpensesList from "@/components/ExpensesList";
import AIInsights from "@/components/AIInsights";
import SpendingChart from "@/components/SpendingChart";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate("/");
  };

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    setRefreshKey(prev => prev + 1);
    toast({ 
      title: "Expense added!", 
      description: "Your expense has been recorded successfully." 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">ExpenseDecoder</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's your spending overview</p>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="flex justify-end">
            <Button onClick={() => setShowExpenseForm(!showExpenseForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>

          {showExpenseForm && (
            <ExpenseForm 
              userId={user?.id || ""} 
              onSuccess={handleExpenseAdded}
              onCancel={() => setShowExpenseForm(false)}
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <SpendingChart userId={user?.id || ""} key={refreshKey} />
            <AIInsights userId={user?.id || ""} key={refreshKey} />
          </div>

          <ExpensesList userId={user?.id || ""} key={refreshKey} onUpdate={() => setRefreshKey(prev => prev + 1)} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;