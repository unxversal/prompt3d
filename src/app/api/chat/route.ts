import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resource } from 'sst';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { apiKey } = body;
    const { 
      model = 'google/gemini-2.0-flash-exp:free',
      messages,
      tools,
      tool_choice = 'auto',
      response_format,
      stream = false,
      temperature = 0.9,
      max_tokens = 8000,
      baseUrl = 'https://openrouter.ai/api/v1',
      useToolCalling = true
    } = body;

    // Add a delay for free models to avoid rate limiting
    if (model.endsWith(':free')) {
      console.log('Free model detected, waiting 21 seconds');
      await new Promise(resolve => setTimeout(resolve, 21000));
    }

    const isAnthropic = baseUrl.includes('anthropic.com');
    if (isAnthropic && apiKey === Resource.BypassPassword.value) {
        apiKey = Resource.AnthropicApiKey.value;
    }

    console.log('Received model', model);
    console.log('Received baseUrl', baseUrl);
    console.log('Received useToolCalling', useToolCalling);
    console.log('Received tools', tools?.length || 0, 'tools');
    console.log('Received tool_choice', tool_choice);
    console.log('Received response_format', response_format);
    console.log('Received stream', stream);

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

    // Determine if this is OpenRouter based on URL
    const isOpenRouter = baseUrl.includes('openrouter.ai');
    
    // Set up headers - only include OpenRouter-specific headers for OpenRouter
    const defaultHeaders: Record<string, string> = {};
    if (isOpenRouter) {
      defaultHeaders['HTTP-Referer'] = 'https://prompt3d.co';
      defaultHeaders['X-Title'] = 'C3D - AI CAD Assistant';
    }

    // Initialize OpenAI client with the specified base URL
    const openai = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
      defaultHeaders,
    });

    // Prepare base request parameters
    const baseParams = {
      model,
      messages,
      temperature,
      max_tokens,
      stream,
    };

    // Add tools or response_format based on useToolCalling preference
    if (useToolCalling && tools && tools.length > 0) {
      const paramsWithTools = {
        ...baseParams,
        tools,
        tool_choice,
      };
      console.log('📤 Making request with tools:', tools.length);
      console.log('🔧 Tool calling mode: ON');
      const completion = await openai.chat.completions.create(paramsWithTools);
      console.log('Completion:', completion);
      
      // Handle streaming response
      if (stream) {
        // For tool calling mode, streaming is not supported in this implementation
        console.warn('⚠️  Streaming not supported in tool calling mode');
        return NextResponse.json(completion);
      }
      
      return NextResponse.json(completion);
    } else if (response_format) {
      const paramsWithFormat = {
        ...baseParams,
        response_format,
      };
      console.log('📤 Making request with JSON response format');
      console.log('🔧 Tool calling mode: OFF, using JSON schema');
      console.log('🔧 Streaming enabled:', stream);
      
      // Handle streaming vs non-streaming differently
      if (stream) {
        console.log('📡 Creating streaming request...');
        const streamingCompletion = await openai.chat.completions.create(paramsWithFormat);
        
        // Create a ReadableStream from the OpenAI streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              // The completion is already an AsyncIterable when stream=true
              for await (const chunk of streamingCompletion as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  // Send in SSE format
                  const data = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
                  controller.enqueue(encoder.encode(data));
                }
              }
              
              // Send final message
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('Streaming error:', error);
              controller.error(error);
            }
          },
        });
        
        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const completion = await openai.chat.completions.create(paramsWithFormat);
        console.log('Completion received:', completion);
        return NextResponse.json(completion);
      }
    } else {
      console.log('📤 Making basic request without tools or response format');
      console.log('🔧 Tool calling mode: OFF, no JSON schema provided');
      
      // Handle streaming vs non-streaming differently
      if (stream) {
        console.log('📡 Creating streaming request...');
        const streamingCompletion = await openai.chat.completions.create(baseParams);
        
        // Create a ReadableStream from the OpenAI streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              // The completion is already an AsyncIterable when stream=true
              for await (const chunk of streamingCompletion as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  // Send in SSE format
                  const data = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
                  controller.enqueue(encoder.encode(data));
                }
              }
              
              // Send final message
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('Streaming error:', error);
              controller.error(error);
            }
          },
        });
        
        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const completion = await openai.chat.completions.create(baseParams);
        return NextResponse.json(completion);
      }
    }

  } catch (error) {
    console.error('API error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your API key.' },
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
          { error: 'Insufficient credits. Please check your account.' },
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