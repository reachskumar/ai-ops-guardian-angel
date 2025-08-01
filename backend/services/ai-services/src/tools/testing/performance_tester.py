"""
Performance Tester Tool
Handles performance testing and load testing
"""

import asyncio
import json
import logging
import uuid
import time
import statistics
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import aiohttp
import asyncio
import random

logger = logging.getLogger(__name__)


class PerformanceTester:
    """
    Advanced performance tester with comprehensive testing capabilities
    """
    
    def __init__(self):
        self.tests_dir = Path("performance_tests")
        self.tests_dir.mkdir(exist_ok=True)
        self.test_history = []
        
    async def run_load_test(
        self,
        target_url: str,
        test_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Run load test against target URL"""
        
        try:
            test_config = test_config or {}
            test_id = str(uuid.uuid4())
            
            # Extract test parameters
            concurrent_users = test_config.get("concurrent_users", 10)
            duration_seconds = test_config.get("duration_seconds", 60)
            requests_per_second = test_config.get("requests_per_second", 5)
            
            logger.info(f"Starting load test for {target_url} with {concurrent_users} users")
            
            # Run load test
            start_time = time.time()
            results = await self._execute_load_test(
                target_url, concurrent_users, duration_seconds, requests_per_second
            )
            end_time = time.time()
            
            # Analyze results
            analysis = await self._analyze_load_test_results(results)
            
            # Generate report
            report = await self._generate_load_test_report(test_id, target_url, results, analysis)
            
            test_results = {
                "test_id": test_id,
                "target_url": target_url,
                "test_config": test_config,
                "start_time": datetime.fromtimestamp(start_time).isoformat(),
                "end_time": datetime.fromtimestamp(end_time).isoformat(),
                "duration": end_time - start_time,
                "results": results,
                "analysis": analysis,
                "report_path": report
            }
            
            # Record test
            self.test_history.append({
                "operation": "load_test",
                "timestamp": datetime.now().isoformat(),
                "test_results": test_results
            })
            
            logger.info(f"Load test completed. Average response time: {analysis.get('avg_response_time', 0):.2f}ms")
            
            return test_results
            
        except Exception as e:
            logger.error(f"Load test failed: {e}")
            raise
    
    async def run_stress_test(
        self,
        target_url: str,
        test_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Run stress test to find breaking point"""
        
        try:
            test_config = test_config or {}
            test_id = str(uuid.uuid4())
            
            # Extract test parameters
            max_users = test_config.get("max_users", 100)
            step_size = test_config.get("step_size", 10)
            step_duration = test_config.get("step_duration", 30)
            error_threshold = test_config.get("error_threshold", 0.05)  # 5%
            
            logger.info(f"Starting stress test for {target_url}")
            
            # Run stress test
            start_time = time.time()
            results = await self._execute_stress_test(
                target_url, max_users, step_size, step_duration, error_threshold
            )
            end_time = time.time()
            
            # Analyze results
            analysis = await self._analyze_stress_test_results(results)
            
            # Generate report
            report = await self._generate_stress_test_report(test_id, target_url, results, analysis)
            
            test_results = {
                "test_id": test_id,
                "target_url": target_url,
                "test_config": test_config,
                "start_time": datetime.fromtimestamp(start_time).isoformat(),
                "end_time": datetime.fromtimestamp(end_time).isoformat(),
                "duration": end_time - start_time,
                "results": results,
                "analysis": analysis,
                "report_path": report
            }
            
            # Record test
            self.test_history.append({
                "operation": "stress_test",
                "timestamp": datetime.now().isoformat(),
                "test_results": test_results
            })
            
            logger.info(f"Stress test completed. Breaking point: {analysis.get('breaking_point', 0)} users")
            
            return test_results
            
        except Exception as e:
            logger.error(f"Stress test failed: {e}")
            raise
    
    async def run_benchmark(
        self,
        target_url: str,
        benchmark_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Run performance benchmark"""
        
        try:
            benchmark_config = benchmark_config or {}
            test_id = str(uuid.uuid4())
            
            # Extract benchmark parameters
            iterations = benchmark_config.get("iterations", 100)
            warmup_iterations = benchmark_config.get("warmup_iterations", 10)
            
            logger.info(f"Starting benchmark for {target_url}")
            
            # Run benchmark
            start_time = time.time()
            results = await self._execute_benchmark(
                target_url, iterations, warmup_iterations
            )
            end_time = time.time()
            
            # Analyze results
            analysis = await self._analyze_benchmark_results(results)
            
            # Generate report
            report = await self._generate_benchmark_report(test_id, target_url, results, analysis)
            
            test_results = {
                "test_id": test_id,
                "target_url": target_url,
                "benchmark_config": benchmark_config,
                "start_time": datetime.fromtimestamp(start_time).isoformat(),
                "end_time": datetime.fromtimestamp(end_time).isoformat(),
                "duration": end_time - start_time,
                "results": results,
                "analysis": analysis,
                "report_path": report
            }
            
            # Record test
            self.test_history.append({
                "operation": "benchmark",
                "timestamp": datetime.now().isoformat(),
                "test_results": test_results
            })
            
            logger.info(f"Benchmark completed. Average response time: {analysis.get('avg_response_time', 0):.2f}ms")
            
            return test_results
            
        except Exception as e:
            logger.error(f"Benchmark failed: {e}")
            raise
    
    async def _execute_load_test(
        self,
        target_url: str,
        concurrent_users: int,
        duration_seconds: int,
        requests_per_second: int
    ) -> List[Dict[str, Any]]:
        """Execute load test"""
        
        results = []
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        async def user_session(user_id: int):
            """Simulate a user session"""
            session_results = []
            
            while time.time() < end_time:
                request_start = time.time()
                
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(target_url) as response:
                            response_time = (time.time() - request_start) * 1000  # Convert to ms
                            
                            session_results.append({
                                "user_id": user_id,
                                "timestamp": time.time(),
                                "response_time": response_time,
                                "status_code": response.status,
                                "success": response.status < 400
                            })
                            
                except Exception as e:
                    session_results.append({
                        "user_id": user_id,
                        "timestamp": time.time(),
                        "response_time": (time.time() - request_start) * 1000,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    })
                
                # Wait between requests
                await asyncio.sleep(1 / requests_per_second)
            
            return session_results
        
        # Create concurrent user sessions
        tasks = [user_session(i) for i in range(concurrent_users)]
        user_results = await asyncio.gather(*tasks)
        
        # Combine all results
        for user_result in user_results:
            results.extend(user_result)
        
        return results
    
    async def _execute_stress_test(
        self,
        target_url: str,
        max_users: int,
        step_size: int,
        step_duration: int,
        error_threshold: float
    ) -> List[Dict[str, Any]]:
        """Execute stress test"""
        
        results = []
        breaking_point = None
        
        for user_count in range(step_size, max_users + 1, step_size):
            logger.info(f"Testing with {user_count} users")
            
            # Run test for this user count
            step_results = await self._execute_load_test(
                target_url, user_count, step_duration, 10
            )
            
            # Calculate error rate
            total_requests = len(step_results)
            failed_requests = len([r for r in step_results if not r.get("success", True)])
            error_rate = failed_requests / total_requests if total_requests > 0 else 0
            
            step_summary = {
                "user_count": user_count,
                "total_requests": total_requests,
                "failed_requests": failed_requests,
                "error_rate": error_rate,
                "avg_response_time": statistics.mean([r.get("response_time", 0) for r in step_results]),
                "max_response_time": max([r.get("response_time", 0) for r in step_results]),
                "min_response_time": min([r.get("response_time", 0) for r in step_results])
            }
            
            results.append(step_summary)
            
            # Check if we've reached breaking point
            if error_rate > error_threshold and breaking_point is None:
                breaking_point = user_count
                logger.info(f"Breaking point reached at {user_count} users")
                break
        
        return results
    
    async def _execute_benchmark(
        self,
        target_url: str,
        iterations: int,
        warmup_iterations: int
    ) -> List[Dict[str, Any]]:
        """Execute benchmark test"""
        
        results = []
        
        # Warmup phase
        logger.info("Running warmup phase")
        for i in range(warmup_iterations):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(target_url) as response:
                        await response.text()
            except Exception:
                pass
        
        # Benchmark phase
        logger.info("Running benchmark phase")
        for i in range(iterations):
            request_start = time.time()
            
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(target_url) as response:
                        response_time = (time.time() - request_start) * 1000
                        
                        results.append({
                            "iteration": i,
                            "response_time": response_time,
                            "status_code": response.status,
                            "success": response.status < 400
                        })
                        
            except Exception as e:
                results.append({
                    "iteration": i,
                    "response_time": (time.time() - request_start) * 1000,
                    "status_code": 0,
                    "success": False,
                    "error": str(e)
                })
        
        return results
    
    async def _analyze_load_test_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze load test results"""
        
        if not results:
            return {}
        
        response_times = [r.get("response_time", 0) for r in results]
        status_codes = [r.get("status_code", 0) for r in results]
        success_count = len([r for r in results if r.get("success", True)])
        
        analysis = {
            "total_requests": len(results),
            "successful_requests": success_count,
            "failed_requests": len(results) - success_count,
            "success_rate": success_count / len(results) if results else 0,
            "avg_response_time": statistics.mean(response_times),
            "median_response_time": statistics.median(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "p95_response_time": self._calculate_percentile(response_times, 95),
            "p99_response_time": self._calculate_percentile(response_times, 99),
            "requests_per_second": len(results) / (max(response_times) - min(response_times)) * 1000 if response_times else 0,
            "status_code_distribution": self._calculate_status_code_distribution(status_codes)
        }
        
        return analysis
    
    async def _analyze_stress_test_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze stress test results"""
        
        if not results:
            return {}
        
        # Find breaking point
        breaking_point = None
        for result in results:
            if result.get("error_rate", 0) > 0.05:  # 5% error threshold
                breaking_point = result.get("user_count")
                break
        
        analysis = {
            "breaking_point": breaking_point,
            "max_users_tested": max([r.get("user_count", 0) for r in results]),
            "total_steps": len(results),
            "performance_degradation": self._calculate_performance_degradation(results),
            "error_rate_progression": [r.get("error_rate", 0) for r in results],
            "response_time_progression": [r.get("avg_response_time", 0) for r in results]
        }
        
        return analysis
    
    async def _analyze_benchmark_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze benchmark results"""
        
        if not results:
            return {}
        
        response_times = [r.get("response_time", 0) for r in results]
        success_count = len([r for r in results if r.get("success", True)])
        
        analysis = {
            "total_iterations": len(results),
            "successful_iterations": success_count,
            "success_rate": success_count / len(results) if results else 0,
            "avg_response_time": statistics.mean(response_times),
            "median_response_time": statistics.median(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "std_deviation": statistics.stdev(response_times) if len(response_times) > 1 else 0,
            "p95_response_time": self._calculate_percentile(response_times, 95),
            "p99_response_time": self._calculate_percentile(response_times, 99)
        }
        
        return analysis
    
    def _calculate_percentile(self, values: List[float], percentile: int) -> float:
        """Calculate percentile of values"""
        if not values:
            return 0
        
        sorted_values = sorted(values)
        index = (percentile / 100) * (len(sorted_values) - 1)
        
        if index.is_integer():
            return sorted_values[int(index)]
        else:
            lower = sorted_values[int(index)]
            upper = sorted_values[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def _calculate_status_code_distribution(self, status_codes: List[int]) -> Dict[str, int]:
        """Calculate status code distribution"""
        distribution = {}
        for code in status_codes:
            distribution[str(code)] = distribution.get(str(code), 0) + 1
        return distribution
    
    def _calculate_performance_degradation(self, results: List[Dict[str, Any]]) -> float:
        """Calculate performance degradation rate"""
        if len(results) < 2:
            return 0
        
        response_times = [r.get("avg_response_time", 0) for r in results]
        if not response_times or response_times[0] == 0:
            return 0
        
        # Calculate degradation rate (increase in response time per user)
        degradation_rate = (response_times[-1] - response_times[0]) / len(results)
        return degradation_rate
    
    async def _generate_load_test_report(
        self,
        test_id: str,
        target_url: str,
        results: List[Dict[str, Any]],
        analysis: Dict[str, Any]
    ) -> str:
        """Generate load test report"""
        
        try:
            report_dir = self.tests_dir / test_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Load Test Report

## Test Details
- **Test ID**: {test_id}
- **Target URL**: {target_url}
- **Test Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Test Results
- **Total Requests**: {analysis.get('total_requests', 0)}
- **Successful Requests**: {analysis.get('successful_requests', 0)}
- **Failed Requests**: {analysis.get('failed_requests', 0)}
- **Success Rate**: {analysis.get('success_rate', 0):.2%}

## Performance Metrics
- **Average Response Time**: {analysis.get('avg_response_time', 0):.2f}ms
- **Median Response Time**: {analysis.get('median_response_time', 0):.2f}ms
- **95th Percentile**: {analysis.get('p95_response_time', 0):.2f}ms
- **99th Percentile**: {analysis.get('p99_response_time', 0):.2f}ms
- **Min Response Time**: {analysis.get('min_response_time', 0):.2f}ms
- **Max Response Time**: {analysis.get('max_response_time', 0):.2f}ms
- **Requests per Second**: {analysis.get('requests_per_second', 0):.2f}

## Status Code Distribution
"""
            
            for status_code, count in analysis.get('status_code_distribution', {}).items():
                report_content += f"- **{status_code}**: {count}\n"
            
            with open(report_dir / "load_test_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate load test report: {e}")
            return ""
    
    async def _generate_stress_test_report(
        self,
        test_id: str,
        target_url: str,
        results: List[Dict[str, Any]],
        analysis: Dict[str, Any]
    ) -> str:
        """Generate stress test report"""
        
        try:
            report_dir = self.tests_dir / test_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Stress Test Report

## Test Details
- **Test ID**: {test_id}
- **Target URL**: {target_url}
- **Test Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Test Results
- **Breaking Point**: {analysis.get('breaking_point', 'Not reached')} users
- **Max Users Tested**: {analysis.get('max_users_tested', 0)}
- **Total Steps**: {analysis.get('total_steps', 0)}

## Performance Analysis
- **Performance Degradation Rate**: {analysis.get('performance_degradation', 0):.2f}ms per user

## Step-by-Step Results
"""
            
            for i, result in enumerate(results):
                report_content += f"""
### Step {i+1}: {result.get('user_count', 0)} Users
- **Total Requests**: {result.get('total_requests', 0)}
- **Failed Requests**: {result.get('failed_requests', 0)}
- **Error Rate**: {result.get('error_rate', 0):.2%}
- **Avg Response Time**: {result.get('avg_response_time', 0):.2f}ms
- **Max Response Time**: {result.get('max_response_time', 0):.2f}ms
"""
            
            with open(report_dir / "stress_test_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate stress test report: {e}")
            return ""
    
    async def _generate_benchmark_report(
        self,
        test_id: str,
        target_url: str,
        results: List[Dict[str, Any]],
        analysis: Dict[str, Any]
    ) -> str:
        """Generate benchmark report"""
        
        try:
            report_dir = self.tests_dir / test_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Benchmark Report

## Test Details
- **Test ID**: {test_id}
- **Target URL**: {target_url}
- **Test Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Test Results
- **Total Iterations**: {analysis.get('total_iterations', 0)}
- **Successful Iterations**: {analysis.get('successful_iterations', 0)}
- **Success Rate**: {analysis.get('success_rate', 0):.2%}

## Performance Metrics
- **Average Response Time**: {analysis.get('avg_response_time', 0):.2f}ms
- **Median Response Time**: {analysis.get('median_response_time', 0):.2f}ms
- **Standard Deviation**: {analysis.get('std_deviation', 0):.2f}ms
- **95th Percentile**: {analysis.get('p95_response_time', 0):.2f}ms
- **99th Percentile**: {analysis.get('p99_response_time', 0):.2f}ms
- **Min Response Time**: {analysis.get('min_response_time', 0):.2f}ms
- **Max Response Time**: {analysis.get('max_response_time', 0):.2f}ms
"""
            
            with open(report_dir / "benchmark_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate benchmark report: {e}")
            return ""
    
    def get_test_history(self) -> List[Dict[str, Any]]:
        """Get test history"""
        return self.test_history 