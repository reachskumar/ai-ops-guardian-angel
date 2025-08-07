import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AWSResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
}

const CloudConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<AWSResource[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if AWS credentials are available
    checkAWSConnection();
  }, []);

  const checkAWSConnection = async () => {
    try {
      const response = await fetch('http://localhost:8001/aws/ec2');
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('Connected to AWS');
        fetchResources();
      } else {
        setConnectionStatus('AWS credentials not found');
      }
    } catch (error) {
      setConnectionStatus('Error connecting to AWS');
    }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      // Fetch real AWS resources
      const [ec2Response, s3Response] = await Promise.all([
        fetch('http://localhost:8001/aws/ec2'),
        fetch('http://localhost:8001/aws/s3')
      ]);

      const resources: AWSResource[] = [];

      if (ec2Response.ok) {
        const ec2Data = await ec2Response.json();
        if (ec2Data.instances) {
          ec2Data.instances.forEach((instance: any) => {
            resources.push({
              id: instance.InstanceId,
              name: instance.Name || 'Unnamed Instance',
              type: 'EC2 Instance',
              region: instance.Region,
              status: instance.State,
              cost: instance.MonthlyCost
            });
          });
        }
      }

      if (s3Response.ok) {
        const s3Data = await s3Response.json();
        if (s3Data.buckets) {
          s3Data.buckets.forEach((bucket: any) => {
            resources.push({
              id: bucket.Name,
              name: bucket.Name,
              type: 'S3 Bucket',
              region: bucket.Region,
              status: 'Active',
              cost: bucket.MonthlyCost
            });
          });
        }
      }

      setResources(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectAWS = async () => {
    setIsLoading(true);
    setConnectionStatus('Connecting to AWS...');
    
    try {
      // Test AWS connection
      const response = await fetch('http://localhost:8001/aws/ec2');
      if (response.ok) {
        setIsConnected(true);
        setConnectionStatus('Successfully connected to AWS!');
        fetchResources();
      } else {
        setConnectionStatus('Failed to connect. Please check your AWS credentials.');
      }
    } catch (error) {
      setConnectionStatus('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToResources = () => {
    navigate('/resources');
  };

  const goToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Cloud Connection</h1>
        <p className="text-muted-foreground mt-2">Connect your cloud accounts to manage resources with AI</p>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AWS Connection */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">AWS</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Amazon Web Services</h3>
                <p className="text-sm text-muted-foreground">Connect your AWS account</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {connectionStatus || 'Click connect to link your AWS account'}
          </p>
          
          <button
            onClick={connectAWS}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isConnected
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            } disabled:opacity-50`}
          >
            {isLoading ? 'Connecting...' : (isConnected ? 'Reconnect' : 'Connect AWS')}
          </button>
        </div>

        {/* Azure Connection */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">AZ</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Microsoft Azure</h3>
                <p className="text-sm text-muted-foreground">Connect your Azure account</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Not Connected
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Azure integration coming soon
          </p>
          
          <button
            disabled
            className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* GCP Connection */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold">GC</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Google Cloud Platform</h3>
                <p className="text-sm text-muted-foreground">Connect your GCP account</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Not Connected
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            GCP integration coming soon
          </p>
          
          <button
            disabled
            className="w-full py-2 px-4 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Connected Resources */}
      {isConnected && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your AWS Resources</h2>
            <div className="flex space-x-2">
              <button
                onClick={goToResources}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                View All Resources
              </button>
              <button
                onClick={goToChat}
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
              >
                AI Chat
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.slice(0, 6).map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-foreground">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground">{resource.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resource.status === 'running' || resource.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Region: {resource.region}</p>
                    {resource.cost && <p>Monthly: ${resource.cost}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">☁️</div>
              <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground">
                Your AWS account is connected but no resources were found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {isConnected && (
        <div className="mt-8 bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🤖</div>
              <h3 className="font-medium text-foreground">AI Chat</h3>
              <p className="text-sm text-muted-foreground">Ask AI to manage your resources</p>
            </button>
            
            <button
              onClick={() => navigate('/resources')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-foreground">Resource List</h3>
              <p className="text-sm text-muted-foreground">View all your cloud resources</p>
            </button>
            
            <button
              onClick={() => navigate('/cost-optimization')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-foreground">Cost Analysis</h3>
              <p className="text-sm text-muted-foreground">Optimize your cloud spending</p>
            </button>
            
            <button
              onClick={() => navigate('/security')}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-medium text-foreground">Security</h3>
              <p className="text-sm text-muted-foreground">Check security posture</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudConnection; 