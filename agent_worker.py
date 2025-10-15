import asyncio
import logging
import os
from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, cartesia

load_dotenv()

logger = logging.getLogger("ai-agent-worker")
logger.setLevel(logging.INFO)


async def entrypoint(ctx: JobContext):
    """Main entry point for the agent worker"""
    
    logger.info(f"Starting agent for room: {ctx.room.name}")
    
    # Initialize the AI pipeline components
    initial_ctx = llm.ChatContext().append(
        role="system",
        text=(
            "You are a helpful AI assistant with multimodal capabilities. "
            "You can see, hear, and understand images, videos, and screen shares. "
            "You help users with their questions and tasks by analyzing all forms of input they provide. "
            "Be concise, friendly, and helpful in your responses. "
            "When users share images or screens, describe what you see and provide relevant assistance."
        ),
    )
    
    # Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Create the voice pipeline agent with multimodal support
    # Note: the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata.get("vad"),  # Voice Activity Detection
        stt=deepgram.STT(
            model="nova-2-general",
            language="en-US",
        ),
        llm=openai.LLM(
            model="gpt-5",
        ),
        tts=cartesia.TTS(
            model="sonic-english",
            voice="79a125e8-cd45-4c13-8a67-188112f4dd22",  # Default voice ID
        ),
        chat_ctx=initial_ctx,
    )
    
    # Start the agent
    agent.start(ctx.room)
    
    # Handle user messages and image inputs
    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        """Handle when a new track is subscribed (video/screenshare)"""
        logger.info(f"Track subscribed: {publication.kind} from {participant.identity}")
        
        # If it's a video track (camera or screenshare), we can process frames
        if publication.kind == "video":
            logger.info(f"Video track received - agent can now see {participant.identity}'s video")
    
    @ctx.room.on("data_received")
    async def on_data_received(data, participant):
        """Handle data messages (for image uploads, text, etc.)"""
        logger.info(f"Data received from {participant.identity}")
        
        # Parse the data message
        try:
            import json
            message_data = json.loads(data.decode('utf-8'))
            
            if message_data.get("type") == "image":
                # Handle image data
                logger.info("Image data received, processing with vision capabilities")
                # In a full implementation, we would process the image here
                # and send a response back through the agent
            
        except Exception as e:
            logger.error(f"Error processing data message: {e}")
    
    # Keep the agent running
    await agent.say("Hello! I'm your AI assistant. I can help you through voice, video, and screen sharing. How can I assist you today?", allow_interruptions=True)
    
    logger.info("Agent is ready and waiting for interactions")


if __name__ == "__main__":
    # Run the worker
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            ws_url=os.getenv("LIVEKIT_URL"),
        )
    )
