# Environment Configuration Guide

Create a `.env.local` file in your project root with the following variables:

## Core Configuration
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
VITE_APP_URL=http://localhost:8080
VITE_APP_NAME="AI Ops Guardian Angel"
VITE_APP_VERSION=1.0.0
NODE_ENV=development
VITE_ENVIRONMENT=development
```

## Cloud Provider Credentials
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_ACCOUNT_ID=your_aws_account_id

# Azure Configuration
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_SUBSCRIPTION_ID=your_azure_subscription_id

# Google Cloud Configuration
GCP_PROJECT_ID=your_gcp_project_id
GCP_CLIENT_EMAIL=your_service_account_email
GCP_PRIVATE_KEY=your_service_account_private_key
```

## Security & Authentication
```bash
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret_key
API_RATE_LIMIT=1000
SESSION_TIMEOUT=3600
```

## External Integrations
```bash
# Email Notifications
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=notifications@your-domain.com

# Slack Alerts
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url

# AI Features
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORG_ID=your_openai_org_id
```

## Security Scanning Tools (Optional)
```bash
NESSUS_ACCESS_KEY=your_nessus_access_key
NESSUS_SECRET_KEY=your_nessus_secret_key
QUALYS_USERNAME=your_qualys_username
QUALYS_PASSWORD=your_qualys_password
```

## Feature Flags
```bash
ENABLE_AI_FEATURES=true
ENABLE_SECURITY_SCANNING=true
ENABLE_COST_OPTIMIZATION=true
ENABLE_REAL_TIME_MONITORING=true
```

## Setup Instructions

1. Copy this template to `.env.local`
2. Replace all placeholder values with your actual credentials
3. Ensure `.env.local` is in your `.gitignore`
4. Restart your development server after making changes

## Security Notes

- Never commit `.env.local` to version control
- Use different credentials for development/staging/production
- Rotate credentials regularly
- Use least-privilege principle for all cloud credentials
- Consider using secret management services in production 