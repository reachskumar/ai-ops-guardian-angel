"""
Context-Aware Response Manager - Intelligent conversation context and memory management
Provides natural, context-aware responses based on conversation history and user context
"""

import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationSummaryBufferMemory
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


class UserExpertiseLevel(str, Enum):
    """User expertise levels for response adaptation"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate" 
    ADVANCED = "advanced"
    EXPERT = "expert"


class ConversationTone(str, Enum):
    """Tone for responses"""
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    TECHNICAL = "technical"
    CONVERSATIONAL = "conversational"


@dataclass
class UserContext:
    """User context information for personalized responses"""
    user_id: str
    expertise_level: UserExpertiseLevel = UserExpertiseLevel.INTERMEDIATE
    preferred_tone: ConversationTone = ConversationTone.FRIENDLY
    infrastructure_context: Dict[str, Any] = field(default_factory=dict)
    interaction_history: List[Dict[str, Any]] = field(default_factory=list)
    preferences: Dict[str, Any] = field(default_factory=dict)
    last_active: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    session_count: int = 0
    favorite_services: List[str] = field(default_factory=list)
    common_regions: List[str] = field(default_factory=list)
    business_context: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConversationContext:
    """Context for ongoing conversation"""
    session_id: str
    user_id: str
    messages: List[Dict[str, Any]] = field(default_factory=list)
    current_topic: Optional[str] = None
    entities_mentioned: Dict[str, Any] = field(default_factory=dict)
    workflow_context: Dict[str, Any] = field(default_factory=dict)
    last_agent_used: Optional[str] = None
    conversation_summary: str = ""
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    last_interaction: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    turn_count: int = 0


class ContextAwareResponseManager:
    """
    Manages conversation context and generates context-aware responses
    
    Features:
    - User profiling and expertise adaptation
    - Conversation memory and history
    - Entity tracking across conversations
    - Personalized response generation
    - Infrastructure context awareness
    - Business context integration
    """
    
    def __init__(self, openai_client=None):
        self.openai_client = openai_client
        self.user_contexts: Dict[str, UserContext] = {}
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # Response templates by expertise level
        self.response_templates = {
            UserExpertiseLevel.BEGINNER: {
                "explanation_style": "step-by-step with explanations",
                "technical_depth": "basic",
                "include_warnings": True,
                "include_next_steps": True
            },
            UserExpertiseLevel.INTERMEDIATE: {
                "explanation_style": "balanced detail with context",
                "technical_depth": "moderate", 
                "include_warnings": True,
                "include_alternatives": True
            },
            UserExpertiseLevel.ADVANCED: {
                "explanation_style": "technical with best practices",
                "technical_depth": "detailed",
                "include_warnings": False,
                "include_optimizations": True
            },
            UserExpertiseLevel.EXPERT: {
                "explanation_style": "concise technical",
                "technical_depth": "minimal",
                "include_warnings": False,
                "include_raw_data": True
            }
        }

    async def generate_context_aware_response(
        self, 
        message: str, 
        agent_response: str, 
        user_id: str, 
        session_id: str,
        agent_type: str = None,
        additional_context: Dict[str, Any] = None
    ) -> str:
        """
        Generate context-aware response based on user context and conversation history
        """
        try:
            # Get or create user context
            user_context = self._get_or_create_user_context(user_id)
            
            # Get or create conversation context
            conv_context = self._get_or_create_conversation_context(session_id, user_id)
            
            # Update contexts with current interaction
            self._update_contexts(message, agent_response, user_context, conv_context, agent_type)
            
            # Generate context-aware response
            enhanced_response = await self._enhance_response_with_context(
                message, agent_response, user_context, conv_context, additional_context
            )
            
            return enhanced_response
            
        except Exception as e:
            print(f"Error generating context-aware response: {e}")
            return agent_response  # Fallback to original response

    def _get_or_create_user_context(self, user_id: str) -> UserContext:
        """Get existing user context or create new one"""
        if user_id not in self.user_contexts:
            self.user_contexts[user_id] = UserContext(user_id=user_id)
        
        context = self.user_contexts[user_id]
        context.last_active = datetime.now(timezone.utc)
        return context

    def _get_or_create_conversation_context(self, session_id: str, user_id: str) -> ConversationContext:
        """Get existing conversation context or create new one"""
        if session_id not in self.conversation_contexts:
            self.conversation_contexts[session_id] = ConversationContext(
                session_id=session_id, 
                user_id=user_id
            )
        
        context = self.conversation_contexts[session_id]
        context.last_interaction = datetime.now(timezone.utc)
        context.turn_count += 1
        return context

    def _update_contexts(
        self, 
        message: str, 
        agent_response: str, 
        user_context: UserContext, 
        conv_context: ConversationContext,
        agent_type: str = None
    ):
        """Update user and conversation contexts with current interaction"""
        
        # Update conversation context
        conv_context.messages.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_message": message,
            "agent_response": agent_response,
            "agent_type": agent_type
        })
        
        if agent_type:
            conv_context.last_agent_used = agent_type
        
        # Extract and update entities
        entities = self._extract_entities_from_message(message)
        conv_context.entities_mentioned.update(entities)
        
        # Update user context
        user_context.interaction_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "session_id": conv_context.session_id,
            "message": message,
            "agent_type": agent_type
        })
        
        # Keep only last 50 interactions to prevent memory bloat
        if len(user_context.interaction_history) > 50:
            user_context.interaction_history = user_context.interaction_history[-50:]
        
        # Update user preferences based on usage patterns
        self._update_user_preferences(user_context, message, agent_type)

    def _extract_entities_from_message(self, message: str) -> Dict[str, Any]:
        """Extract entities (regions, services, etc.) from user message"""
        entities = {}
        message_lower = message.lower()
        
        # AWS regions
        regions = [
            'us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 
            'ap-south-1', 'ap-southeast-1', 'ap-northeast-1'
        ]
        for region in regions:
            if region in message_lower:
                entities['region'] = region
                break
        
        # Instance types
        instance_patterns = ['t3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'c5.large']
        for instance_type in instance_patterns:
            if instance_type in message_lower:
                entities['instance_type'] = instance_type
                break
        
        # Services
        services = ['ec2', 's3', 'rds', 'cloudwatch', 'lambda', 'iam', 'vpc']
        for service in services:
            if service in message_lower:
                if 'services' not in entities:
                    entities['services'] = []
                entities['services'].append(service)
        
        return entities

    def _update_user_preferences(self, user_context: UserContext, message: str, agent_type: str):
        """Update user preferences based on usage patterns"""
        
        # Track frequently used services
        if agent_type:
            service = agent_type.split('_')[0]  # e.g., 'ec2' from 'ec2_provisioning'
            if service not in user_context.favorite_services:
                user_context.favorite_services.append(service)
            elif len(user_context.favorite_services) > 5:
                user_context.favorite_services = user_context.favorite_services[-5:]
        
        # Extract and track common regions
        entities = self._extract_entities_from_message(message)
        if 'region' in entities:
            region = entities['region']
            if region not in user_context.common_regions:
                user_context.common_regions.append(region)
            elif len(user_context.common_regions) > 3:
                user_context.common_regions = user_context.common_regions[-3:]
        
        # Detect expertise level based on language complexity
        technical_terms = ['iam', 'vpc', 'subnet', 'cidr', 'ami', 'autoscaling', 'cloudformation']
        technical_count = sum(1 for term in technical_terms if term in message.lower())
        
        if technical_count >= 3 and user_context.expertise_level == UserExpertiseLevel.BEGINNER:
            user_context.expertise_level = UserExpertiseLevel.INTERMEDIATE
        elif technical_count >= 5 and user_context.expertise_level == UserExpertiseLevel.INTERMEDIATE:
            user_context.expertise_level = UserExpertiseLevel.ADVANCED

    async def _enhance_response_with_context(
        self, 
        message: str, 
        agent_response: str, 
        user_context: UserContext, 
        conv_context: ConversationContext,
        additional_context: Dict[str, Any] = None
    ) -> str:
        """Enhance agent response with context-aware improvements"""
        
        try:
            if not self.openai_client:
                return self._apply_basic_context_enhancement(agent_response, user_context, conv_context)
            
            # Get conversation history summary
            recent_messages = conv_context.messages[-5:] if len(conv_context.messages) > 5 else conv_context.messages
            conversation_history = "\n".join([
                f"User: {msg['user_message']}\nAgent: {msg['agent_response'][:100]}..."
                for msg in recent_messages
            ])
            
            # Build context-aware enhancement prompt
            enhancement_prompt = f"""
Enhance this DevOps assistant response to be more context-aware and personalized.

User Profile:
- Expertise Level: {user_context.expertise_level}
- Preferred Tone: {user_context.preferred_tone}
- Favorite Services: {', '.join(user_context.favorite_services) if user_context.favorite_services else 'None yet'}
- Common Regions: {', '.join(user_context.common_regions) if user_context.common_regions else 'None yet'}
- Session Turn: {conv_context.turn_count}

Recent Conversation:
{conversation_history}

Current Message: "{message}"
Original Agent Response: "{agent_response}"

Enhancement Guidelines:
1. Adapt technical depth to user expertise level ({user_context.expertise_level})
2. Reference previous interactions when relevant
3. Use user's preferred regions/services when making suggestions
4. Add personalized recommendations based on usage patterns
5. Include appropriate next steps for expertise level
6. Maintain {user_context.preferred_tone} tone

Enhanced Response (maintain all factual information, just improve presentation):
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a context-aware DevOps assistant that personalizes responses based on user context."},
                    {"role": "user", "content": enhancement_prompt}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            enhanced_response = response.choices[0].message.content.strip()
            
            # Add personalized recommendations if appropriate
            enhanced_response = self._add_personalized_recommendations(
                enhanced_response, user_context, conv_context
            )
            
            return enhanced_response
            
        except Exception as e:
            print(f"Error in AI response enhancement: {e}")
            return self._apply_basic_context_enhancement(agent_response, user_context, conv_context)

    def _apply_basic_context_enhancement(
        self, 
        agent_response: str, 
        user_context: UserContext, 
        conv_context: ConversationContext
    ) -> str:
        """Apply basic context enhancement without AI"""
        
        enhanced_response = agent_response
        
        # Add personalized greeting for new sessions
        if conv_context.turn_count == 1:
            if user_context.session_count > 0:
                enhanced_response = f"👋 Welcome back! {enhanced_response}"
            else:
                enhanced_response = f"👋 Welcome to InfraMind! {enhanced_response}"
        
        # Add region suggestions based on user history
        if user_context.common_regions and "region" in agent_response.lower():
            common_region = user_context.common_regions[-1]  # Most recent
            enhanced_response += f"\n\n💡 **Suggestion:** You often use `{common_region}` region. Would you like to use it for this operation?"
        
        # Add service-specific tips for beginners
        if user_context.expertise_level == UserExpertiseLevel.BEGINNER:
            if "ec2" in agent_response.lower():
                enhanced_response += f"\n\n📚 **Tip:** EC2 instances are virtual servers in the cloud. Start with t3.micro for testing!"
            elif "s3" in agent_response.lower():
                enhanced_response += f"\n\n📚 **Tip:** S3 buckets store files in the cloud. Remember bucket names must be globally unique!"
        
        return enhanced_response

    def _add_personalized_recommendations(
        self, 
        response: str, 
        user_context: UserContext, 
        conv_context: ConversationContext
    ) -> str:
        """Add personalized recommendations based on user context"""
        
        recommendations = []
        
        # Recommend cost optimization if user frequently uses expensive services
        if 'ec2' in user_context.favorite_services and conv_context.turn_count > 5:
            recommendations.append("💰 Consider running a cost analysis to optimize your EC2 spending")
        
        # Recommend security scan for production environments
        if user_context.expertise_level in [UserExpertiseLevel.ADVANCED, UserExpertiseLevel.EXPERT]:
            if any(keyword in response.lower() for keyword in ['production', 'live', 'prod']):
                recommendations.append("🔒 Don't forget to run a security scan on production resources")
        
        # Recommend monitoring setup
        if 'monitoring' not in user_context.favorite_services and len(user_context.favorite_services) > 2:
            recommendations.append("📊 Consider setting up monitoring for your resources")
        
        if recommendations:
            response += f"\n\n**💡 Personalized Recommendations:**\n" + \
                       "\n".join([f"• {rec}" for rec in recommendations])
        
        return response

    def get_conversation_summary(self, session_id: str) -> str:
        """Get summary of conversation for context"""
        if session_id not in self.conversation_contexts:
            return "New conversation"
        
        context = self.conversation_contexts[session_id]
        
        if not context.messages:
            return "No messages yet"
        
        recent_topics = []
        for msg in context.messages[-3:]:  # Last 3 interactions
            if msg.get('agent_type'):
                topic = msg['agent_type'].replace('_', ' ').title()
                if topic not in recent_topics:
                    recent_topics.append(topic)
        
        return f"Discussion topics: {', '.join(recent_topics)}" if recent_topics else "General conversation"

    def clear_old_contexts(self, max_age_hours: int = 24):
        """Clear old conversation contexts to free memory"""
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
        
        # Clear old conversation contexts
        expired_sessions = [
            session_id for session_id, context in self.conversation_contexts.items()
            if context.last_interaction < cutoff_time
        ]
        
        for session_id in expired_sessions:
            del self.conversation_contexts[session_id]
        
        print(f"Cleared {len(expired_sessions)} expired conversation contexts")

    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics for dashboard/analytics"""
        if user_id not in self.user_contexts:
            return {"error": "User not found"}
        
        context = self.user_contexts[user_id]
        
        return {
            "expertise_level": context.expertise_level,
            "total_interactions": len(context.interaction_history),
            "favorite_services": context.favorite_services,
            "common_regions": context.common_regions,
            "last_active": context.last_active.isoformat(),
            "session_count": context.session_count
        }