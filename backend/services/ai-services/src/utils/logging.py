"""
Logging utilities for the AI Ops Guardian Angel platform
Centralized logging configuration and helpers
"""

import logging
import sys
from typing import Optional
from datetime import datetime
from pathlib import Path

from ..config.settings import settings


class ColoredFormatter(logging.Formatter):
    """Colored log formatter for console output"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        log_color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{log_color}{record.levelname}{self.RESET}"
        return super().format(record)


def setup_logging():
    """Setup centralized logging configuration"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.log_level.upper()))
    console_formatter = ColoredFormatter(
        '%(asctime)s | %(name)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for all logs
    file_handler = logging.FileHandler(
        log_dir / f"ai_ops_{datetime.now().strftime('%Y%m%d')}.log"
    )
    file_handler.setLevel(logging.DEBUG)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = logging.FileHandler(
        log_dir / f"ai_ops_errors_{datetime.now().strftime('%Y%m%d')}.log"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    root_logger.addHandler(error_handler)
    
    # Agent-specific file handlers
    agent_handler = logging.FileHandler(
        log_dir / f"agents_{datetime.now().strftime('%Y%m%d')}.log"
    )
    agent_handler.setLevel(logging.INFO)
    agent_handler.setFormatter(file_formatter)
    
    # Add filter for agent logs
    agent_handler.addFilter(lambda record: record.name.startswith('agent.'))
    root_logger.addHandler(agent_handler)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name"""
    return logging.getLogger(name)


class AgentLogger:
    """Specialized logger for AI agents with additional context"""
    
    def __init__(self, agent_type: str, agent_id: str):
        self.agent_type = agent_type
        self.agent_id = agent_id
        self.logger = get_logger(f"agent.{agent_type}")
        
    def _format_message(self, message: str, **kwargs) -> str:
        """Format message with agent context"""
        context = f"[{self.agent_type}:{self.agent_id[:8]}]"
        if kwargs:
            context += f" {kwargs}"
        return f"{context} {message}"
    
    def debug(self, message: str, **kwargs):
        self.logger.debug(self._format_message(message, **kwargs))
    
    def info(self, message: str, **kwargs):
        self.logger.info(self._format_message(message, **kwargs))
    
    def warning(self, message: str, **kwargs):
        self.logger.warning(self._format_message(message, **kwargs))
    
    def error(self, message: str, **kwargs):
        self.logger.error(self._format_message(message, **kwargs))
    
    def critical(self, message: str, **kwargs):
        self.logger.critical(self._format_message(message, **kwargs))
    
    def task_started(self, task_id: str, task_type: str):
        self.info(f"Task started", task_id=task_id, task_type=task_type)
    
    def task_completed(self, task_id: str, duration: float):
        self.info(f"Task completed", task_id=task_id, duration=f"{duration:.2f}s")
    
    def task_failed(self, task_id: str, error: str):
        self.error(f"Task failed", task_id=task_id, error=error)
    
    def recommendation_generated(self, recommendation_id: str, confidence: float):
        self.info(f"Recommendation generated", 
                 recommendation_id=recommendation_id, 
                 confidence=f"{confidence:.2f}")


# Initialize logging when module is imported
setup_logging() 