"""
BaseAgent - Foundation class for all AI agents in the platform
Provides common functionality, interfaces, and patterns
"""

import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import logging

from langchain.agents import AgentExecutor
from langchain.memory import ConversationSummaryBufferMemory
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import BaseTool

from ..config.settings import AgentType, RiskLevel, settings
from ..utils.logging import get_logger
from ..utils.metrics import AgentMetrics


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class AgentTask:
    """Represents a task for an AI agent"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    task_type: str = ""
    description: str = ""
    context: Dict[str, Any] = field(default_factory=dict)
    priority: Priority = Priority.MEDIUM
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentRecommendation:
    """Represents a recommendation from an AI agent"""
    agent_type: AgentType
    title: str
    description: str
    reasoning: str
    confidence: float  # 0.0 - 1.0
    impact: str
    risk_level: RiskLevel
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    estimated_savings: Optional[float] = None
    estimated_duration: Optional[str] = None
    resources_affected: List[str] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    rollback_plan: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentCapabilities:
    """Defines what an agent can do"""
    supported_tasks: List[str]
    required_tools: List[str]
    optional_tools: List[str] = field(default_factory=list)
    max_concurrent_tasks: int = 3
    average_response_time: float = 30.0  # seconds
    success_rate: float = 0.95


class BaseAgent(ABC):
    """
    Base class for all AI agents in the platform.
    Provides common functionality and interfaces.
    """
    
    def __init__(
        self,
        agent_type: AgentType,
        name: str,
        description: str,
        tools: List[BaseTool] = None,
        capabilities: Optional[AgentCapabilities] = None,
        **kwargs
    ):
        self.agent_type = agent_type
        self.name = name
        self.description = description
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now(timezone.utc)
        self.is_active = False
        self.current_tasks: Dict[str, AgentTask] = {}
        self.completed_tasks: List[AgentTask] = []
        self.tools = tools or []
        self.capabilities = capabilities
        self.metrics = AgentMetrics(agent_type.value)
        self.logger = get_logger(f"agent.{agent_type.value}")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model=settings.default_model,
            temperature=settings.temperature,
            max_tokens=settings.max_tokens,
            openai_api_key=settings.openai_api_key
        )
        
        # Initialize memory
        self.memory = ConversationSummaryBufferMemory(
            llm=self.llm,
            max_token_limit=2000,
            return_messages=True
        )
        
        # Agent-specific configuration
        self.config = kwargs
        
        self.logger.info(f"Initialized {self.name} ({self.agent_type.value})")
    
    async def start(self) -> bool:
        """Start the agent"""
        try:
            self.is_active = True
            await self._on_start()
            self.logger.info(f"Agent {self.name} started successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to start agent {self.name}: {str(e)}")
            self.is_active = False
            return False
    
    async def stop(self) -> bool:
        """Stop the agent"""
        try:
            self.is_active = False
            # Cancel all pending tasks
            for task in self.current_tasks.values():
                if task.status == TaskStatus.IN_PROGRESS:
                    task.status = TaskStatus.CANCELLED
                    task.updated_at = datetime.now(timezone.utc)
            
            await self._on_stop()
            self.logger.info(f"Agent {self.name} stopped successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to stop agent {self.name}: {str(e)}")
            return False
    
    async def execute_task(self, task: AgentTask) -> AgentTask:
        """Execute a specific task"""
        if not self.is_active:
            task.status = TaskStatus.FAILED
            task.error = "Agent is not active"
            return task
        
        task.status = TaskStatus.IN_PROGRESS
        task.updated_at = datetime.now(timezone.utc)
        self.current_tasks[task.id] = task
        
        try:
            self.logger.info(f"Executing task {task.id}: {task.description}")
            self.metrics.task_started()
            
            # Execute the task logic
            result = await self._execute_task_logic(task)
            
            # Update task with result
            task.result = result
            task.status = TaskStatus.COMPLETED
            task.updated_at = datetime.now(timezone.utc)
            
            # Move to completed tasks
            self.completed_tasks.append(task)
            del self.current_tasks[task.id]
            
            self.metrics.task_completed()
            self.logger.info(f"Task {task.id} completed successfully")
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            task.updated_at = datetime.now(timezone.utc)
            
            self.metrics.task_failed(str(type(e).__name__))
            self.logger.error(f"Task {task.id} failed: {str(e)}")
        
        return task
    
    async def generate_recommendation(
        self, 
        context: Dict[str, Any],
        task_type: str = "general"
    ) -> AgentRecommendation:
        """Generate a recommendation based on context"""
        try:
            result = await self._generate_recommendation_logic(context, task_type)
            
            recommendation = AgentRecommendation(
                agent_type=self.agent_type,
                title=result.get("title", "General Recommendation"),
                description=result.get("description", ""),
                reasoning=result.get("reasoning", ""),
                confidence=result.get("confidence", 0.5),
                impact=result.get("impact", "medium"),
                risk_level=result.get("risk_level", RiskLevel.MEDIUM),
                estimated_savings=result.get("estimated_savings"),
                estimated_duration=result.get("estimated_duration"),
                resources_affected=result.get("resources_affected", []),
                alternatives=result.get("alternatives", []),
                prerequisites=result.get("prerequisites", []),
                rollback_plan=result.get("rollback_plan")
            )
            
            self.metrics.recommendation_generated(recommendation.confidence)
            return recommendation
            
        except Exception as e:
            self.logger.error(f"Failed to generate recommendation: {str(e)}")
            raise
    
    async def analyze_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze data and return insights"""
        try:
            return await self._analyze_data_logic(data)
        except Exception as e:
            self.logger.error(f"Failed to analyze data: {str(e)}")
            raise
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.agent_type.value,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "current_tasks": len(self.current_tasks),
            "completed_tasks": len(self.completed_tasks),
            "metrics": self.metrics.get_summary(),
            "capabilities": {
                "supported_tasks": self.capabilities.supported_tasks if self.capabilities else [],
                "required_tools": self.capabilities.required_tools if self.capabilities else [],
                "max_concurrent_tasks": self.capabilities.max_concurrent_tasks if self.capabilities else 3
            }
        }
    
    @abstractmethod
    async def _execute_task_logic(self, task: AgentTask) -> Dict[str, Any]:
        """Execute the specific task logic - to be implemented by subclasses"""
        pass
    
    @abstractmethod
    async def _generate_recommendation_logic(
        self, 
        context: Dict[str, Any], 
        task_type: str
    ) -> Dict[str, Any]:
        """Generate recommendation logic - to be implemented by subclasses"""
        pass
    
    @abstractmethod
    async def _analyze_data_logic(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze data logic - to be implemented by subclasses"""
        pass
    
    async def _on_start(self):
        """Hook for agent-specific startup logic"""
        pass
    
    async def _on_stop(self):
        """Hook for agent-specific shutdown logic"""
        pass
    
    def add_tool(self, tool: BaseTool):
        """Add a tool to the agent"""
        self.tools.append(tool)
        self.logger.info(f"Added tool: {tool.name}")
    
    def remove_tool(self, tool_name: str):
        """Remove a tool from the agent"""
        self.tools = [t for t in self.tools if t.name != tool_name]
        self.logger.info(f"Removed tool: {tool_name}")
    
    async def chat(self, message: str, context: Dict[str, Any] = None) -> str:
        """Chat with the agent"""
        try:
            return await self._generate_chat_response(message, context or {})
        except Exception as e:
            self.logger.error(f"Chat failed: {str(e)}")
            return f"I'm sorry, I encountered an error: {str(e)}"
    
    async def _generate_chat_response(self, message: str, context: Dict[str, Any]) -> str:
        """Generate a chat response"""
        # Add message to memory
        self.memory.chat_memory.add_user_message(message)
        
        # Generate response using LLM
        response = await self.llm.ainvoke([
            SystemMessage(content=f"You are {self.name}: {self.description}"),
            HumanMessage(content=message)
        ])
        
        # Add response to memory
        self.memory.chat_memory.add_ai_message(response.content)
        
        return response.content
    
    def __str__(self) -> str:
        return f"{self.name} ({self.agent_type.value})"
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(name='{self.name}', type='{self.agent_type.value}')>" 