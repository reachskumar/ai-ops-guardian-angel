#!/usr/bin/env python3
"""
Session Memory Manager
Handles conversation context, user preferences, and intelligent suggestions
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict

class SessionManager:
    """Manages user sessions, conversation context, and preferences"""
    
    def __init__(self):
        self.sessions = {}
        self.user_preferences = defaultdict(dict)
        self.conversation_history = defaultdict(list)
        self.context_memory = defaultdict(dict)
        
    def get_or_create_session(self, user_id: str, session_id: str = None) -> Dict[str, Any]:
        """Get existing session or create new one"""
        
        if session_id is None:
            session_id = f"session_{user_id}_{int(datetime.now().timestamp())}"
        
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "session_id": session_id,
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                "last_activity": datetime.now().isoformat(),
                "message_count": 0,
                "context": {
                    "recent_agents_used": [],
                    "recent_topics": [],
                    "current_workflow": None,
                    "pending_approvals": [],
                    "favorite_agents": [],
                    "context_summary": ""
                },
                "preferences": self.user_preferences[user_id].copy()
            }
        
        # Update last activity
        self.sessions[session_id]["last_activity"] = datetime.now().isoformat()
        
        return self.sessions[session_id]
    
    def add_conversation_entry(self, session_id: str, user_message: str, 
                              agent_response: Dict[str, Any]) -> None:
        """Add a conversation entry to memory"""
        
        session = self.sessions.get(session_id)
        if not session:
            return
        
        # Create conversation entry
        entry = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_message,
            "agent_response": {
                "message": agent_response.get("message", ""),
                "agent": agent_response.get("agent_used", ""),
                "intent": agent_response.get("intent", ""),
                "confidence": agent_response.get("confidence", 0),
                "real_execution": agent_response.get("real_execution", False),
                "data_summary": self._summarize_data(agent_response.get("data", {}))
            }
        }
        
        # Add to conversation history
        self.conversation_history[session_id].append(entry)
        
        # Keep only last 50 messages per session
        if len(self.conversation_history[session_id]) > 50:
            self.conversation_history[session_id] = self.conversation_history[session_id][-50:]
        
        # Update session context
        self._update_session_context(session_id, entry)
        
        # Update message count
        session["message_count"] += 1
    
    def _summarize_data(self, data: Dict[str, Any]) -> str:
        """Create a brief summary of response data"""
        if not data:
            return ""
        
        summary_parts = []
        
        # Look for key metrics
        if "total_monthly_cost" in data:
            summary_parts.append(f"Cost: ${data['total_monthly_cost']}")
        if "vulnerabilities_found" in data:
            summary_parts.append(f"Vulnerabilities: {data['vulnerabilities_found']}")
        if "overall_health" in data:
            summary_parts.append(f"Health: {data['overall_health']}%")
        if "anomalies_detected" in data:
            summary_parts.append(f"Anomalies: {data['anomalies_detected']}")
        if "training_progress" in data:
            summary_parts.append(f"Training: {data['training_progress']}%")
        
        return "; ".join(summary_parts) if summary_parts else "Data processed"
    
    def _update_session_context(self, session_id: str, entry: Dict[str, Any]) -> None:
        """Update session context based on conversation entry"""
        
        session = self.sessions[session_id]
        context = session["context"]
        agent_response = entry["agent_response"]
        
        # Track recent agents used
        if agent_response["agent"]:
            recent_agents = context["recent_agents_used"]
            if agent_response["agent"] not in recent_agents:
                recent_agents.append(agent_response["agent"])
            if len(recent_agents) > 10:
                context["recent_agents_used"] = recent_agents[-10:]
        
        # Track recent topics/intents
        if agent_response["intent"]:
            recent_topics = context["recent_topics"]
            if agent_response["intent"] not in recent_topics:
                recent_topics.append(agent_response["intent"])
            if len(recent_topics) > 15:
                context["recent_topics"] = recent_topics[-15:]
        
        # Update favorite agents based on usage
        self._update_favorite_agents(session_id, agent_response["agent"])
        
        # Generate context summary
        context["context_summary"] = self._generate_context_summary(session_id)
    
    def _update_favorite_agents(self, session_id: str, agent_name: str) -> None:
        """Update user's favorite agents based on usage patterns"""
        
        if not agent_name:
            return
        
        session = self.sessions[session_id]
        user_id = session["user_id"]
        
        # Count agent usage
        if "agent_usage_count" not in self.user_preferences[user_id]:
            self.user_preferences[user_id]["agent_usage_count"] = defaultdict(int)
        
        self.user_preferences[user_id]["agent_usage_count"][agent_name] += 1
        
        # Update favorites (top 5 most used)
        usage_counts = self.user_preferences[user_id]["agent_usage_count"]
        favorites = sorted(usage_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        session["context"]["favorite_agents"] = [agent for agent, _ in favorites]
    
    def _generate_context_summary(self, session_id: str) -> str:
        """Generate a brief context summary for the session"""
        
        history = self.conversation_history[session_id]
        if not history:
            return ""
        
        recent_messages = history[-5:]  # Last 5 messages
        
        # Extract key themes
        agents_used = set()
        topics = set()
        
        for entry in recent_messages:
            agent = entry["agent_response"]["agent"]
            intent = entry["agent_response"]["intent"]
            
            if agent:
                agents_used.add(agent)
            if intent:
                topics.add(intent.replace("_", " "))
        
        summary_parts = []
        
        if agents_used:
            summary_parts.append(f"Recent agents: {', '.join(list(agents_used)[:3])}")
        
        if topics:
            summary_parts.append(f"Topics: {', '.join(list(topics)[:3])}")
        
        return "; ".join(summary_parts)
    
    def get_contextual_suggestions(self, session_id: str, current_intent: str = None) -> List[str]:
        """Get intelligent suggestions based on session context"""
        
        session = self.sessions.get(session_id)
        if not session:
            return self._get_default_suggestions()
        
        context = session["context"]
        suggestions = []
        
        # Suggestions based on recent topics
        recent_topics = context.get("recent_topics", [])
        
        # Cross-topic suggestions
        topic_suggestions = {
            "cost_analysis": [
                "Run security scan to validate cost optimizations",
                "Check infrastructure health after changes",
                "Set up monitoring for cost tracking"
            ],
            "security_scan": [
                "Analyze cost impact of security fixes",
                "Review compliance status",
                "Check infrastructure performance"
            ],
            "infrastructure": [
                "Optimize costs based on usage patterns",
                "Run security assessment",
                "Set up performance monitoring"
            ],
            "model_training": [
                "Monitor model performance",
                "Check training costs",
                "Set up model deployment pipeline"
            ],
            "anomaly_detection": [
                "Investigate infrastructure health",
                "Check security alerts",
                "Review system performance"
            ]
        }
        
        # Add suggestions based on current or recent topics
        current_topic = current_intent or (recent_topics[-1] if recent_topics else None)
        if current_topic in topic_suggestions:
            suggestions.extend(topic_suggestions[current_topic])
        
        # Add workflow suggestions
        if len(recent_topics) >= 2:
            suggestions.extend([
                "Start cost optimization pipeline",
                "Begin security hardening workflow",
                "Initialize comprehensive audit"
            ])
        
        # Add favorite agent suggestions
        favorite_agents = context.get("favorite_agents", [])
        if favorite_agents:
            suggestions.append(f"Quick access to {favorite_agents[0]}")
        
        # Remove duplicates and limit
        suggestions = list(dict.fromkeys(suggestions))[:6]
        
        return suggestions if suggestions else self._get_default_suggestions()
    
    def _get_default_suggestions(self) -> List[str]:
        """Get default suggestions when no context is available"""
        return [
            "Analyze cloud costs and optimizations",
            "Run comprehensive security scan",
            "Check infrastructure health status",
            "Start cost optimization pipeline",
            "Monitor system performance",
            "Review recent deployments"
        ]
    
    def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get conversation history for a session"""
        
        history = self.conversation_history.get(session_id, [])
        return history[-limit:] if history else []
    
    def clear_session_history(self, session_id: str) -> bool:
        """Clear conversation history for a session"""
        
        if session_id in self.conversation_history:
            self.conversation_history[session_id] = []
            
            # Reset session context but keep preferences
            if session_id in self.sessions:
                self.sessions[session_id]["context"] = {
                    "recent_agents_used": [],
                    "recent_topics": [],
                    "current_workflow": None,
                    "pending_approvals": [],
                    "favorite_agents": self.sessions[session_id]["context"].get("favorite_agents", []),
                    "context_summary": ""
                }
                self.sessions[session_id]["message_count"] = 0
            
            return True
        
        return False
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights about user behavior and preferences"""
        
        user_sessions = [s for s in self.sessions.values() if s["user_id"] == user_id]
        
        if not user_sessions:
            return {"message": "No user data available"}
        
        # Calculate statistics
        total_messages = sum(s["message_count"] for s in user_sessions)
        total_sessions = len(user_sessions)
        
        # Get most used agents
        preferences = self.user_preferences[user_id]
        agent_usage = preferences.get("agent_usage_count", {})
        top_agents = sorted(agent_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get recent activity
        latest_session = max(user_sessions, key=lambda s: s["last_activity"])
        
        return {
            "user_id": user_id,
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "avg_messages_per_session": round(total_messages / total_sessions, 1) if total_sessions > 0 else 0,
            "top_agents": [{"agent": agent, "usage_count": count} for agent, count in top_agents],
            "latest_activity": latest_session["last_activity"],
            "favorite_topics": latest_session["context"].get("recent_topics", [])[-5:],
            "context_summary": latest_session["context"].get("context_summary", "")
        }
    
    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> None:
        """Update user preferences"""
        
        self.user_preferences[user_id].update(preferences)
        
        # Update all active sessions for this user
        for session in self.sessions.values():
            if session["user_id"] == user_id:
                session["preferences"].update(preferences)
    
    def cleanup_old_sessions(self, hours: int = 24) -> int:
        """Clean up sessions older than specified hours"""
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        old_sessions = []
        
        for session_id, session in self.sessions.items():
            last_activity = datetime.fromisoformat(session["last_activity"])
            if last_activity < cutoff_time:
                old_sessions.append(session_id)
        
        # Remove old sessions
        for session_id in old_sessions:
            del self.sessions[session_id]
            if session_id in self.conversation_history:
                del self.conversation_history[session_id]
        
        return len(old_sessions) 