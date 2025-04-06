
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

## Troubleshooting Voice Features

If you encounter issues with the voice features:

1. Make sure your ElevenLabs API key is correct and has sufficient credits
2. Check that your browser allows autoplay of audio (click anywhere on the page if prompted)
3. Try using a different voice if a specific voice isn't working
4. Check the browser console for detailed error messages

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
