# Google OAuth Setup for Production

## 🚀 Quick Setup Guide

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type
3. Fill in required information:
   - App name: `InfraMind`
   - User support email: `your-email@domain.com`
   - Developer contact information: `your-email@domain.com`
4. Add scopes: `openid`, `email`, `profile`
5. Add test users (your email)

### 3. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Name: `InfraMind Web Client`
5. **Authorized redirect URIs**:
   ```
   http://localhost:8080/auth/callback
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

### 4. Get Credentials
- **Client ID**: Copy from the created OAuth client
- **Client Secret**: Copy from the created OAuth client

### 5. Environment Variables
Add to your `.env` file:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
OAUTH_REDIRECT_URI=http://localhost:8080/auth/callback
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit credentials to version control
- Use different credentials for development/staging/production
- Rotate secrets regularly

### 2. Redirect URI Validation
- Always validate redirect URIs on the server side
- Use HTTPS in production
- Implement CSRF protection

### 3. Token Security
- Store tokens securely (encrypted)
- Implement token refresh logic
- Set appropriate token expiration

## 🧪 Testing

### Test OAuth Flow
```bash
# Test the OAuth endpoint
curl "http://localhost:8001/auth/oauth/google?redirect_uri=http://localhost:8080/auth/callback"

# Expected response:
{
  "authorization_url": "https://accounts.google.com/o/oauth2/auth?...",
  "state": "...",
  "provider": "google"
}
```

### Test Callback
1. Click the authorization URL
2. Complete Google login
3. Verify callback handling

## 🚨 Troubleshooting

### Common Issues
1. **"Invalid redirect URI"**
   - Check that redirect URI matches exactly
   - Include protocol (http/https)
   - Check for trailing slashes

2. **"OAuth client not found"**
   - Verify Client ID is correct
   - Check that OAuth consent screen is configured
   - Ensure API is enabled

3. **"Access blocked"**
   - Add your email as test user
   - Check OAuth consent screen configuration
   - Verify scopes are added

## 📋 Production Checklist

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URIs configured
- [ ] Environment variables set
- [ ] Frontend callback handling implemented
- [ ] Backend OAuth flow tested
- [ ] Security measures implemented
- [ ] HTTPS configured (production)
- [ ] Error handling implemented 