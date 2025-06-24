import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      apiKey, 
      model = 'google/gemini-2.0-flash-exp:free',
      messages,
      tools,
      tool_choice = 'auto',
      response_format,
      temperature = 0.9,
      max_tokens = 8000
    } = body;

    // Add a delay for free models to avoid rate limiting
    if (model.endsWith(':free')) {
      console.log('Free model detected, waiting 21 seconds');
      await new Promise(resolve => setTimeout(resolve, 21000));
    }

    console.log('Received model', model)
    console.log('Received tools', tools)
    console.log('Received tool_choice', tool_choice)
    console.log('Received response_format', response_format)
    console.log('Received temperature', temperature)
    console.log('Received max_tokens', max_tokens)

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
        'HTTP-Referer': 'https://prompt3d.co',
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