import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIInsightsProps {
  userId: string;
}

interface Insight {
  type: string;
  message: string;
  tips?: string[];
}

const AIInsights = ({ userId }: AIInsightsProps) => {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLatestInsights();
  }, [userId]);

  const fetchLatestInsights = async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase
        .from("ai_insights")
        .select("insights")
        .eq("user_id", userId)
        .eq("month_year", currentMonth)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && Array.isArray(data.insights)) {
        setInsights(data.insights as unknown as Insight[]);
      }
    } catch (error: any) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-expenses", {
        body: { userId },
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("rate limit")) {
          toast({
            title: "Rate limit reached",
            description: "Too many requests. Please try again later.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402") || error.message?.includes("payment")) {
          toast({
            title: "Usage limit reached",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setInsights(data.insights);
      toast({
        title: "Analysis complete!",
        description: "Your spending insights are ready.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "trend": return <TrendingUp className="h-5 w-5" />;
      case "warning": return <AlertCircle className="h-5 w-5" />;
      case "tip": return <Lightbulb className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getVariant = (type: string) => {
    switch (type) {
      case "warning": return "destructive";
      case "tip": return "default";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button 
            onClick={generateInsights} 
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Get personalized insights about your spending patterns
            </p>
            <Button onClick={generateInsights} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge variant={getVariant(insight.type)} className="mt-1">
                    {getIcon(insight.type)}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">{insight.message}</p>
                    {insight.tips && insight.tips.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                        {insight.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;