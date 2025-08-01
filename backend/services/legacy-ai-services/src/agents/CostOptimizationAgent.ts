import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { Tool } from "@langchain/core/tools";
import { StateGraph, END, START } from "langgraph";
import { BaseAgent } from "./BaseAgent";
import { CostAnalysisTool } from "../tools/CostAnalysisTool";
import { RecommendationTool } from "../tools/RecommendationTool";
import { CloudDataTool } from "../tools/CloudDataTool";
import { logger } from "../utils/logger";

export interface CostOptimizationState {
  messages: Array<HumanMessage | SystemMessage | AIMessage>;
  cloudData: any;
  costAnalysis: any;
  recommendations: any[];
  currentStep: string;
  userId: string;
  sessionId: string;
}

export class CostOptimizationAgent extends BaseAgent {
  private tools: Tool[];
  private graph: StateGraph<CostOptimizationState>;

  constructor() {
    super("cost-optimization", "Advanced cost analysis and optimization recommendations");
    
    this.tools = [
      new CostAnalysisTool(),
      new RecommendationTool(),
      new CloudDataTool()
    ];

    this.setupLangGraph();
  }

  private setupLangGraph() {
    // Define the LangGraph workflow
    const workflow = new StateGraph<CostOptimizationState>({
      channels: {
        messages: [],
        cloudData: null,
        costAnalysis: null,
        recommendations: [],
        currentStep: "",
        userId: "",
        sessionId: ""
      }
    });

    // Add nodes for each step
    workflow.addNode("gather_data", this.gatherCloudData.bind(this));
    workflow.addNode("analyze_costs", this.analyzeCosts.bind(this));
    workflow.addNode("generate_recommendations", this.generateRecommendations.bind(this));
    workflow.addNode("prioritize_recommendations", this.prioritizeRecommendations.bind(this));
    workflow.addNode("create_response", this.createResponse.bind(this));

    // Define the workflow edges
    workflow.addEdge(START, "gather_data");
    workflow.addEdge("gather_data", "analyze_costs");
    workflow.addEdge("analyze_costs", "generate_recommendations");
    workflow.addEdge("generate_recommendations", "prioritize_recommendations");
    workflow.addEdge("prioritize_recommendations", "create_response");
    workflow.addEdge("create_response", END);

    this.graph = workflow.compile();
  }

  async processMessage(message: string, userId: string, sessionId: string): Promise<string> {
    try {
      logger.info(`Cost optimization agent processing message for user ${userId}`);

      const initialState: CostOptimizationState = {
        messages: [new HumanMessage(message)],
        cloudData: null,
        costAnalysis: null,
        recommendations: [],
        currentStep: "start",
        userId,
        sessionId
      };

      // Run the LangGraph workflow
      const result = await this.graph.invoke(initialState);
      
      // Extract the final response
      const finalMessage = result.messages[result.messages.length - 1];
      return finalMessage.content as string;

    } catch (error) {
      logger.error(`Cost optimization agent error: ${error}`);
      throw new Error(`Failed to process cost optimization request: ${error}`);
    }
  }

  private async gatherCloudData(state: CostOptimizationState): Promise<CostOptimizationState> {
    logger.info("Gathering cloud data for cost analysis");
    
    try {
      const cloudDataTool = this.tools.find(t => t.name === "cloud_data_tool") as CloudDataTool;
      const cloudData = await cloudDataTool._call({
        userId: state.userId,
        includeMetrics: true,
        includeCosts: true
      });

      return {
        ...state,
        cloudData,
        currentStep: "data_gathered"
      };
    } catch (error) {
      logger.error(`Error gathering cloud data: ${error}`);
      return {
        ...state,
        cloudData: { error: error.message },
        currentStep: "data_error"
      };
    }
  }

  private async analyzeCosts(state: CostOptimizationState): Promise<CostOptimizationState> {
    logger.info("Analyzing costs using AI");

    try {
      const costAnalysisTool = this.tools.find(t => t.name === "cost_analysis_tool") as CostAnalysisTool;
      const costAnalysis = await costAnalysisTool._call({
        cloudData: state.cloudData,
        timeRange: "30d",
        analysisType: "comprehensive"
      });

      return {
        ...state,
        costAnalysis,
        currentStep: "costs_analyzed"
      };
    } catch (error) {
      logger.error(`Error analyzing costs: ${error}`);
      return {
        ...state,
        costAnalysis: { error: error.message },
        currentStep: "analysis_error"
      };
    }
  }

  private async generateRecommendations(state: CostOptimizationState): Promise<CostOptimizationState> {
    logger.info("Generating AI-powered cost optimization recommendations");

    try {
      const recommendationTool = this.tools.find(t => t.name === "recommendation_tool") as RecommendationTool;
      const recommendations = await recommendationTool._call({
        cloudData: state.cloudData,
        costAnalysis: state.costAnalysis,
        optimizationType: "cost_savings"
      });

      return {
        ...state,
        recommendations,
        currentStep: "recommendations_generated"
      };
    } catch (error) {
      logger.error(`Error generating recommendations: ${error}`);
      return {
        ...state,
        recommendations: [],
        currentStep: "recommendation_error"
      };
    }
  }

  private async prioritizeRecommendations(state: CostOptimizationState): Promise<CostOptimizationState> {
    logger.info("Prioritizing recommendations using ML");

    try {
      // Use LLM to intelligently prioritize recommendations
      const llm = new ChatOpenAI({
        model: "gpt-4",
        temperature: 0.1
      });

      const prioritizationPrompt = `
        You are an expert DevOps cost optimization specialist. 
        Analyze these cost optimization recommendations and prioritize them based on:
        1. Potential monthly savings (higher is better)
        2. Implementation difficulty (easier is better)  
        3. Risk level (lower risk is better)
        4. Business impact (higher impact is better)

        Recommendations: ${JSON.stringify(state.recommendations, null, 2)}

        Return the recommendations reordered by priority (highest priority first) with a priority score (1-10) and brief reasoning.
        Response format: JSON array with priority, score, and reasoning fields added to each recommendation.
      `;

      const response = await llm.invoke([new SystemMessage(prioritizationPrompt)]);
      
      let prioritizedRecommendations;
      try {
        prioritizedRecommendations = JSON.parse(response.content as string);
      } catch {
        // Fallback: simple prioritization by savings amount
        prioritizedRecommendations = state.recommendations.sort((a, b) => 
          (b.monthlySavings || 0) - (a.monthlySavings || 0)
        );
      }

      return {
        ...state,
        recommendations: prioritizedRecommendations,
        currentStep: "recommendations_prioritized"
      };
    } catch (error) {
      logger.error(`Error prioritizing recommendations: ${error}`);
      return {
        ...state,
        currentStep: "prioritization_error"
      };
    }
  }

  private async createResponse(state: CostOptimizationState): Promise<CostOptimizationState> {
    logger.info("Creating final response");

    try {
      const llm = new ChatOpenAI({
        model: "gpt-4",
        temperature: 0.3
      });

      const totalSavings = state.recommendations.reduce((sum, rec) => 
        sum + (rec.monthlySavings || 0), 0
      );

      const responsePrompt = `
        You are an AI DevOps cost optimization expert. Create a comprehensive, actionable response about cost optimization opportunities.

        User Message: ${state.messages[0].content}
        
        Cloud Data Summary: ${JSON.stringify(state.cloudData?.summary || {}, null, 2)}
        Cost Analysis: ${JSON.stringify(state.costAnalysis?.summary || {}, null, 2)}
        Total Potential Monthly Savings: $${totalSavings.toFixed(2)}
        Top Recommendations: ${JSON.stringify(state.recommendations.slice(0, 5), null, 2)}

        Create a response that:
        1. Directly answers the user's question
        2. Highlights the most impactful cost optimization opportunities
        3. Provides specific, actionable next steps
        4. Explains the potential ROI and implementation effort
        5. Uses a professional but conversational tone
        6. Includes relevant metrics and data points
        7. Suggests automation opportunities where applicable

        Keep the response comprehensive but concise (max 500 words).
      `;

      const response = await llm.invoke([new SystemMessage(responsePrompt)]);

      return {
        ...state,
        messages: [...state.messages, new AIMessage(response.content as string)],
        currentStep: "response_created"
      };
    } catch (error) {
      logger.error(`Error creating response: ${error}`);
      const errorResponse = `I encountered an error while analyzing your cost optimization opportunities. Please try again or contact support if the issue persists. Error: ${error.message}`;
      
      return {
        ...state,
        messages: [...state.messages, new AIMessage(errorResponse)],
        currentStep: "response_error"
      };
    }
  }

  // Direct method for cost analysis without chat interface
  async analyzeCostOptimization(userId: string, options: {
    timeRange?: string;
    focusAreas?: string[];
    includeForecasting?: boolean;
  } = {}) {
    try {
      logger.info(`Running direct cost optimization analysis for user ${userId}`);

      const cloudDataTool = this.tools.find(t => t.name === "cloud_data_tool") as CloudDataTool;
      const costAnalysisTool = this.tools.find(t => t.name === "cost_analysis_tool") as CostAnalysisTool;
      const recommendationTool = this.tools.find(t => t.name === "recommendation_tool") as RecommendationTool;

      // Gather data
      const cloudData = await cloudDataTool._call({
        userId,
        includeMetrics: true,
        includeCosts: true
      });

      // Analyze costs
      const costAnalysis = await costAnalysisTool._call({
        cloudData,
        timeRange: options.timeRange || "30d",
        analysisType: "comprehensive"
      });

      // Generate recommendations
      const recommendations = await recommendationTool._call({
        cloudData,
        costAnalysis,
        optimizationType: "cost_savings",
        focusAreas: options.focusAreas
      });

      // Calculate summary metrics
      const summary = {
        totalMonthlyCost: costAnalysis.totalMonthlyCost || 0,
        potentialMonthlySavings: recommendations.reduce((sum: number, rec: any) => 
          sum + (rec.monthlySavings || 0), 0),
        optimizationOpportunities: recommendations.length,
        topRecommendation: recommendations[0] || null,
        riskLevel: this.calculateRiskLevel(recommendations),
        implementationEffort: this.calculateImplementationEffort(recommendations)
      };

      return {
        success: true,
        data: {
          cloudData,
          costAnalysis,
          recommendations,
          summary
        }
      };

    } catch (error) {
      logger.error(`Direct cost optimization analysis error: ${error}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private calculateRiskLevel(recommendations: any[]): string {
    const avgRisk = recommendations.reduce((sum, rec) => {
      const riskScore = rec.risk === 'low' ? 1 : rec.risk === 'medium' ? 2 : 3;
      return sum + riskScore;
    }, 0) / recommendations.length;

    if (avgRisk <= 1.5) return 'low';
    if (avgRisk <= 2.5) return 'medium';
    return 'high';
  }

  private calculateImplementationEffort(recommendations: any[]): string {
    const avgEffort = recommendations.reduce((sum, rec) => {
      const effortScore = rec.effort === 'low' ? 1 : rec.effort === 'medium' ? 2 : 3;
      return sum + effortScore;
    }, 0) / recommendations.length;

    if (avgEffort <= 1.5) return 'low';
    if (avgEffort <= 2.5) return 'medium';
    return 'high';
  }
} 