"""
Natural Dialogue Pattern Manager - Makes conversations feel human and natural
Implements conversation patterns, emotional intelligence, and natural flow
"""

import re
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

from langchain_openai import ChatOpenAI


class DialoguePattern(str, Enum):
    """Different dialogue patterns for natural conversation"""
    GREETING = "greeting"
    CONFIRMATION = "confirmation"
    CLARIFICATION = "clarification"
    EXPLANATION = "explanation"
    ACKNOWLEDGMENT = "acknowledgment"
    ENCOURAGEMENT = "encouragement"
    WARNING = "warning"
    SUCCESS_CELEBRATION = "success_celebration"
    ERROR_EMPATHY = "error_empathy"
    FOLLOW_UP = "follow_up"


class ConversationMood(str, Enum):
    """Conversation mood for appropriate responses"""
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    CONCERNED = "concerned"
    URGENT = "urgent"
    CELEBRATORY = "celebratory"
    EDUCATIONAL = "educational"


@dataclass
class DialogueContext:
    """Context for natural dialogue generation"""
    user_emotion: str = "neutral"
    conversation_stage: str = "middle"  # beginning, middle, end
    task_complexity: str = "simple"    # simple, moderate, complex
    user_confidence: str = "medium"    # low, medium, high
    success_rate: float = 1.0          # Recent success rate
    last_interaction_success: bool = True


class NaturalDialogueManager:
    """
    Manages natural dialogue patterns to make conversations feel human
    
    Features:
    - Natural conversation flow
    - Emotional intelligence and empathy
    - Appropriate response timing and pacing
    - Conversation pattern recognition
    - Personality consistency
    - Cultural sensitivity
    """
    
    def __init__(self, openai_client=None):
        self.openai_client = openai_client
        
        # Natural language patterns and templates
        self.dialogue_patterns = {
            DialoguePattern.GREETING: {
                "new_user": [
                    "👋 Welcome to InfraMind! I'm here to help you manage your cloud infrastructure. What would you like to do today?",
                    "Hello! I'm your AI DevOps assistant. I can help with AWS resources, security, costs, and much more. How can I assist you?",
                    "Hi there! Ready to streamline your cloud operations? I'm here to help with everything from EC2 to cost optimization."
                ],
                "returning_user": [
                    "👋 Welcome back! Hope your infrastructure is running smoothly. What can I help you with today?",
                    "Good to see you again! Ready to tackle some cloud management tasks?",
                    "Hello again! I'm here to help with your DevOps needs. What's on your agenda today?"
                ],
                "frequent_user": [
                    "👋 Hey there! You're becoming quite the cloud expert. What shall we work on today?",
                    "Welcome back, cloud champion! What infrastructure challenge can we solve together?",
                    "Hi! Always great to see a regular. What's the mission today?"
                ]
            },
            
            DialoguePattern.CONFIRMATION: {
                "high_risk": [
                    "⚠️ This action will affect production resources. Are you absolutely sure you want to proceed?",
                    "🚨 Just to be clear - this will make changes to live infrastructure. Please confirm you want to continue.",
                    "⚡ This is a significant change. Can you confirm this is what you intended?"
                ],
                "medium_risk": [
                    "Just to confirm - you want me to {action}, correct?",
                    "Let me make sure I understand: you'd like to {action}. Is that right?",
                    "Quick confirmation: proceed with {action}?"
                ],
                "low_risk": [
                    "Got it! I'll {action} for you.",
                    "Perfect! Let me {action} right away.",
                    "On it! I'll {action} now."
                ]
            },
            
            DialoguePattern.CLARIFICATION: {
                "ambiguous_request": [
                    "I want to make sure I get this right. Could you clarify {specific_aspect}?",
                    "I'm on it! Just need to double-check - did you mean {option1} or {option2}?",
                    "Almost there! Could you help me understand {unclear_part} a bit better?"
                ],
                "missing_info": [
                    "I'd love to help with that! I just need {missing_info} to get started.",
                    "Great idea! To do this effectively, could you tell me {missing_info}?",
                    "Perfect! I'll need {missing_info} to make this happen for you."
                ]
            },
            
            DialoguePattern.SUCCESS_CELEBRATION: {
                "major_achievement": [
                    "🎉 Fantastic! That was a significant accomplishment. Your infrastructure is looking great!",
                    "🚀 Excellent work! You've just completed a complex operation successfully.",
                    "⭐ Amazing! That was no small feat - well done!"
                ],
                "routine_success": [
                    "✅ Perfect! All done successfully.",
                    "👍 Great! That went smoothly.",
                    "✨ Excellent! Completed without any issues."
                ],
                "improvement": [
                    "🎯 Nice! Your setup is getting more optimized.",
                    "📈 Great progress! You're really improving your infrastructure.",
                    "⚡ Sweet! That's going to make things run better."
                ]
            },
            
            DialoguePattern.ERROR_EMPATHY: {
                "user_error": [
                    "No worries! These things happen. Let me help you fix this.",
                    "That's totally understandable - this can be tricky. Let's sort it out together.",
                    "Don't sweat it! Everyone runs into this. I'll guide you through the solution."
                ],
                "system_error": [
                    "I apologize for the hiccup! Let me try a different approach.",
                    "Sorry about that issue! The system had a moment. Let me resolve this for you.",
                    "My apologies for the trouble! I'll get this working properly for you."
                ],
                "external_error": [
                    "Looks like AWS is having a moment. These things happen with cloud services!",
                    "The cloud provider seems to be experiencing some issues. Not your fault at all!",
                    "External service hiccup - completely outside our control. Let's try again in a moment."
                ]
            },
            
            DialoguePattern.ENCOURAGEMENT: {
                "learning": [
                    "You're picking this up really well! DevOps can be complex, but you're getting it.",
                    "Great question! That shows you're thinking like a true DevOps engineer.",
                    "You're asking all the right questions. Keep this curiosity up!"
                ],
                "progress": [
                    "Look at you go! Your infrastructure skills are really developing.",
                    "I can see you're getting more comfortable with this. Nice progress!",
                    "You're becoming quite the cloud architect! Impressive growth."
                ]
            }
        }
        
        # Conversation flow patterns
        self.flow_patterns = {
            "task_completion": [
                "Done! {summary}",
                "What would you like to do next?",
                "Any other infrastructure tasks I can help with?"
            ],
            "error_recovery": [
                "Let me try that again with a different approach.",
                "How about we tackle this step by step?",
                "I have a few ideas to make this work. Want to try another method?"
            ],
            "learning_moment": [
                "Here's a quick tip that might help:",
                "Pro tip from my experience:",
                "Something that might be useful to know:"
            ]
        }
        
        # Personality traits for consistency
        self.personality_traits = {
            "helpful": True,
            "patient": True,
            "encouraging": True,
            "professional_but_friendly": True,
            "detail_oriented": True,
            "safety_conscious": True
        }
        
        # Emotional intelligence keywords
        self.emotion_keywords = {
            "frustrated": ["frustrated", "annoying", "broken", "not working", "hate", "terrible"],
            "excited": ["awesome", "great", "fantastic", "love", "amazing", "perfect"],
            "confused": ["confused", "don't understand", "unclear", "what does", "how do"],
            "urgent": ["urgent", "asap", "quickly", "emergency", "critical", "production down"],
            "grateful": ["thank you", "thanks", "appreciate", "helpful", "grateful"]
        }

    def enhance_response_with_natural_dialogue(
        self, 
        message: str, 
        agent_response: str, 
        dialogue_context: DialogueContext,
        conversation_history: List[Dict[str, Any]] = None
    ) -> str:
        """
        Enhance agent response with natural dialogue patterns
        """
        try:
            # Detect user emotion and conversation context
            user_emotion = self._detect_user_emotion(message)
            conversation_stage = self._determine_conversation_stage(conversation_history or [])
            
            # Update dialogue context
            dialogue_context.user_emotion = user_emotion
            dialogue_context.conversation_stage = conversation_stage
            
            # Apply natural dialogue enhancement
            enhanced_response = self._apply_dialogue_patterns(
                message, agent_response, dialogue_context
            )
            
            # Add conversational flow elements
            enhanced_response = self._add_conversational_flow(
                enhanced_response, dialogue_context, conversation_history
            )
            
            # Apply personality and tone consistency
            enhanced_response = self._apply_personality_consistency(
                enhanced_response, dialogue_context
            )
            
            return enhanced_response
            
        except Exception as e:
            print(f"Error in natural dialogue enhancement: {e}")
            return agent_response  # Fallback to original

    def _detect_user_emotion(self, message: str) -> str:
        """Detect user emotion from message content"""
        message_lower = message.lower()
        
        for emotion, keywords in self.emotion_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return emotion
        
        # Check for question words (indicates curiosity/learning)
        question_words = ["how", "what", "why", "when", "where", "which"]
        if any(word in message_lower for word in question_words):
            return "curious"
        
        # Check for imperative mood (indicates task-focused)
        imperative_words = ["create", "delete", "start", "stop", "show", "list"]
        if any(word in message_lower for word in imperative_words):
            return "task_focused"
        
        return "neutral"

    def _determine_conversation_stage(self, conversation_history: List[Dict[str, Any]]) -> str:
        """Determine what stage of conversation we're in"""
        if not conversation_history:
            return "beginning"
        elif len(conversation_history) < 3:
            return "beginning"
        elif len(conversation_history) < 10:
            return "middle"
        else:
            return "ongoing"

    def _apply_dialogue_patterns(
        self, 
        message: str, 
        agent_response: str, 
        dialogue_context: DialogueContext
    ) -> str:
        """Apply appropriate dialogue patterns based on context"""
        
        enhanced_response = agent_response
        
        # Add appropriate opening based on emotion and context
        if dialogue_context.user_emotion == "frustrated":
            opening = random.choice(self.dialogue_patterns[DialoguePattern.ERROR_EMPATHY]["user_error"])
            enhanced_response = f"{opening}\n\n{enhanced_response}"
        
        elif dialogue_context.user_emotion == "excited":
            opening = "🎉 I love your enthusiasm! "
            enhanced_response = f"{opening}{enhanced_response}"
        
        elif dialogue_context.user_emotion == "confused":
            opening = "No problem! Let me break this down for you. "
            enhanced_response = f"{opening}{enhanced_response}"
        
        elif dialogue_context.user_emotion == "grateful":
            opening = "You're very welcome! I'm here to help. "
            enhanced_response = f"{opening}{enhanced_response}"
        
        # Add success celebration for positive outcomes
        if self._is_successful_response(agent_response):
            if dialogue_context.task_complexity == "complex":
                celebration = random.choice(self.dialogue_patterns[DialoguePattern.SUCCESS_CELEBRATION]["major_achievement"])
            else:
                celebration = random.choice(self.dialogue_patterns[DialoguePattern.SUCCESS_CELEBRATION]["routine_success"])
            
            enhanced_response = f"{enhanced_response}\n\n{celebration}"
        
        return enhanced_response

    def _add_conversational_flow(
        self, 
        response: str, 
        dialogue_context: DialogueContext,
        conversation_history: List[Dict[str, Any]]
    ) -> str:
        """Add natural conversational flow elements"""
        
        enhanced_response = response
        
        # Add follow-up questions or suggestions
        if dialogue_context.conversation_stage == "beginning":
            if dialogue_context.user_emotion == "curious":
                enhanced_response += "\n\n💡 **What would you like to explore?** I can help with EC2, S3, security scans, cost analysis, and much more!"
        
        elif dialogue_context.conversation_stage == "middle":
            # Add contextual next steps
            if "ec2" in response.lower():
                enhanced_response += "\n\n**💭 What's next?** Would you like to set up monitoring, configure security groups, or check costs for these instances?"
            elif "cost" in response.lower():
                enhanced_response += "\n\n**💭 Optimization ideas:** Want me to suggest ways to reduce these costs or set up budget alerts?"
            elif "security" in response.lower():
                enhanced_response += "\n\n**💭 Security tip:** Consider running a compliance scan or setting up continuous monitoring for these resources."
        
        # Add learning moments for educational context
        if dialogue_context.user_emotion == "curious" and dialogue_context.conversation_stage != "beginning":
            learning_tip = self._get_contextual_learning_tip(response)
            if learning_tip:
                enhanced_response += f"\n\n📚 **Learn more:** {learning_tip}"
        
        return enhanced_response

    def _apply_personality_consistency(self, response: str, dialogue_context: DialogueContext) -> str:
        """Apply consistent personality traits to response"""
        
        # Ensure helpful tone
        if self.personality_traits["helpful"]:
            if not any(phrase in response.lower() for phrase in ["let me", "i'll", "i can", "happy to"]):
                if "?" in response:
                    response = response.replace("?", "? I'm happy to help with that!")
        
        # Add safety consciousness for risky operations
        if self.personality_traits["safety_conscious"]:
            risky_operations = ["delete", "terminate", "remove", "destroy"]
            if any(op in response.lower() for op in risky_operations):
                if "⚠️" not in response and "🚨" not in response:
                    response += "\n\n⚠️ **Safety reminder:** Always double-check before making changes to production resources!"
        
        # Ensure encouraging tone for learning contexts
        if self.personality_traits["encouraging"] and dialogue_context.user_emotion == "confused":
            encouragement = random.choice(self.dialogue_patterns[DialoguePattern.ENCOURAGEMENT]["learning"])
            response += f"\n\n{encouragement}"
        
        return response

    def _is_successful_response(self, response: str) -> bool:
        """Determine if response indicates successful operation"""
        success_indicators = ["✅", "success", "completed", "done", "created", "configured", "deployed"]
        return any(indicator in response.lower() for indicator in success_indicators)

    def _get_contextual_learning_tip(self, response: str) -> Optional[str]:
        """Get relevant learning tip based on response content"""
        
        learning_tips = {
            "ec2": "EC2 instances can be scheduled to start/stop automatically to save costs during off-hours.",
            "s3": "S3 storage classes can significantly reduce costs - consider moving older data to Glacier.",
            "security": "AWS Config can help you maintain security compliance by monitoring configuration changes.",
            "cost": "Setting up billing alerts helps you stay within budget and avoid surprise charges.",
            "vpc": "VPC Flow Logs are great for troubleshooting network connectivity issues.",
            "rds": "RDS automated backups are free up to the size of your database storage.",
            "iam": "Always follow the principle of least privilege when setting up IAM permissions."
        }
        
        for service, tip in learning_tips.items():
            if service in response.lower():
                return tip
        
        return None

    def generate_conversational_greeting(self, user_context: Dict[str, Any]) -> str:
        """Generate natural conversational greeting based on user context"""
        
        session_count = user_context.get("session_count", 0)
        last_agent_used = user_context.get("last_agent_used", "")
        
        if session_count == 0:
            greeting_type = "new_user"
        elif session_count < 5:
            greeting_type = "returning_user"
        else:
            greeting_type = "frequent_user"
        
        base_greeting = random.choice(self.dialogue_patterns[DialoguePattern.GREETING][greeting_type])
        
        # Add contextual elements
        if last_agent_used and session_count > 1:
            service = last_agent_used.split('_')[0]
            base_greeting += f" I see you were working with {service.upper()} last time - need to continue with that or try something new?"
        
        return base_greeting

    def handle_conversation_repair(self, error_context: Dict[str, Any]) -> str:
        """Handle conversation repair when things go wrong"""
        
        error_type = error_context.get("type", "unknown")
        user_emotion = error_context.get("user_emotion", "neutral")
        
        if error_type == "misunderstanding":
            return "I think I might have misunderstood what you're looking for. Could you help me understand better? I want to make sure I give you exactly what you need."
        
        elif error_type == "technical_failure":
            if user_emotion == "frustrated":
                return "I completely understand your frustration! Technical hiccups are the worst. Let me try a different approach that should work better."
            else:
                return "Apologies for the technical issue! I'm working on an alternative solution for you right now."
        
        elif error_type == "ambiguous_request":
            return "I want to help you with this, but I'm seeing a few ways to interpret what you need. Could you give me a bit more detail so I can get it right the first time?"
        
        else:
            return "Something didn't go as planned there. Let me regroup and try a better approach for you."

    def add_natural_transitions(self, responses: List[str]) -> List[str]:
        """Add natural transitions between multiple responses"""
        
        if len(responses) <= 1:
            return responses
        
        transitions = [
            "Also, ",
            "Additionally, ",
            "By the way, ",
            "One more thing - ",
            "While we're at it, ",
            "Speaking of which, "
        ]
        
        enhanced_responses = [responses[0]]  # First response stays as-is
        
        for i, response in enumerate(responses[1:], 1):
            if i < len(transitions):
                transition = transitions[i-1]
                enhanced_responses.append(f"{transition}{response}")
            else:
                enhanced_responses.append(response)
        
        return enhanced_responses

    def get_conversation_summary_with_personality(self, conversation_history: List[Dict[str, Any]]) -> str:
        """Generate a personality-consistent conversation summary"""
        
        if not conversation_history:
            return "We haven't started chatting yet, but I'm ready to help with all your DevOps needs!"
        
        # Count different types of interactions
        task_types = {}
        for msg in conversation_history:
            agent_type = msg.get("agent_type", "general")
            service = agent_type.split('_')[0]
            task_types[service] = task_types.get(service, 0) + 1
        
        if len(task_types) == 1:
            service = list(task_types.keys())[0]
            return f"We've been diving deep into {service.upper()} management today! You're really getting the hang of it."
        
        elif len(task_types) <= 3:
            services = ", ".join(task_types.keys())
            return f"Nice variety today! We've covered {services}. You're becoming quite the multi-service expert!"
        
        else:
            return f"Wow, what a productive session! You've explored {len(task_types)} different services. Your infrastructure knowledge is really expanding!"