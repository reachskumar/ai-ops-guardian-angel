
interface TeamsWebhookMessage {
  '@type': string;
  '@context': string;
  themeColor?: string;
  summary: string;
  sections: Array<{
    activityTitle?: string;
    facts?: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export const sendTeamsWebhook = async (
  webhookUrl: string,
  message: TeamsWebhookMessage
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
      throw new Error(`Teams webhook error: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Teams webhook failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Teams notification failed'
    };
  }
};
