
# Voice-Enabled Interview Practice App

## Setup Instructions

### ElevenLabs API Key

To enable the text-to-speech feature, you need to add your ElevenLabs API key to the environment variables:

1. Create a `.env.local` file in the root of the project
2. Add the following line:
   ```
   VITE_ELEVEN_LABS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual ElevenLabs API key
4. Restart the development server

You can get an ElevenLabs API key by signing up at [ElevenLabs](https://elevenlabs.io).

## Features

- AI-powered interview practice
- Text-to-speech using ElevenLabs
- Voice input for natural conversations
- Challenge whiteboard for design exercises

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- Supabase
- ElevenLabs API
