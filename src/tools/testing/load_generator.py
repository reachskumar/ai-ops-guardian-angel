"""
Load Generator Tool
Handles load generation for performance testing
"""

import asyncio
import json
import logging
import uuid
import time
import random
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import aiohttp

logger = logging.getLogger(__name__)


class LoadGenerator:
    """
    Advanced load generator with comprehensive load generation capabilities
    """
    
    def __init__(self):
        self.load_dir = Path("load_generation")
        self.load_dir.mkdir(exist_ok=True)
        self.load_history = []
        
    async def generate_load(
        self,
        target_url: str,
        load_config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Generate load against target URL"""
        
        try:
            load_config = load_config or {}
            load_id = str(uuid.uuid4())
            
            # Extract load parameters
            concurrent_users = load_config.get("concurrent_users", 10)
            duration_seconds = load_config.get("duration_seconds", 60)
            requests_per_second = load_config.get("requests_per_second", 5)
            load_pattern = load_config.get("load_pattern", "constant")
            
            logger.info(f"Starting load generation for {target_url}")
            
            # Generate load based on pattern
            if load_pattern == "constant":
                results = await self._generate_constant_load(
                    target_url, concurrent_users, duration_seconds, requests_per_second
                )
            elif load_pattern == "ramp":
                results = await self._generate_ramp_load(
                    target_url, concurrent_users, duration_seconds, requests_per_second
                )
            elif load_pattern == "spike":
                results = await self._generate_spike_load(
                    target_url, concurrent_users, duration_seconds, requests_per_second
                )
            else:
                results = await self._generate_constant_load(
                    target_url, concurrent_users, duration_seconds, requests_per_second
                )
            
            # Analyze load results
            analysis = await self._analyze_load_results(results)
            
            # Generate load report
            report = await self._generate_load_report(load_id, target_url, results, analysis)
            
            load_results = {
                "load_id": load_id,
                "target_url": target_url,
                "load_config": load_config,
                "start_time": datetime.now().isoformat(),
                "results": results,
                "analysis": analysis,
                "report_path": report
            }
            
            # Record load generation
            self.load_history.append({
                "operation": "generate_load",
                "timestamp": datetime.now().isoformat(),
                "load_results": load_results
            })
            
            logger.info(f"Load generation completed. Total requests: {len(results)}")
            
            return load_results
            
        except Exception as e:
            logger.error(f"Load generation failed: {e}")
            raise
    
    async def _generate_constant_load(
        self,
        target_url: str,
        concurrent_users: int,
        duration_seconds: int,
        requests_per_second: int
    ) -> List[Dict[str, Any]]:
        """Generate constant load"""
        
        results = []
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        async def user_session(user_id: int):
            """Simulate a user session with constant load"""
            session_results = []
            
            while time.time() < end_time:
                request_start = time.time()
                
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(target_url) as response:
                            response_time = (time.time() - request_start) * 1000
                            
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
    
    async def _generate_ramp_load(
        self,
        target_url: str,
        concurrent_users: int,
        duration_seconds: int,
        requests_per_second: int
    ) -> List[Dict[str, Any]]:
        """Generate ramp-up load"""
        
        results = []
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        # Ramp up users over time
        ramp_duration = duration_seconds * 0.3  # 30% of time for ramp-up
        ramp_step = ramp_duration / concurrent_users
        
        current_users = 0
        current_time = start_time
        
        while current_time < end_time:
            # Add users gradually
            if current_users < concurrent_users and current_time < start_time + ramp_duration:
                current_users = min(concurrent_users, int((current_time - start_time) / ramp_step))
            
            # Generate requests for current users
            if current_users > 0:
                user_results = await self._generate_requests_for_users(
                    target_url, current_users, requests_per_second, 1
                )
                results.extend(user_results)
            
            current_time += 1
            await asyncio.sleep(1)
        
        return results
    
    async def _generate_spike_load(
        self,
        target_url: str,
        concurrent_users: int,
        duration_seconds: int,
        requests_per_second: int
    ) -> List[Dict[str, Any]]:
        """Generate spike load"""
        
        results = []
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        # Generate spike pattern
        spike_interval = duration_seconds / 3  # 3 spikes during the test
        
        current_time = start_time
        
        while current_time < end_time:
            # Calculate spike intensity
            time_in_cycle = (current_time - start_time) % spike_interval
            spike_intensity = 1.0
            
            if time_in_cycle < spike_interval * 0.1:  # First 10% of cycle
                spike_intensity = 3.0  # 3x normal load
            elif time_in_cycle < spike_interval * 0.2:  # Next 10% of cycle
                spike_intensity = 2.0  # 2x normal load
            
            # Generate requests with spike intensity
            current_requests_per_second = int(requests_per_second * spike_intensity)
            current_concurrent_users = int(concurrent_users * spike_intensity)
            
            user_results = await self._generate_requests_for_users(
                target_url, current_concurrent_users, current_requests_per_second, 1
            )
            results.extend(user_results)
            
            current_time += 1
            await asyncio.sleep(1)
        
        return results
    
    async def _generate_requests_for_users(
        self,
        target_url: str,
        user_count: int,
        requests_per_second: int,
        duration_seconds: int
    ) -> List[Dict[str, Any]]:
        """Generate requests for a specific number of users"""
        
        results = []
        
        async def single_user_requests(user_id: int):
            user_results = []
            for _ in range(requests_per_second * duration_seconds):
                request_start = time.time()
                
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(target_url) as response:
                            response_time = (time.time() - request_start) * 1000
                            
                            user_results.append({
                                "user_id": user_id,
                                "timestamp": time.time(),
                                "response_time": response_time,
                                "status_code": response.status,
                                "success": response.status < 400
                            })
                            
                except Exception as e:
                    user_results.append({
                        "user_id": user_id,
                        "timestamp": time.time(),
                        "response_time": (time.time() - request_start) * 1000,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    })
                
                await asyncio.sleep(1 / requests_per_second)
            
            return user_results
        
        # Create concurrent user sessions
        tasks = [single_user_requests(i) for i in range(user_count)]
        user_results = await asyncio.gather(*tasks)
        
        # Combine all results
        for user_result in user_results:
            results.extend(user_result)
        
        return results
    
    async def _analyze_load_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze load generation results"""
        
        if not results:
            return {}
        
        # Calculate metrics
        response_times = [r.get("response_time", 0) for r in results]
        status_codes = [r.get("status_code", 0) for r in results]
        success_count = len([r for r in results if r.get("success", True)])
        
        analysis = {
            "total_requests": len(results),
            "successful_requests": success_count,
            "failed_requests": len(results) - success_count,
            "success_rate": success_count / len(results) if results else 0,
            "avg_response_time": sum(response_times) / len(response_times) if response_times else 0,
            "min_response_time": min(response_times) if response_times else 0,
            "max_response_time": max(response_times) if response_times else 0,
            "requests_per_second": len(results) / (max(response_times) - min(response_times)) * 1000 if len(response_times) > 1 else 0,
            "status_code_distribution": self._calculate_status_code_distribution(status_codes)
        }
        
        return analysis
    
    def _calculate_status_code_distribution(self, status_codes: List[int]) -> Dict[str, int]:
        """Calculate status code distribution"""
        distribution = {}
        for code in status_codes:
            distribution[str(code)] = distribution.get(str(code), 0) + 1
        return distribution
    
    async def _generate_load_report(
        self,
        load_id: str,
        target_url: str,
        results: List[Dict[str, Any]],
        analysis: Dict[str, Any]
    ) -> str:
        """Generate load generation report"""
        
        try:
            report_dir = self.load_dir / load_id
            report_dir.mkdir(exist_ok=True)
            
            # Create report content
            report_content = f"""
# Load Generation Report

## Load Details
- **Load ID**: {load_id}
- **Target URL**: {target_url}
- **Generation Date**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Load Results
- **Total Requests**: {analysis.get('total_requests', 0)}
- **Successful Requests**: {analysis.get('successful_requests', 0)}
- **Failed Requests**: {analysis.get('failed_requests', 0)}
- **Success Rate**: {analysis.get('success_rate', 0):.2%}

## Performance Metrics
- **Average Response Time**: {analysis.get('avg_response_time', 0):.2f}ms
- **Min Response Time**: {analysis.get('min_response_time', 0):.2f}ms
- **Max Response Time**: {analysis.get('max_response_time', 0):.2f}ms
- **Requests per Second**: {analysis.get('requests_per_second', 0):.2f}

## Status Code Distribution
"""
            
            for status_code, count in analysis.get('status_code_distribution', {}).items():
                report_content += f"- **{status_code}**: {count}\n"
            
            with open(report_dir / "load_report.md", "w") as f:
                f.write(report_content)
            
            return str(report_dir)
            
        except Exception as e:
            logger.error(f"Failed to generate load report: {e}")
            return ""
    
    def get_load_history(self) -> List[Dict[str, Any]]:
        """Get load generation history"""
        return self.load_history 