"""
Shared logging utilities for all backend services
"""

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path

from ..config.settings import settings


class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "extra_fields"):
            log_entry.update(record.extra_fields)
        
        return json.dumps(log_entry)


class StructuredLogger:
    """Structured logger with additional context"""
    
    def __init__(self, name: str, service_name: str = None):
        self.logger = logging.getLogger(name)
        self.service_name = service_name or settings.SERVICE_NAME
        
        # Set log level
        self.logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
        
        # Add handler if none exists
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(JSONFormatter())
            self.logger.addHandler(handler)
    
    def _log_with_context(self, level: str, message: str, **kwargs):
        """Log with additional context"""
        extra_fields = {
            "service": self.service_name,
            "environment": settings.ENVIRONMENT.value,
            **kwargs
        }
        
        # Create a custom log record with extra fields
        record = self.logger.makeRecord(
            self.logger.name,
            getattr(logging, level.upper()),
            "",
            0,
            message,
            (),
            None
        )
        record.extra_fields = extra_fields
        
        self.logger.handle(record)
    
    def info(self, message: str, **kwargs):
        """Log info message with context"""
        self._log_with_context("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with context"""
        self._log_with_context("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message with context"""
        self._log_with_context("ERROR", message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log debug message with context"""
        self._log_with_context("DEBUG", message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message with context"""
        self._log_with_context("CRITICAL", message, **kwargs)


def setup_logging(
    service_name: str,
    log_level: str = None,
    log_file: Optional[str] = None
) -> StructuredLogger:
    """Setup logging for a service"""
    
    # Create logs directory if it doesn't exist
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create structured logger
    logger = StructuredLogger(service_name, service_name)
    
    # Add file handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(JSONFormatter())
        logger.logger.addHandler(file_handler)
    
    return logger


def log_request(request_id: str, method: str, path: str, status_code: int, duration: float, **kwargs):
    """Log HTTP request details"""
    logger = StructuredLogger("http")
    logger.info(
        "HTTP Request",
        request_id=request_id,
        method=method,
        path=path,
        status_code=status_code,
        duration=duration,
        **kwargs
    )


def log_ai_operation(
    operation: str,
    agent_type: str,
    user_id: str,
    success: bool,
    duration: float,
    **kwargs
):
    """Log AI operation details"""
    logger = StructuredLogger("ai")
    logger.info(
        "AI Operation",
        operation=operation,
        agent_type=agent_type,
        user_id=user_id,
        success=success,
        duration=duration,
        **kwargs
    )


def log_security_event(
    event_type: str,
    severity: str,
    user_id: str = None,
    ip_address: str = None,
    **kwargs
):
    """Log security events"""
    logger = StructuredLogger("security")
    logger.warning(
        "Security Event",
        event_type=event_type,
        severity=severity,
        user_id=user_id,
        ip_address=ip_address,
        **kwargs
    )


def log_performance_metric(
    metric_name: str,
    value: float,
    unit: str,
    service: str,
    **kwargs
):
    """Log performance metrics"""
    logger = StructuredLogger("performance")
    logger.info(
        "Performance Metric",
        metric_name=metric_name,
        value=value,
        unit=unit,
        service=service,
        **kwargs
    )


# Global logger instance
logger = StructuredLogger("inframind") 