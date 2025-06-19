
import { createNotification, NotificationType } from './notificationService';

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook';
  enabled: boolean;
  config: {
    email?: {
      recipients: string[];
      template?: string;
    };
    slack?: {
      webhookUrl: string;
      channel: string;
    };
    teams?: {
      webhookUrl: string;
    };
    webhook?: {
      url: string;
      headers?: Record<string, string>;
    };
  };
}

export interface ProvisioningNotification {
  type: 'request_submitted' | 'approval_required' | 'approved' | 'rejected' | 'provisioning_started' | 'provisioning_completed' | 'provisioning_failed';
  requestId: string;
  requester: string;
  resourceType: string;
  estimatedCost: number;
  approver?: string;
  comments?: string;
  error?: string;
}

// Send notification to multiple channels
export const sendProvisioningNotification = async (
  notification: ProvisioningNotification,
  channels: NotificationChannel[]
): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  for (const channel of channels.filter(c => c.enabled)) {
    try {
      switch (channel.type) {
        case 'email':
          await sendEmailNotification(notification, channel.config.email!);
          break;
        case 'slack':
          await sendSlackNotification(notification, channel.config.slack!);
          break;
        case 'teams':
          await sendTeamsNotification(notification, channel.config.teams!);
          break;
        case 'webhook':
          await sendWebhookNotification(notification, channel.config.webhook!);
          break;
      }
    } catch (error: any) {
      errors.push(`${channel.type}: ${error.message}`);
    }
  }
  
  return { success: errors.length === 0, errors };
};

// Email notification
const sendEmailNotification = async (
  notification: ProvisioningNotification,
  config: { recipients: string[]; template?: string }
): Promise<void> => {
  // In a real implementation, this would use an email service like SendGrid or Resend
  console.log('Sending email notification:', {
    to: config.recipients,
    subject: getEmailSubject(notification),
    body: getEmailBody(notification)
  });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Slack notification
const sendSlackNotification = async (
  notification: ProvisioningNotification,
  config: { webhookUrl: string; channel: string }
): Promise<void> => {
  const message = {
    channel: config.channel,
    text: getSlackMessage(notification),
    attachments: [
      {
        color: getSlackColor(notification.type),
        fields: [
          { title: 'Requester', value: notification.requester, short: true },
          { title: 'Resource Type', value: notification.resourceType, short: true },
          { title: 'Cost', value: `$${notification.estimatedCost}/month`, short: true },
          { title: 'Request ID', value: notification.requestId, short: true }
        ]
      }
    ]
  };
  
  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }
};

// Teams notification
const sendTeamsNotification = async (
  notification: ProvisioningNotification,
  config: { webhookUrl: string }
): Promise<void> => {
  const message = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": getTeamsColor(notification.type),
    "summary": getTeamsMessage(notification),
    "sections": [
      {
        "activityTitle": getTeamsMessage(notification),
        "facts": [
          { "name": "Requester", "value": notification.requester },
          { "name": "Resource Type", "value": notification.resourceType },
          { "name": "Estimated Cost", "value": `$${notification.estimatedCost}/month` },
          { "name": "Request ID", "value": notification.requestId }
        ]
      }
    ]
  };
  
  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  
  if (!response.ok) {
    throw new Error(`Teams API error: ${response.statusText}`);
  }
};

// Webhook notification
const sendWebhookNotification = async (
  notification: ProvisioningNotification,
  config: { url: string; headers?: Record<string, string> }
): Promise<void> => {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers
    },
    body: JSON.stringify({
      event: 'provisioning_notification',
      data: notification,
      timestamp: new Date().toISOString()
    })
  });
  
  if (!response.ok) {
    throw new Error(`Webhook error: ${response.statusText}`);
  }
};

// Helper functions for message formatting
const getEmailSubject = (notification: ProvisioningNotification): string => {
  switch (notification.type) {
    case 'request_submitted':
      return `New Provisioning Request: ${notification.resourceType}`;
    case 'approval_required':
      return `Approval Required: ${notification.resourceType}`;
    case 'approved':
      return `Request Approved: ${notification.resourceType}`;
    case 'rejected':
      return `Request Rejected: ${notification.resourceType}`;
    case 'provisioning_completed':
      return `Provisioning Complete: ${notification.resourceType}`;
    case 'provisioning_failed':
      return `Provisioning Failed: ${notification.resourceType}`;
    default:
      return `Provisioning Update: ${notification.resourceType}`;
  }
};

const getEmailBody = (notification: ProvisioningNotification): string => {
  return `
    Request ID: ${notification.requestId}
    Requester: ${notification.requester}
    Resource Type: ${notification.resourceType}
    Estimated Cost: $${notification.estimatedCost}/month
    ${notification.approver ? `Approver: ${notification.approver}` : ''}
    ${notification.comments ? `Comments: ${notification.comments}` : ''}
    ${notification.error ? `Error: ${notification.error}` : ''}
    
    View details in the DevOps dashboard.
  `;
};

const getSlackMessage = (notification: ProvisioningNotification): string => {
  switch (notification.type) {
    case 'approval_required':
      return `🔔 New provisioning request requires approval`;
    case 'approved':
      return `✅ Provisioning request approved`;
    case 'rejected':
      return `❌ Provisioning request rejected`;
    case 'provisioning_completed':
      return `🎉 Resource provisioning completed successfully`;
    case 'provisioning_failed':
      return `⚠️ Resource provisioning failed`;
    default:
      return `📋 Provisioning update`;
  }
};

const getTeamsMessage = (notification: ProvisioningNotification): string => {
  return getSlackMessage(notification);
};

const getSlackColor = (type: string): string => {
  switch (type) {
    case 'approved':
    case 'provisioning_completed':
      return 'good';
    case 'rejected':
    case 'provisioning_failed':
      return 'danger';
    case 'approval_required':
      return 'warning';
    default:
      return '#439FE0';
  }
};

const getTeamsColor = (type: string): string => {
  switch (type) {
    case 'approved':
    case 'provisioning_completed':
      return '28A745';
    case 'rejected':
    case 'provisioning_failed':
      return 'DC3545';
    case 'approval_required':
      return 'FFC107';
    default:
      return '007BFF';
  }
};
