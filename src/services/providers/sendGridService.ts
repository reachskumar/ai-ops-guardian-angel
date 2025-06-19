
interface SendGridEmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmailViaSendGrid = async (
  emailData: SendGridEmailRequest,
  apiKey: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: emailData.to.map(email => ({ email })),
            subject: emailData.subject
          }
        ],
        from: {
          email: emailData.from || 'noreply@your-domain.com',
          name: 'DevOps Provisioning System'
        },
        content: [
          {
            type: 'text/html',
            value: emailData.html
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
    }

    return { success: true };
  } catch (error) {
    console.error('SendGrid email failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email delivery failed'
    };
  }
};
