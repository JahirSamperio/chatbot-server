// import OpenAI from 'openai';
import OpenAI from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configura la API de OpenAI
export const client = new OpenAI({
    apiKey: process.env.API_KEY,
});

