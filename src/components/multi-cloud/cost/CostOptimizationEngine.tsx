
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CloudResource, CloudAccount } from '@/services/cloud/types';
import { DollarSign, TrendingDown, AlertCircle, CheckCircle, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CostOptimizationEngineProps {
  resources: CloudResource[];
  accounts: CloudAccount[];
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  effort: 'easy' | 'medium' | 'complex';
  category: 'rightsizing' | 'scheduling' | 'storage' | 'reserved' | 'spot';
  resources: string[];
  status: 'pending' | 'applied' | 'dismissed';
}

interface CostPrediction {
  provider: string;
  currentCost: number;
  predictedCost: number;
  savings: number;
  confidence: number;
}

const CostOptimizationEngine: React.FC<CostOptimizationEngineProps> = ({ resources, accounts }) => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [predictions, setPredictions] = useState<CostPrediction[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateRecommendations();
    generatePredictions();
  }, [resources]);

  const generateRecommendations = () => {
    const newRecommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        title: 'Right-size Over-provisioned VMs',
        description: '3 VMs are consistently using <20% CPU and memory. Downsizing could save significant costs.',
        impact: 'high',
        savings: 1240,
        effort: 'easy',
        category: 'rightsizing',
        resources: ['vm-1234', 'vm-5678', 'vm-9012'],
        status: 'pending'
      },
      {
        id: '2',
        title: 'Schedule Non-Production Resources',
        description: 'Development and staging resources can be scheduled to run only during business hours.',
        impact: 'medium',
        savings: 850,
        effort: 'easy',
        category: 'scheduling',
        resources: ['vm-dev-1', 'vm-staging-2'],
        status: 'pending'
      },
      {
        id: '3',
        title: 'Use Spot Instances for Batch Processing',
        description: 'Batch processing workloads can leverage spot instances for up to 90% cost reduction.',
        impact: 'high',
        savings: 2100,
        effort: 'medium',
        category: 'spot',
        resources: ['batch-job-1', 'batch-job-2'],
        status: 'pending'
      },
      {
        id: '4',
        title: 'Optimize Storage Tiers',
        description: 'Move infrequently accessed data to cheaper storage tiers.',
        impact: 'medium',
        savings: 650,
        effort: 'easy',
        category: 'storage',
        resources: ['s3-bucket-1', 'blob-storage-1'],
        status: 'pending'
      },
      {
        id: '5',
        title: 'Purchase Reserved Instances',
        description: 'Stable workloads can benefit from 1-3 year reserved instance commitments.',
        impact: 'high',
        savings: 3200,
        effort: 'complex',
        category: 'reserved',
        resources: ['vm-prod-1', 'vm-prod-2', 'vm-prod-3'],
        status: 'pending'
      }
    ];

    setRecommendations(newRecommendations);
    setTotalSavings(newRecommendations.reduce((sum, rec) => sum + rec.savings, 0));
  };

  const generatePredictions = () => {
    const newPredictions: CostPrediction[] = [
      {
        provider: 'AWS',
        currentCost: 4500,
        predictedCost: 3200,
        savings: 1300,
        confidence: 87
      },
      {
        provider: 'Azure',
        currentCost: 3200,
        predictedCost: 2100,
        savings: 1100,
        confidence: 92
      },
      {
        provider: 'GCP',
        currentCost: 2800,
        predictedCost: 2000,
        savings: 800,
        confidence: 85
      }
    ];

    setPredictions(newPredictions);
  };

  const applyRecommendation = async (id: string) => {
    setIsAnalyzing(true);
    
    // Simulate applying recommendation
    setTimeout(() => {
      setRecommendations(prev => prev.map(rec => 
        rec.id === id ? { ...rec, status: 'applied' } : rec
      ));
      
      const recommendation = recommendations.find(r => r.id === id);
      if (recommendation) {
        toast({
          title: "Optimization Applied",
          description: `Successfully applied "${recommendation.title}" - Est. savings: $${recommendation.savings}/month`,
        });
      }
      
      setIsAnalyzing(false);
    }, 2000);
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status: 'dismissed' } : rec
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rightsizing': return <Target className="h-4 w-4" />;
      case 'scheduling': return <Zap className="h-4 w-4" />;
      case 'spot': return <TrendingDown className="h-4 w-4" />;
      case 'storage': return <DollarSign className="h-4 w-4" />;
      case 'reserved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cost Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {recommendations.filter(r => r.status === 'pending').length} recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applied Optimizations</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recommendations.filter(r => r.status === 'applied').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {recommendations.length} total recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              Average optimization success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Prediction Analysis</CardTitle>
          <CardDescription>
            Predicted cost savings by cloud provider after applying optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map(prediction => (
              <div key={prediction.provider} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.provider}</h4>
                    <Badge variant="outline">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span>
                      <p className="font-medium">${prediction.currentCost}/month</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Predicted:</span>
                      <p className="font-medium text-green-600">${prediction.predictedCost}/month</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings:</span>
                      <p className="font-medium text-green-600">-${prediction.savings}/month</p>
                    </div>
                  </div>
                  <Progress 
                    value={(prediction.savings / prediction.currentCost) * 100} 
                    className="mt-2 h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Recommendations</CardTitle>
          <CardDescription>
            AI-powered recommendations to reduce your cloud spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.filter(rec => rec.status === 'pending').map(recommendation => (
              <div key={recommendation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {getCategoryIcon(recommendation.category)}
                    <div className="flex-1">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendation.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {recommendation.effort} effort
                        </Badge>
                        <span className="text-sm text-green-600 font-medium">
                          ${recommendation.savings}/month savings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => dismissRecommendation(recommendation.id)}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => applyRecommendation(recommendation.id)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Applying...' : 'Apply Optimization'}
                  </Button>
                </div>
              </div>
            ))}
            
            {recommendations.filter(rec => rec.status === 'applied').length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-green-600">Applied Optimizations</h4>
                <div className="space-y-2">
                  {recommendations.filter(rec => rec.status === 'applied').map(recommendation => (
                    <div key={recommendation.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{recommendation.title}</span>
                      <Badge variant="outline" className="text-green-600">
                        ${recommendation.savings}/month saved
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostOptimizationEngine;
