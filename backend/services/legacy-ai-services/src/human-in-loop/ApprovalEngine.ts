import { v4 as uuidv4 } from 'uuid';

export interface AIRecommendation {
  id: string;
  action: string;
  description: string;
  reasoning: string;
  confidence: number; // 0.0 - 1.0
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    cost: string;
    duration: string;
    resourceCount: number;
    benefit: string;
  };
  resourcesAffected: Resource[];
  potentialRisks: Risk[];
  alternatives: Alternative[];
  executionPlan: string;
  rollbackPlan: string;
}

export interface ApprovalRequest {
  id: string;
  aiRecommendation: AIRecommendation;
  requestedBy: string;
  requestedAt: Date;
  requiredApprovals: ApprovalLevel[];
  timeoutMinutes: number;
  autoApproveThreshold?: number;
  context: {
    environment: string;
    repository?: string;
    branch?: string;
    commit?: string;
  };
}

export interface ApprovalLevel {
  role: 'engineer' | 'senior_engineer' | 'team_lead' | 'manager' | 'admin';
  requiredCount: number;
  users: string[];
}

export interface ApprovalResponse {
  id: string;
  requestId: string;
  userId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  comments: string;
  modifications?: any;
  timestamp: Date;
}

export class ApprovalEngine {
  private pendingApprovals = new Map<string, ApprovalRequest>();
  private approvalResponses = new Map<string, ApprovalResponse[]>();

  async requestApproval(recommendation: AIRecommendation, context: any): Promise<string> {
    const approvalRequest: ApprovalRequest = {
      id: uuidv4(),
      aiRecommendation: recommendation,
      requestedBy: context.userId || 'ai-system',
      requestedAt: new Date(),
      requiredApprovals: this.determineRequiredApprovals(recommendation),
      timeoutMinutes: this.calculateTimeout(recommendation),
      autoApproveThreshold: this.getAutoApproveThreshold(recommendation),
      context
    };

    // Check if can auto-approve
    if (this.canAutoApprove(recommendation)) {
      return await this.autoApprove(approvalRequest);
    }

    // Store for human approval
    this.pendingApprovals.set(approvalRequest.id, approvalRequest);
    
    // Notify appropriate approvers
    await this.notifyApprovers(approvalRequest);
    
    // Set timeout for auto-approval/escalation
    this.scheduleTimeout(approvalRequest);

    return approvalRequest.id;
  }

  async submitApproval(response: ApprovalResponse): Promise<boolean> {
    const request = this.pendingApprovals.get(response.requestId);
    if (!request) {
      throw new Error('Approval request not found');
    }

    // Store approval response
    const responses = this.approvalResponses.get(response.requestId) || [];
    responses.push(response);
    this.approvalResponses.set(response.requestId, responses);

    // Check if enough approvals received
    const approvalStatus = this.checkApprovalStatus(request, responses);
    
    if (approvalStatus.approved) {
      await this.executeApprovedAction(request, responses);
      this.cleanupApprovalRequest(response.requestId);
      return true;
    } else if (approvalStatus.rejected) {
      await this.handleRejectedAction(request, responses);
      this.cleanupApprovalRequest(response.requestId);
      return false;
    }

    // Still pending more approvals
    return false;
  }

  private determineRequiredApprovals(recommendation: AIRecommendation): ApprovalLevel[] {
    const approvals: ApprovalLevel[] = [];

    switch (recommendation.riskLevel) {
      case 'low':
        // Single engineer approval for low risk
        approvals.push({
          role: 'engineer',
          requiredCount: 1,
          users: this.getAvailableUsers('engineer')
        });
        break;

      case 'medium':
        // Senior engineer approval
        approvals.push({
          role: 'senior_engineer',
          requiredCount: 1,
          users: this.getAvailableUsers('senior_engineer')
        });
        break;

      case 'high':
        // Two-level approval
        approvals.push({
          role: 'senior_engineer',
          requiredCount: 1,
          users: this.getAvailableUsers('senior_engineer')
        });
        approvals.push({
          role: 'team_lead',
          requiredCount: 1,
          users: this.getAvailableUsers('team_lead')
        });
        break;

      case 'critical':
        // Multi-level approval for critical changes
        approvals.push({
          role: 'team_lead',
          requiredCount: 1,
          users: this.getAvailableUsers('team_lead')
        });
        approvals.push({
          role: 'manager',
          requiredCount: 1,
          users: this.getAvailableUsers('manager')
        });
        
        // Production requires admin approval
        if (this.isProductionChange(recommendation)) {
          approvals.push({
            role: 'admin',
            requiredCount: 1,
            users: this.getAvailableUsers('admin')
          });
        }
        break;
    }

    return approvals;
  }

  private canAutoApprove(recommendation: AIRecommendation): boolean {
    return (
      recommendation.riskLevel === 'low' &&
      recommendation.confidence > 0.95 &&
      !this.affectsProduction(recommendation) &&
      this.hasHistoricalSuccess(recommendation.action) &&
      this.isWithinBusinessHours()
    );
  }

  private async autoApprove(request: ApprovalRequest): Promise<string> {
    console.log(`🤖 Auto-approving low-risk action: ${request.aiRecommendation.action}`);
    
    // Execute immediately but notify humans
    await this.executeApprovedAction(request, []);
    await this.notifyAutoApproval(request);
    
    return `auto-approved-${request.id}`;
  }

  private async executeApprovedAction(
    request: ApprovalRequest, 
    responses: ApprovalResponse[]
  ): Promise<void> {
    try {
      console.log(`✅ Executing approved action: ${request.aiRecommendation.action}`);
      
      // Log the approval chain
      const approvalChain = responses.map(r => ({
        user: r.userId,
        decision: r.decision,
        timestamp: r.timestamp,
        comments: r.comments
      }));

      // Execute the AI recommendation
      await this.executeRecommendation(request.aiRecommendation, {
        approvalChain,
        requestId: request.id
      });

      // Monitor execution and notify humans of results
      await this.monitorExecution(request);

    } catch (error) {
      console.error(`❌ Failed to execute approved action: ${error}`);
      
      // Notify humans of execution failure
      await this.notifyExecutionFailure(request, error);
      
      // Attempt rollback if possible
      if (request.aiRecommendation.rollbackPlan) {
        await this.executeRollback(request.aiRecommendation);
      }
    }
  }

  private async executeRecommendation(
    recommendation: AIRecommendation, 
    context: any
  ): Promise<void> {
    // This would integrate with your existing AI agents
    switch (recommendation.action) {
      case 'scale_infrastructure':
        await this.scaleInfrastructure(recommendation, context);
        break;
      case 'optimize_costs':
        await this.optimizeCosts(recommendation, context);
        break;
      case 'apply_security_fix':
        await this.applySecurityFix(recommendation, context);
        break;
      case 'deploy_application':
        await this.deployApplication(recommendation, context);
        break;
      default:
        throw new Error(`Unknown action: ${recommendation.action}`);
    }
  }

  private async notifyApprovers(request: ApprovalRequest): Promise<void> {
    // Send notifications via email, Slack, Teams, etc.
    const notification = {
      title: `🤖 AI Recommendation Requires Approval`,
      message: `
        Action: ${request.aiRecommendation.action}
        Description: ${request.aiRecommendation.description}
        Risk Level: ${request.aiRecommendation.riskLevel}
        Confidence: ${Math.round(request.aiRecommendation.confidence * 100)}%
        
        AI Reasoning: ${request.aiRecommendation.reasoning}
        
        Click to review and approve: ${process.env.APP_URL}/approvals/${request.id}
      `,
      urgency: this.getNotificationUrgency(request.aiRecommendation.riskLevel),
      recipients: this.getApproverEmails(request.requiredApprovals)
    };

    await this.sendNotification(notification);
  }

  getPendingApprovals(userId: string): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values())
      .filter(request => this.userCanApprove(userId, request));
  }

  getApprovalHistory(limit: number = 50): any[] {
    // Return recent approval decisions for learning and analytics
    return this.getRecentApprovals(limit);
  }

  // Helper methods
  private getAvailableUsers(role: string): string[] {
    // In real implementation, query user database
    return ['user1', 'user2', 'user3']; // Placeholder
  }

  private affectsProduction(recommendation: AIRecommendation): boolean {
    return recommendation.resourcesAffected.some(r => 
      r.environment === 'production' || r.tags?.environment === 'prod'
    );
  }

  private hasHistoricalSuccess(action: string): boolean {
    // Check if similar actions have succeeded in the past
    // Implement based on your historical data
    return true; // Placeholder
  }

  private isWithinBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Monday-Friday, 9 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }

  private calculateTimeout(recommendation: AIRecommendation): number {
    // Risk-based timeout calculation
    switch (recommendation.riskLevel) {
      case 'low': return 30; // 30 minutes
      case 'medium': return 120; // 2 hours
      case 'high': return 480; // 8 hours
      case 'critical': return 60; // 1 hour (urgent)
      default: return 120;
    }
  }

  private checkApprovalStatus(
    request: ApprovalRequest, 
    responses: ApprovalResponse[]
  ): { approved: boolean; rejected: boolean; pending: boolean } {
    const approvals = responses.filter(r => r.decision === 'approve');
    const rejections = responses.filter(r => r.decision === 'reject');

    // Check if any required level is rejected
    if (rejections.length > 0) {
      return { approved: false, rejected: true, pending: false };
    }

    // Check if all required approvals are met
    const allLevelsApproved = request.requiredApprovals.every(level => {
      const levelApprovals = approvals.filter(a => 
        this.userHasRole(a.userId, level.role)
      );
      return levelApprovals.length >= level.requiredCount;
    });

    if (allLevelsApproved) {
      return { approved: true, rejected: false, pending: false };
    }

    return { approved: false, rejected: false, pending: true };
  }

  private userHasRole(userId: string, role: string): boolean {
    // Check user's role in your user management system
    return true; // Placeholder
  }

  private userCanApprove(userId: string, request: ApprovalRequest): boolean {
    return request.requiredApprovals.some(level => 
      level.users.includes(userId)
    );
  }

  private async sendNotification(notification: any): Promise<void> {
    // Implement notification service (email, Slack, etc.)
    console.log('Sending notification:', notification);
  }

  private cleanupApprovalRequest(requestId: string): void {
    this.pendingApprovals.delete(requestId);
    this.approvalResponses.delete(requestId);
  }

  // Placeholder methods for demonstration
  private async scaleInfrastructure(recommendation: AIRecommendation, context: any): Promise<void> {
    console.log('Scaling infrastructure...');
  }

  private async optimizeCosts(recommendation: AIRecommendation, context: any): Promise<void> {
    console.log('Optimizing costs...');
  }

  private async applySecurityFix(recommendation: AIRecommendation, context: any): Promise<void> {
    console.log('Applying security fix...');
  }

  private async deployApplication(recommendation: AIRecommendation, context: any): Promise<void> {
    console.log('Deploying application...');
  }

  private getNotificationUrgency(riskLevel: string): string {
    const urgencyMap = {
      low: 'info',
      medium: 'warning', 
      high: 'urgent',
      critical: 'critical'
    };
    return urgencyMap[riskLevel] || 'info';
  }

  private getApproverEmails(requiredApprovals: ApprovalLevel[]): string[] {
    // Get email addresses for all required approvers
    return ['approver@company.com']; // Placeholder
  }

  private async notifyAutoApproval(request: ApprovalRequest): Promise<void> {
    console.log(`Auto-approved: ${request.aiRecommendation.action}`);
  }

  private async handleRejectedAction(request: ApprovalRequest, responses: ApprovalResponse[]): Promise<void> {
    console.log(`Rejected: ${request.aiRecommendation.action}`);
  }

  private async monitorExecution(request: ApprovalRequest): Promise<void> {
    console.log(`Monitoring execution: ${request.aiRecommendation.action}`);
  }

  private async notifyExecutionFailure(request: ApprovalRequest, error: any): Promise<void> {
    console.log(`Execution failed: ${request.aiRecommendation.action}, Error: ${error}`);
  }

  private async executeRollback(recommendation: AIRecommendation): Promise<void> {
    console.log(`Rolling back: ${recommendation.action}`);
  }

  private isProductionChange(recommendation: AIRecommendation): boolean {
    return this.affectsProduction(recommendation);
  }

  private getAutoApproveThreshold(recommendation: AIRecommendation): number {
    return recommendation.riskLevel === 'low' ? 0.95 : 1.0;
  }

  private scheduleTimeout(request: ApprovalRequest): void {
    setTimeout(() => {
      if (this.pendingApprovals.has(request.id)) {
        this.handleApprovalTimeout(request);
      }
    }, request.timeoutMinutes * 60 * 1000);
  }

  private async handleApprovalTimeout(request: ApprovalRequest): Promise<void> {
    console.log(`Approval timeout for: ${request.aiRecommendation.action}`);
    // Implement escalation logic
  }

  private getRecentApprovals(limit: number): any[] {
    // Return historical approvals for analytics
    return []; // Placeholder
  }
}

// Types
interface Resource {
  id: string;
  name: string;
  type: string;
  environment: string;
  tags?: Record<string, string>;
}

interface Risk {
  id: string;
  description: string;
  probability: number;
  impact: string;
  mitigation: string;
}

interface Alternative {
  id: string;
  description: string;
  confidence: number;
  pros: string[];
  cons: string[];
} 