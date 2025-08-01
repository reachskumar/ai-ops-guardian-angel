# GitHub OAuth Setup for Production

## 🚀 Quick Setup Guide

### 1. Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: `InfraMind`
   - **Homepage URL**: `http://localhost:8080` (dev) / `https://your-domain.com` (prod)
   - **Application description**: `AI-Powered Infrastructure Management Platform`
   - **Authorization callback URL**: `http://localhost:8080/auth/callback`

### 2. Get Credentials
After creating the OAuth app, you'll get:
- **Client ID**: Copy from the OAuth app page
- **Client Secret**: Click "Generate a new client secret" and copy it

### 3. Environment Variables
Add to your `.env` file:
```bash
GITHUB_CLIENT_ID=your-actual-client-id
GITHUB_CLIENT_SECRET=your-actual-client-secret
OAUTH_REDIRECT_URI=http://localhost:8080/auth/callback
```

## 🔒 Security Best Practices

### 1. GitHub App vs OAuth App
- **OAuth App**: For user authentication (what we're using)
- **GitHub App**: For repository access and integrations

### 2. Scopes Configuration
For user authentication, we need:
- `user:email` - Access to user's email addresses
- `read:user` - Access to user's profile information

### 3. Security Measures
- Use HTTPS in production
- Validate redirect URIs
- Implement CSRF protection
- Store tokens securely

## 🧪 Testing

### Test OAuth Flow
```bash
# Test the OAuth endpoint
curl "http://localhost:8001/auth/oauth/github?redirect_uri=http://localhost:8080/auth/callback"

# Expected response:
{
  "authorization_url": "https://github.com/login/oauth/authorize?...",
  "state": "...",
  "provider": "github"
}
```

### Test Callback
1. Click the authorization URL
2. Complete GitHub login
3. Verify callback handling

## 🚨 Troubleshooting

### Common Issues
1. **"Invalid redirect URI"**
   - Check that callback URL matches exactly
   - Include protocol (http/https)
   - Check for trailing slashes

2. **"Application not found"**
   - Verify Client ID is correct
   - Check that OAuth app is properly configured
   - Ensure callback URL is set correctly

3. **"Access denied"**
   - Check OAuth app permissions
   - Verify scopes are configured
   - Check user permissions

## 📋 Production Checklist

- [ ] GitHub OAuth App created
- [ ] Client ID and Secret obtained
- [ ] Callback URL configured
- [ ] Environment variables set
- [ ] Frontend callback handling implemented
- [ ] Backend OAuth flow tested
- [ ] Security measures implemented
- [ ] HTTPS configured (production)
- [ ] Error handling implemented
- [ ] User permissions configured

## 🔧 Advanced Configuration

### Custom Scopes
If you need additional permissions, add scopes to the OAuth app:
- `repo` - Full access to repositories
- `admin:org` - Organization administration
- `write:packages` - Package publishing

### Webhook Integration
For advanced features, consider setting up webhooks:
1. Go to OAuth app settings
2. Add webhook URL
3. Configure events to listen for

## 📊 Monitoring

### OAuth Usage
Monitor OAuth usage in GitHub:
1. Go to OAuth app settings
2. View usage statistics
3. Monitor for suspicious activity

### Error Tracking
Implement error tracking for OAuth failures:
- Log OAuth errors
- Monitor success rates
- Track user authentication patterns 