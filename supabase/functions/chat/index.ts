
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.26.0";

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI with API key from environment variable
const groqApiKey = Deno.env.get("GROQ_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API key is available
  if (!groqApiKey) {
    console.error("GROQ API key not found in environment variables");
    return new Response(
      JSON.stringify({ error: "API key configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, model } = await req.json();

    // Validate request data
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Groq client via OpenAI compatibility
    const groq = new OpenAI({
      apiKey: groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    });

    // Choose default model if not specified
    const selectedModel = model || 'llama-3.3-70b-versatile';
    
    console.log(`Processing request with model: ${selectedModel}`);

    // Call the API
    const response = await groq.chat.completions.create({
      model: selectedModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Return the response
    return new Response(
      JSON.stringify(response.choices[0].message),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
