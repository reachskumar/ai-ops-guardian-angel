
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, sanitizeEmail, sanitizeUrl } from './securityService';
import { sendSecureWebhook, getUserWebhookConfigs } from './secureWebhookService';
import { checkRateLimit } from './securityService';

export interface SecureNotificationChannel {
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

export interface SecureProvisioningNotification {
  type: 'request_submitted' | 'approval_required' | 'approved' | 'rejected' | 'provisioning_started' | 'provisioning_completed' | 'provisioning_failed';
  requestId: string;
  requester: string;
  resourceType: string;
  estimatedCost: number;
  approver?: string;
  comments?: string;
  error?: string;
}

// Send notification with security validations
export const sendSecureProvisioningNotification = async (
  notification: SecureProvisioningNotification,
  channels: SecureNotificationChannel[],
  userId: string
): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  // Rate limiting check
  const rateLimitResult = await checkRateLimit(userId, 'notifications', 10); // 10 notifications per minute
  if (!rateLimitResult.allowed) {
    return { success: false, errors: ['Rate limit exceeded for notifications'] };
  }
  
  // Sanitize notification data
  const sanitizedNotification = {
    ...notification,
    requester: sanitizeInput(notification.requester),
    resourceType: sanitizeInput(notification.resourceType),
    approver: notification.approver ? sanitizeInput(notification.approver) : undefined,
    comments: notification.comments ? sanitizeInput(notification.comments) : undefined,
    error: notification.error ? sanitizeInput(notification.error) : undefined
  };
  
  for (const channel of channels.filter(c => c.enabled)) {
    try {
      switch (channel.type) {
        case 'email':
          await sendSecureEmailNotification(sanitizedNotification, channel.config.email!);
          break;
        case 'slack':
          await sendSecureSlackNotification(sanitizedNotification, channel.config.slack!);
          break;
        case 'teams':
          await sendSecureTeamsNotification(sanitizedNotification, channel.config.teams!);
          break;
        case 'webhook':
          await sendSecureWebhookNotification(sanitizedNotification, channel.config.webhook!);
          break;
      }
    } catch (error: any) {
      errors.push(`${channel.type}: ${error.message}`);
    }
  }
  
  // Log notification attempt
  await logNotificationAttempt(sanitizedNotification, channels, errors);
  
  return { success: errors.length === 0, errors };
};

// Secure email notification
const sendSecureEmailNotification = async (
  notification: SecureProvisioningNotification,
  config: { recipients: string[]; template?: string }
): Promise<void> => {
  // Validate and sanitize email addresses
  const validRecipients = config.recipients
    .map(email => sanitizeEmail(email))
    .filter(email => email.length > 0);
  
  if (validRecipients.length === 0) {
    throw new Error('No valid email recipients');
  }
  
  // In production, this would integrate with a real email service
  console.log('Sending secure email notification:', {
    to: validRecipients,
    subject: getEmailSubject(notification),
    body: getEmailBody(notification),
    timestamp: new Date().toISOString()
  });
  
  // Simulate API call with security headers
  await new Promise(resolve => setTimeout(resolve, 500));
};

// Secure Slack notification
const sendSecureSlackNotification = async (
  notification: SecureProvisioningNotification,
  config: { webhookUrl: string; channel: string }
): Promise<void> => {
  const sanitizedUrl = sanitizeUrl(config.webhookUrl);
  const sanitizedChannel = sanitizeInput(config.channel);
  
  const message = {
    channel: sanitizedChannel,
    text: getSlackMessage(notification),
    username: 'DevOps Provisioning Bot',
    icon_emoji: ':robot_face:',
    attachments: [
      {
        color: getSlackColor(notification.type),
        fields: [
          { title: 'Requester', value: notification.requester, short: true },
          { title: 'Resource Type', value: notification.resourceType, short: true },
          { title: 'Cost', value: `$${notification.estimatedCost}/month`, short: true },
          { title: 'Request ID', value: notification.requestId, short: true }
        ],
        footer: 'DevOps Provisioning System',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  const response = await fetch(sanitizedUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DevOps-Provisioning-System/1.0'
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
  }
};

// Secure Teams notification
const sendSecureTeamsNotification = async (
  notification: SecureProvisioningNotification,
  config: { webhookUrl: string }
): Promise<void> => {
  const sanitizedUrl = sanitizeUrl(config.webhookUrl);
  
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
          { "name": "Request ID", "value": notification.requestId },
          { "name": "Timestamp", "value": new Date().toISOString() }
        ]
      }
    ]
  };
  
  const response = await fetch(sanitizedUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DevOps-Provisioning-System/1.0'
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(10000)
  });
  
  if (!response.ok) {
    throw new Error(`Teams API error: ${response.status} ${response.statusText}`);
  }
};

// Secure webhook notification
const sendSecureWebhookNotification = async (
  notification: SecureProvisioningNotification,
  config: { url: string; headers?: Record<string, string> }
): Promise<void> => {
  const webhookConfigs = await getUserWebhookConfigs();
  const matchingConfig = webhookConfigs.find(wc => wc.url === config.url);
  
  if (!matchingConfig) {
    throw new Error('Webhook configuration not found or not verified');
  }
  
  const payload = {
    event: 'provisioning_notification',
    data: notification,
    timestamp: new Date().toISOString()
  };
  
  const result = await sendSecureWebhook(matchingConfig, payload);
  if (!result.success) {
    throw new Error(result.error || 'Webhook delivery failed');
  }
};

// Log notification attempts for audit
const logNotificationAttempt = async (
  notification: SecureProvisioningNotification,
  channels: SecureNotificationChannel[],
  errors: string[]
): Promise<void> => {
  try {
    // In production, you'd log this to an audit table
    console.log('Notification attempt logged:', {
      notificationId: notification.requestId,
      type: notification.type,
      channels: channels.map(c => c.type),
      success: errors.length === 0,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log notification attempt:', error);
  }
};

// Helper functions for message formatting
const getEmailSubject = (notification: SecureProvisioningNotification): string => {
  const subjects = {
    request_submitted: `New Provisioning Request: ${notification.resourceType}`,
    approval_required: `Approval Required: ${notification.resourceType}`,
    approved: `Request Approved: ${notification.resourceType}`,
    rejected: `Request Rejected: ${notification.resourceType}`,
    provisioning_completed: `Provisioning Complete: ${notification.resourceType}`,
    provisioning_failed: `Provisioning Failed: ${notification.resourceType}`,
    provisioning_started: `Provisioning Started: ${notification.resourceType}`
  };
  
  return subjects[notification.type] || `Provisioning Update: ${notification.resourceType}`;
};

const getEmailBody = (notification: SecureProvisioningNotification): string => {
  return `
    Request ID: ${notification.requestId}
    Requester: ${notification.requester}
    Resource Type: ${notification.resourceType}
    Estimated Cost: $${notification.estimatedCost}/month
    ${notification.approver ? `Approver: ${notification.approver}` : ''}
    ${notification.comments ? `Comments: ${notification.comments}` : ''}
    ${notification.error ? `Error: ${notification.error}` : ''}
    
    Timestamp: ${new Date().toISOString()}
    
    View details in the DevOps dashboard.
  `;
};

const getSlackMessage = (notification: SecureProvisioningNotification): string => {
  const messages = {
    approval_required: `🔔 New provisioning request requires approval`,
    approved: `✅ Provisioning request approved`,
    rejected: `❌ Provisioning request rejected`,
    provisioning_completed: `🎉 Resource provisioning completed successfully`,
    provisioning_failed: `⚠️ Resource provisioning failed`,
    request_submitted: `📋 New provisioning request submitted`,
    provisioning_started: `🚀 Resource provisioning started`
  };
  
  return messages[notification.type] || `📋 Provisioning update`;
};

const getTeamsMessage = (notification: SecureProvisioningNotification): string => {
  return getSlackMessage(notification);
};

const getSlackColor = (type: string): string => {
  const colors = {
    approved: 'good',
    provisioning_completed: 'good',
    rejected: 'danger',
    provisioning_failed: 'danger',
    approval_required: 'warning',
    request_submitted: '#439FE0',
    provisioning_started: '#439FE0'
  };
  
  return colors[type as keyof typeof colors] || '#439FE0';
};

const getTeamsColor = (type: string): string => {
  const colors = {
    approved: '28A745',
    provisioning_completed: '28A745',
    rejected: 'DC3545',
    provisioning_failed: 'DC3545',
    approval_required: 'FFC107',
    request_submitted: '007BFF',
    provisioning_started: '007BFF'
  };
  
  return colors[type as keyof typeof colors] || '007BFF';
};
