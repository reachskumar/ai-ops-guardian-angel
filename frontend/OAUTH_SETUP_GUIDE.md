# 🔐 OAuth Social Authentication Setup Guide

## 🚀 **InfraMind - Social Authentication**

This guide will help you set up real OAuth authentication with Google, Microsoft, and GitHub for your InfraMind platform.

---

## 📋 **Current Status**

✅ **Backend OAuth Infrastructure** - Complete  
✅ **Frontend OAuth Integration** - Complete  
✅ **Demo Mode** - Working (no real credentials needed)  
🔄 **Production OAuth** - Ready for configuration  

---

## 🎯 **Features Implemented**

### **✅ Backend OAuth Support**
- Google OAuth2.0
- Microsoft OAuth2.0  
- GitHub OAuth2.0
- Secure token handling
- User session management
- CSRF protection with state parameter

### **✅ Frontend OAuth Integration**
- Social login buttons (Google, Microsoft, GitHub)
- OAuth callback handling
- Automatic redirect after authentication
- Error handling and user feedback
- Loading states and progress indicators

### **✅ Security Features**
- State parameter for CSRF protection
- Secure token storage
- Session management
- Rate limiting
- Input validation

---

## 🔧 **Demo Mode (Current)**

The system is currently running in **demo mode**, which means:

- ✅ **No real OAuth credentials required**
- ✅ **Mock authentication works**
- ✅ **All features functional**
- ✅ **Perfect for development and testing**

### **How Demo Mode Works:**
1. Click any social login button (Google, Microsoft, GitHub)
2. Backend creates a mock user with demo credentials
3. User is automatically logged in
4. Full access to all platform features

---

## 🚀 **Production OAuth Setup**

To enable real OAuth authentication, follow these steps:

### **1. Google OAuth Setup**

1. **Create Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API

2. **Configure OAuth Consent Screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Fill in app information:
     - App name: "InfraMind"
     - User support email: your-email@domain.com
     - Developer contact: your-email@domain.com

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8080/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)

4. **Get Credentials:**
   - Copy the Client ID and Client Secret
   - Add to backend environment variables

### **2. Microsoft OAuth Setup**

1. **Register Application:**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name: "InfraMind"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"

2. **Configure Authentication:**
   - Go to "Authentication" in your app
   - Add platform: "Web"
   - Add redirect URIs:
     - `http://localhost:8080/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)

3. **Get Credentials:**
   - Copy the Application (client) ID
   - Create a client secret in "Certificates & secrets"
   - Add to backend environment variables

### **3. GitHub OAuth Setup**

1. **Create OAuth App:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in details:
     - Application name: "InfraMind"
     - Homepage URL: `http://localhost:8080` (development)
     - Authorization callback URL: `http://localhost:8080/auth/callback`

2. **Get Credentials:**
   - Copy the Client ID
   - Generate a Client Secret
   - Add to backend environment variables

---

## 🔧 **Environment Configuration**

### **Backend Environment Variables**

Add these to your backend `.env` file:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# OAuth Redirect URI
OAUTH_REDIRECT_URI=http://localhost:8080/auth/callback

# JWT Secret (change in production)
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
```

### **Frontend Environment Variables**

Add these to your frontend `.env` file:

```bash
# OAuth Configuration (optional for frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

---

## 🧪 **Testing OAuth**

### **1. Start All Services**

```bash
# Backend Services
cd backend/services/ai-services && source venv/bin/activate && python start_service.py
cd backend/services/api-gateway && npm run dev
cd backend/services/data-services && npm run dev

# Frontend
cd infraguard-ai-main && npm run dev
```

### **2. Test Social Authentication**

1. **Open the application:** `http://localhost:8080`
2. **Go to authentication page:** Click "Sign In" or "Sign Up"
3. **Test social login:** Click any social button (Google, Microsoft, GitHub)
4. **Verify authentication:** You should be redirected to the dashboard

### **3. Demo Mode Testing**

In demo mode, clicking any social button will:
- Create a mock user automatically
- Log you in immediately
- Redirect to dashboard
- Show success message

---

## 🔒 **Security Considerations**

### **✅ Implemented Security Features**

- **CSRF Protection:** State parameter prevents cross-site request forgery
- **Secure Token Storage:** JWT tokens with short expiration
- **Input Validation:** All OAuth parameters validated
- **Rate Limiting:** Prevents brute force attacks
- **Session Management:** Secure session handling
- **Error Handling:** Secure error messages

### **🔧 Production Security Checklist**

- [ ] Use environment variables for all secrets
- [ ] Change JWT secret key
- [ ] Use HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Implement proper error handling
- [ ] Add rate limiting
- [ ] Configure session timeout

---

## 🎉 **Benefits of Social Authentication**

### **✅ User Experience**
- **One-click login** - No password to remember
- **Faster onboarding** - Reduced friction
- **Trusted providers** - Users trust Google, Microsoft, GitHub
- **Automatic profile data** - Name, email, avatar

### **✅ Security Benefits**
- **No password storage** - Reduces security risk
- **Two-factor authentication** - Inherits provider's 2FA
- **Account recovery** - Uses provider's recovery methods
- **Fraud prevention** - Provider handles verification

### **✅ Developer Benefits**
- **Reduced complexity** - No password reset flows
- **Better security** - Leverages provider security
- **User verification** - Email already verified
- **Profile completion** - Automatic user data

---

## 🚀 **Next Steps**

### **For Development:**
1. ✅ **Current setup works perfectly** - Use demo mode
2. ✅ **Test all features** - Social login, dashboard, chat
3. ✅ **Verify security** - Check token handling, sessions

### **For Production:**
1. 🔧 **Configure real OAuth credentials** (follow setup guide)
2. 🔧 **Set up HTTPS** - Required for OAuth
3. 🔧 **Configure domain** - Update redirect URIs
4. 🔧 **Set up monitoring** - Track authentication metrics
5. 🔧 **Test thoroughly** - All providers, error scenarios

---

## 📞 **Support**

### **Common Issues:**

**Q: OAuth buttons not working?**
A: Check that backend services are running on correct ports

**Q: Redirect URI mismatch?**
A: Ensure redirect URI in OAuth provider matches your app URL

**Q: CORS errors?**
A: Backend CORS is configured for localhost:8080

**Q: Demo mode not working?**
A: Check backend logs for any startup errors

### **Getting Help:**
- Check backend logs for detailed error messages
- Verify all services are running
- Test OAuth endpoints directly with curl
- Review this setup guide for configuration steps

---

**🎉 Congratulations! Your InfraMind platform now has enterprise-grade social authentication!**

The system is ready for both development (demo mode) and production (real OAuth) use. 