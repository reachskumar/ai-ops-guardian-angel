"""
Cost Forecast Model Tool
Provides ML-powered cost forecasting functionality
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor


class CostForecastModel:
    """ML model for forecasting cloud costs"""
    
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.forecast_horizon = 90  # days
    
    async def train_model(self, historical_data: List[Dict[str, Any]]) -> bool:
        """Train the forecasting model with historical cost data"""
        try:
            if not historical_data:
                return False
            
            # Convert to DataFrame
            df = pd.DataFrame(historical_data)
            
            # Feature engineering
            df['date'] = pd.to_datetime(df['date'])
            df['day_of_week'] = df['date'].dt.dayofweek
            df['month'] = df['date'].dt.month
            df['day_of_month'] = df['date'].dt.day
            
            # Prepare features and target
            features = ['day_of_week', 'month', 'day_of_month']
            X = df[features].values
            y = df['cost'].values
            
            # Train model
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.model.fit(X, y)
            self.is_trained = True
            
            return True
            
        except Exception as e:
            print(f"Error training model: {e}")
            return False
    
    async def forecast_costs(self, days: int = 30) -> Dict[str, Any]:
        """Forecast costs for the specified number of days"""
        try:
            if not self.is_trained:
                return {"error": "Model not trained"}
            
            # Generate future dates
            future_dates = []
            current_date = datetime.now()
            
            for i in range(days):
                future_date = current_date + timedelta(days=i)
                future_dates.append({
                    'date': future_date,
                    'day_of_week': future_date.weekday(),
                    'month': future_date.month,
                    'day_of_month': future_date.day
                })
            
            # Prepare features
            features = ['day_of_week', 'month', 'day_of_month']
            X_future = np.array([[d[f] for f in features] for d in future_dates])
            
            # Make predictions
            predictions = self.model.predict(X_future)
            
            # Format results
            forecast_data = []
            for i, (date_info, pred) in enumerate(zip(future_dates, predictions)):
                forecast_data.append({
                    'date': date_info['date'].isoformat(),
                    'predicted_cost': float(pred),
                    'confidence': 0.85  # Placeholder confidence
                })
            
            return {
                'forecast_days': days,
                'total_predicted_cost': float(sum(predictions)),
                'daily_forecasts': forecast_data,
                'model_accuracy': 0.85  # Placeholder accuracy
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    async def get_forecast_insights(self, forecast_data: Dict[str, Any]) -> List[str]:
        """Generate insights from forecast data"""
        insights = []
        
        try:
            daily_costs = [day['predicted_cost'] for day in forecast_data.get('daily_forecasts', [])]
            
            if daily_costs:
                avg_cost = np.mean(daily_costs)
                max_cost = np.max(daily_costs)
                min_cost = np.min(daily_costs)
                
                insights.append(f"Average daily cost: ${avg_cost:.2f}")
                insights.append(f"Peak daily cost: ${max_cost:.2f}")
                insights.append(f"Minimum daily cost: ${min_cost:.2f}")
                
                # Trend analysis
                if len(daily_costs) > 7:
                    weekly_trend = np.mean(daily_costs[-7:]) - np.mean(daily_costs[:7])
                    if weekly_trend > 0:
                        insights.append("Cost trend is increasing")
                    elif weekly_trend < 0:
                        insights.append("Cost trend is decreasing")
                    else:
                        insights.append("Cost trend is stable")
            
        except Exception as e:
            insights.append(f"Error generating insights: {str(e)}")
        
        return insights 