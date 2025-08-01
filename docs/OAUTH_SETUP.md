# 🔐 OAuth Social Login Setup Guide

This guide will help you set up Google and GitHub OAuth social login for InfraMind.

## 🚀 Quick Start (Demo Mode)

The system includes a **demo mode** that works without real OAuth credentials for testing:

1. **Frontend**: Navigate to `http://localhost:8080/auth`
2. **Click**: Google or GitHub login buttons
3. **Demo**: The system will create demo users automatically

## 🔧 Production Setup

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.developers.google.com/
   - Create a new project or select existing one

2. **Enable APIs**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"

4. **Configure OAuth Client**
   - **Name**: InfraMind
   - **Authorized JavaScript origins**:
     ```
     http://localhost:8080
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:8080/auth/callback
     http://localhost:3000/auth/callback
     ```

5. **Copy Credentials**
   - Copy the **Client ID** and **Client Secret**

### GitHub OAuth Setup

1. **Go to GitHub Developer Settings**
   - Visit: https://github.com/settings/developers
   - Click "New OAuth App"

2. **Configure OAuth App**
   - **Application name**: InfraMind
   - **Homepage URL**: `http://localhost:8080`
   - **Authorization callback URL**: `http://localhost:8080/auth/callback`

3. **Copy Credentials**
   - Copy the **Client ID** and **Client Secret**

## 📝 Environment Configuration

Add these variables to your `.env` file:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OAUTH_REDIRECT_URI=http://localhost:8080/auth/callback
```

## 🔄 Restart Services

After configuring OAuth credentials:

```bash
# Restart AI services
cd backend/services/ai-services
source venv/bin/activate
python start_service.py
```

## 🧪 Testing

### Test OAuth Endpoints

```bash
# Test Google OAuth
curl "http://localhost:8001/auth/oauth/google?redirect_uri=http://localhost:8080/auth/callback"

# Test GitHub OAuth
curl "http://localhost:8001/auth/oauth/github?redirect_uri=http://localhost:8080/auth/callback"
```

### Test Frontend

1. **Start Frontend**: `cd frontend/inframind-enhanced && npm run dev`
2. **Navigate**: `http://localhost:8080/auth`
3. **Click**: Google or GitHub buttons
4. **Verify**: User is created and logged in

## 🔒 Security Features

### OAuth Security
- **CSRF Protection**: State parameter prevents CSRF attacks
- **Secure Redirects**: Validated redirect URIs
- **Token Exchange**: Secure code-to-token exchange
- **User Validation**: Email verification from providers

### User Management
- **Auto-Creation**: New users created automatically
- **Account Linking**: Existing users linked by email
- **Role Assignment**: Default user roles assigned
- **Session Management**: Secure session handling

## 🐛 Troubleshooting

### Common Issues

1. **"OAuth provider not configured"**
   - Check environment variables are set
   - Restart AI services after configuration

2. **"Invalid redirect URI"**
   - Verify redirect URI matches OAuth app configuration
   - Check for trailing slashes

3. **"Failed to exchange code for token"**
   - Verify client ID and secret are correct
   - Check OAuth app configuration

4. **"Email not provided by OAuth provider"**
   - Ensure required scopes are configured
   - Check provider-specific settings

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG_OAUTH=true

# Restart services
python start_service.py
```

## 📚 API Reference

### OAuth Endpoints

```bash
# Get OAuth URL
GET /auth/oauth/{provider}?redirect_uri={uri}

# Handle OAuth Callback
POST /auth/oauth/callback
{
  "code": "authorization_code",
  "state": "csrf_state",
  "provider": "google|github"
}
```

### Response Format

```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "user_id": "oauth_google_123",
    "email": "user@gmail.com",
    "username": "user",
    "org_id": "demo_org",
    "roles": ["user"],
    "permissions": ["use_agents"],
    "auth_provider": "google"
  }
}
```

## 🎯 Next Steps

1. **Production Deployment**: Update redirect URIs for production domain
2. **Additional Providers**: Add Microsoft, Okta, or custom OAuth providers
3. **Advanced Features**: Implement MFA for OAuth users
4. **Analytics**: Track OAuth login patterns
5. **Security**: Add rate limiting and additional security measures

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review server logs for detailed error messages
- Ensure all environment variables are properly set 