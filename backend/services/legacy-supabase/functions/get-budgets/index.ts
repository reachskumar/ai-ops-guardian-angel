
// Edge function to manage budget data and alerts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Fetching budget data and generating alerts');
    
    // Mock budget data with realistic spending patterns
    const budgets = [
      {
        id: "budget-prod-q4",
        name: "Q4 Production Infrastructure",
        amount: 12000,
        period: "quarterly",
        startDate: "2024-10-01",
        endDate: "2024-12-31",
        tags: { "environment": "production", "department": "engineering" },
        services: ["EC2", "RDS", "S3", "CloudFront"],
        spent: 8450.75,
        remaining: 3549.25,
        percentUsed: 70.4,
        status: "under"
      },
      {
        id: "budget-dev-monthly",
        name: "Development Team Monthly",
        amount: 2500,
        period: "monthly",
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        tags: { "environment": "development", "team": "backend" },
        services: ["EC2", "RDS", "CloudWatch"],
        spent: 2375.20,
        remaining: 124.80,
        percentUsed: 95.0,
        status: "near"
      },
      {
        id: "budget-data-analytics",
        name: "Data Analytics Platform",
        amount: 3500,
        period: "monthly",
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        tags: { "department": "data-science", "project": "ml-pipeline" },
        services: ["EMR", "Redshift", "S3", "Glue"],
        spent: 3750.40,
        remaining: -250.40,
        percentUsed: 107.2,
        status: "over"
      },
      {
        id: "budget-security",
        name: "Security & Compliance",
        amount: 1800,
        period: "monthly",
        startDate: "2024-12-01",
        endDate: "2024-12-31",
        tags: { "department": "security", "compliance": "sox" },
        services: ["GuardDuty", "CloudTrail", "Config", "WAF"],
        spent: 945.60,
        remaining: 854.40,
        percentUsed: 52.5,
        status: "under"
      }
    ];

    // Generate budget alerts based on current spending
    const alerts = [];
    
    budgets.forEach(budget => {
      if (budget.status === 'over') {
        alerts.push({
          id: `alert-${budget.id}`,
          budgetId: budget.id,
          type: 'budget_exceeded',
          severity: 'high',
          message: `Budget "${budget.name}" has exceeded its limit by $${Math.abs(budget.remaining).toFixed(2)}`,
          threshold: 100,
          currentSpend: budget.percentUsed,
          createdAt: new Date().toISOString()
        });
      } else if (budget.status === 'near') {
        alerts.push({
          id: `alert-${budget.id}`,
          budgetId: budget.id,
          type: 'budget_warning',
          severity: 'medium',
          message: `Budget "${budget.name}" is at ${budget.percentUsed}% of its limit`,
          threshold: 90,
          currentSpend: budget.percentUsed,
          createdAt: new Date().toISOString()
        });
      }
    });

    // Calculate summary statistics
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
    
    console.log(`Retrieved ${budgets.length} budgets with ${alerts.length} active alerts`);
    
    return new Response(
      JSON.stringify({
        success: true,
        budgets,
        alerts,
        summary: {
          totalBudgeted: Math.round(totalBudgeted * 100) / 100,
          totalSpent: Math.round(totalSpent * 100) / 100,
          totalRemaining: Math.round(totalRemaining * 100) / 100,
          overallUtilization: Math.round((totalSpent / totalBudgeted) * 100 * 100) / 100
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error fetching budget data");
  }
});
