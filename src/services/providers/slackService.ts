
interface SlackWebhookMessage {
  text: string;
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: any[];
}

export const sendSlackWebhook = async (
  webhookUrl: string,
  message: SlackWebhookMessage
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack webhook error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    if (responseText !== 'ok') {
      throw new Error(`Slack webhook failed: ${responseText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Slack webhook failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Slack notification failed'
    };
  }
};
