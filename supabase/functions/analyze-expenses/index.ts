import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (expensesError) throw expensesError;

    if (!expenses || expenses.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [{
            type: "tip",
            message: "Start adding expenses to get personalized insights!",
            tips: ["Track all your purchases, big and small", "Be honest about what you spend", "Review your expenses weekly"]
          }]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categoryTotals = expenses.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    const totalSpent = Object.values(categoryTotals).reduce((sum: number, val: any) => sum + val, 0);
    const avgExpense = totalSpent / expenses.length;
    
    const expensesByDate = expenses.reduce((acc: any, exp: any) => {
      const date = exp.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const maxExpensesInDay = Math.max(...(Object.values(expensesByDate) as number[]));

    const prompt = `You are ExpenseDecoder, a friendly AI money coach. Analyze these spending patterns and provide insights:

Total Expenses: ${expenses.length}
Total Spent: $${totalSpent.toFixed(2)}
Average Expense: $${avgExpense.toFixed(2)}
Categories: ${JSON.stringify(categoryTotals)}
Max expenses in one day: ${maxExpensesInDay}

Provide exactly 3-4 insights as a JSON array. Each insight should have:
- type: "trend", "warning", or "tip"
- message: A friendly, non-judgmental observation (max 100 characters)
- tips: Array of 2-3 actionable tips (optional, each max 80 characters)

Focus on:
1. Spending patterns and trends
2. Potential emotional or impulsive spending (if max expenses in day > 5)
3. Category analysis
4. Positive reinforcement and actionable advice

Be motivating, data-driven, and specific. End with clear tips for next month.

Return ONLY valid JSON array, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a helpful financial coach. Always return valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    let insights;

    try {
      const content = aiData.choices[0].message.content;
      insights = JSON.parse(content.replace(/```json\n?|\n?```/g, '').trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      insights = [{
        type: "tip",
        message: "Your spending data has been recorded!",
        tips: [
          "Review your largest expenses this month",
          "Look for patterns in your daily spending",
          "Set a budget for your top spending category"
        ]
      }];
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { error: insertError } = await supabase
      .from("ai_insights")
      .insert({
        user_id: userId,
        month_year: currentMonth,
        insights: insights,
      });

    if (insertError) console.error("Failed to save insights:", insertError);

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in analyze-expenses:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});