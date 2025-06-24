import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      apiKey, 
      model = 'google/gemma-3-27b-it:free',
      messages,
      tools,
      tool_choice = 'auto',
      response_format,
      temperature = 0.1,
      max_tokens = 4000
    } = body;

    // Validate required fields
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' }, 
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' }, 
        { status: 400 }
      );
    }

    // Initialize OpenAI client with OpenRouter
    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://prompt3d.com',
        'X-Title': 'C3D - AI CAD Assistant',
      },
    });

    // Make the API call to OpenRouter
    const completion = await openai.chat.completions.create({
      model,
      messages,
      tools: tools || undefined,
      tool_choice: tools && tools.length > 0 ? tool_choice : undefined,
      response_format: response_format || undefined,
      temperature,
      max_tokens,
    });

    // Return the completion response
    return NextResponse.json(completion);

  } catch (error) {
    console.error('OpenRouter API error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenRouter API key.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('insufficient')) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please check your OpenRouter account.' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

// Test endpoint for API key validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' }, 
        { status: 400 }
      );
    }

    // Test API key by checking credits endpoint
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://prompt3d.com',
        'X-Title': 'C3D - AI CAD Assistant',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid API key');
    }

    const creditsData = await response.json();
    return NextResponse.json({ 
      valid: true, 
      credits: creditsData.data 
    });

  } catch (error) {
    console.error('API key test error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
} 