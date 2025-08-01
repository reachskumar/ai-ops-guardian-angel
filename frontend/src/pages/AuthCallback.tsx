import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { aiServicesAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        if (error) {
          setError(`OAuth error: ${error}`);
          setStatus('error');
          return;
        }

        if (!code || !state) {
          setError('Missing OAuth parameters');
          setStatus('error');
          return;
        }

        // Get stored OAuth state and provider
        const storedState = localStorage.getItem('oauth_state');
        const provider = localStorage.getItem('oauth_provider') as 'google' | 'microsoft' | 'github';

        if (!storedState || storedState !== state) {
          setError('Invalid OAuth state');
          setStatus('error');
          return;
        }

        if (!provider) {
          setError('No OAuth provider found');
          setStatus('error');
          return;
        }

        // Handle OAuth callback
        const response = await aiServicesAPI.handleOAuthCallback(provider, code, state);
        
        if (response.success && response.data) {
          // Store authentication data
          localStorage.setItem('auth_token', response.data.token);
          localStorage.setItem('auth_user', JSON.stringify(response.data.user));
          
          // Clear OAuth state
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_provider');
          
          setStatus('success');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError(response.error || 'OAuth authentication failed');
          setStatus('error');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        setStatus('error');
        console.error('OAuth callback error:', err);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete your authentication'}
            {status === 'success' && 'You will be redirected to your dashboard shortly'}
            {status === 'error' && 'There was an issue with your authentication'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Processing your authentication...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-gray-600">Welcome to InfraMind!</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <p className="text-red-600">{error}</p>
              <div className="flex space-x-2">
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback; 