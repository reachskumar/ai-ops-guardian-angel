"""
Performance Testing Agent
Load testing and performance analysis with advanced features
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging
from pathlib import Path

from ..base_agent import BaseAgent, AgentTask, AgentCapabilities, AgentRecommendation
from ...config.settings import AgentType
from ...tools.testing.performance_tester import PerformanceTester
from ...tools.testing.load_generator import LoadGenerator
from ...tools.testing.performance_analyzer import PerformanceAnalyzer

logger = logging.getLogger(__name__)


class PerformanceTestingAgent(BaseAgent):
    """
    Advanced Performance Testing Agent for load testing and performance analysis
    """
    
    def __init__(self):
        capabilities = AgentCapabilities(
            supported_tasks=["performance_test", "load_test", "stress_test", "analyze_performance", "benchmark"],
            required_tools=["performance_tester", "load_generator", "performance_analyzer"],
            max_concurrent_tasks=3,
            average_response_time=60.0
        )
        
        super().__init__(
            agent_type=AgentType.PERFORMANCE_TESTING,
            name="Performance Testing Agent",
            description="Load testing and performance analysis with advanced features",
            capabilities=capabilities
        )
        
        self.performance_tester = PerformanceTester()
        self.load_generator = LoadGenerator()
        self.performance_analyzer = PerformanceAnalyzer()
        self.test_history = []
        
    async def process_task(self, task: AgentTask) -> AgentRecommendation:
        """Process performance testing tasks"""
        
        try:
            if task.task_type == "run_load_test":
                return await self._run_load_test(task)
            elif task.task_type == "run_stress_test":
                return await self._run_stress_test(task)
            elif task.task_type == "run_benchmark":
                return await self._run_benchmark(task)
            elif task.task_type == "analyze_performance":
                return await self._analyze_performance(task)
            elif task.task_type == "generate_report":
                return await self._generate_report(task)
            elif task.task_type == "compare_performance":
                return await self._compare_performance(task)
            elif task.task_type == "optimize_performance":
                return await self._optimize_performance(task)
            else:
                return AgentRecommendation(
                    success=False,
                    message=f"Unknown task type: {task.task_type}",
                    data={}
                )
                
        except Exception as e:
            logger.error(f"Error in PerformanceTestingAgent: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Performance testing error: {str(e)}",
                data={}
            )
    
    async def _run_load_test(self, task: AgentTask) -> AgentRecommendation:
        """Run load test on application"""
        
        try:
            target_url = task.data.get("target_url")
            load_config = task.data.get("load_config", {})
            test_duration = task.data.get("test_duration", 300)  # 5 minutes default
            
            # Run load test
            test_results = await self.performance_tester.run_load_test(
                target_url=target_url,
                load_config=load_config,
                test_duration=test_duration
            )
            
            # Record test
            test_record = {
                "test_type": "load_test",
                "target_url": target_url,
                "test_id": test_results["test_id"],
                "test_duration": test_duration,
                "concurrent_users": load_config.get("concurrent_users", 10),
                "test_date": datetime.now().isoformat(),
                "results": test_results
            }
            
            self.test_history.append(test_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Load test completed for {target_url}",
                data={
                    "test_id": test_results["test_id"],
                    "target_url": target_url,
                    "test_results": test_results,
                    "avg_response_time": test_results.get("avg_response_time", 0),
                    "throughput": test_results.get("throughput", 0),
                    "error_rate": test_results.get("error_rate", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Load test error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Load test failed: {str(e)}",
                data={}
            )
    
    async def _run_stress_test(self, task: AgentTask) -> AgentRecommendation:
        """Run stress test to find breaking point"""
        
        try:
            target_url = task.data.get("target_url")
            stress_config = task.data.get("stress_config", {})
            max_load = task.data.get("max_load", 1000)
            
            # Run stress test
            test_results = await self.performance_tester.run_stress_test(
                target_url=target_url,
                stress_config=stress_config,
                max_load=max_load
            )
            
            # Record test
            test_record = {
                "test_type": "stress_test",
                "target_url": target_url,
                "test_id": test_results["test_id"],
                "max_load": max_load,
                "breaking_point": test_results.get("breaking_point"),
                "test_date": datetime.now().isoformat(),
                "results": test_results
            }
            
            self.test_history.append(test_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Stress test completed for {target_url}",
                data={
                    "test_id": test_results["test_id"],
                    "target_url": target_url,
                    "breaking_point": test_results.get("breaking_point"),
                    "max_throughput": test_results.get("max_throughput", 0),
                    "failure_point": test_results.get("failure_point", 0),
                    "recovery_time": test_results.get("recovery_time", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Stress test error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Stress test failed: {str(e)}",
                data={}
            )
    
    async def _run_benchmark(self, task: AgentTask) -> AgentRecommendation:
        """Run performance benchmark"""
        
        try:
            benchmark_config = task.data.get("benchmark_config", {})
            benchmark_type = task.data.get("benchmark_type", "standard")
            
            # Run benchmark
            benchmark_results = await self.performance_tester.run_benchmark(
                benchmark_config=benchmark_config,
                benchmark_type=benchmark_type
            )
            
            # Record benchmark
            benchmark_record = {
                "test_type": "benchmark",
                "benchmark_type": benchmark_type,
                "test_id": benchmark_results["test_id"],
                "benchmark_date": datetime.now().isoformat(),
                "results": benchmark_results
            }
            
            self.test_history.append(benchmark_record)
            
            return AgentRecommendation(
                success=True,
                message=f"Benchmark {benchmark_type} completed",
                data={
                    "test_id": benchmark_results["test_id"],
                    "benchmark_type": benchmark_type,
                    "benchmark_results": benchmark_results,
                    "score": benchmark_results.get("score", 0),
                    "percentile": benchmark_results.get("percentile", 0)
                }
            )
            
        except Exception as e:
            logger.error(f"Benchmark error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Benchmark failed: {str(e)}",
                data={}
            )
    
    async def _analyze_performance(self, task: AgentTask) -> AgentRecommendation:
        """Analyze performance test results"""
        
        try:
            test_id = task.data.get("test_id")
            analysis_config = task.data.get("analysis_config", {})
            
            # Analyze performance
            analysis_results = await self.performance_analyzer.analyze_performance(
                test_id=test_id,
                analysis_config=analysis_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Performance analysis completed",
                data={
                    "test_id": test_id,
                    "analysis_results": analysis_results,
                    "performance_metrics": analysis_results.get("performance_metrics", {}),
                    "bottlenecks": analysis_results.get("bottlenecks", []),
                    "recommendations": analysis_results.get("recommendations", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Performance analysis error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Performance analysis failed: {str(e)}",
                data={}
            )
    
    async def _generate_report(self, task: AgentTask) -> AgentRecommendation:
        """Generate comprehensive performance report"""
        
        try:
            test_ids = task.data.get("test_ids", [])
            report_config = task.data.get("report_config", {})
            report_type = task.data.get("report_type", "comprehensive")
            
            # Generate report
            report_data = await self.performance_tester.generate_report(
                test_ids=test_ids,
                report_config=report_config,
                report_type=report_type
            )
            
            return AgentRecommendation(
                success=True,
                message="Performance report generated",
                data={
                    "report_id": report_data["report_id"],
                    "report_type": report_type,
                    "test_count": len(test_ids),
                    "report_summary": report_data.get("summary", {}),
                    "report_url": report_data.get("report_url"),
                    "generated_at": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Report generation failed: {str(e)}",
                data={}
            )
    
    async def _compare_performance(self, task: AgentTask) -> AgentRecommendation:
        """Compare performance between different versions/configurations"""
        
        try:
            baseline_test_id = task.data.get("baseline_test_id")
            comparison_test_id = task.data.get("comparison_test_id")
            comparison_config = task.data.get("comparison_config", {})
            
            # Compare performance
            comparison_results = await self.performance_analyzer.compare_performance(
                baseline_test_id=baseline_test_id,
                comparison_test_id=comparison_test_id,
                comparison_config=comparison_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Performance comparison completed",
                data={
                    "baseline_test_id": baseline_test_id,
                    "comparison_test_id": comparison_test_id,
                    "comparison_results": comparison_results,
                    "improvement_percentage": comparison_results.get("improvement_percentage", 0),
                    "regression_percentage": comparison_results.get("regression_percentage", 0),
                    "significant_changes": comparison_results.get("significant_changes", [])
                }
            )
            
        except Exception as e:
            logger.error(f"Performance comparison error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Performance comparison failed: {str(e)}",
                data={}
            )
    
    async def _optimize_performance(self, task: AgentTask) -> AgentRecommendation:
        """Optimize performance based on test results"""
        
        try:
            test_id = task.data.get("test_id")
            optimization_config = task.data.get("optimization_config", {})
            
            # Optimize performance
            optimization_results = await self.performance_analyzer.optimize_performance(
                test_id=test_id,
                optimization_config=optimization_config
            )
            
            return AgentRecommendation(
                success=True,
                message="Performance optimization completed",
                data={
                    "test_id": test_id,
                    "optimization_results": optimization_results,
                    "performance_improvements": optimization_results.get("improvements", {}),
                    "optimization_suggestions": optimization_results.get("suggestions", []),
                    "estimated_impact": optimization_results.get("estimated_impact", {})
                }
            )
            
        except Exception as e:
            logger.error(f"Performance optimization error: {e}")
            return AgentRecommendation(
                success=False,
                message=f"Performance optimization failed: {str(e)}",
                data={}
            )
    
    def get_test_history(self) -> List[Dict]:
        """Get performance test history"""
        return self.test_history
    
    def get_test_results(self, test_id: str) -> Optional[Dict]:
        """Get results of a specific test"""
        for record in self.test_history:
            if record["test_id"] == test_id:
                return {
                    "test_id": test_id,
                    "test_type": record["test_type"],
                    "target_url": record.get("target_url"),
                    "test_date": record["test_date"],
                    "results": record["results"]
                }
        return None 