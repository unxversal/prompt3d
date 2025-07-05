import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Resource } from 'sst';

// Types for message content blocks
interface ContentBlock {
  type: string;
  [key: string]: unknown;
}

interface Message {
  role: string;
  content: ContentBlock[] | string;
  [key: string]: unknown;
}

// Function to remove thinking blocks from messages when thinking is disabled
function filterThinkingBlocks(messages: Message[]): Message[] {
  return messages.map((message) => {
    // Only process messages with array content
    if (!Array.isArray(message.content)) {
      return message;
    }

    // Filter out thinking and redacted_thinking blocks
    const filteredContent = message.content.filter((block: ContentBlock) => 
      block.type !== 'thinking' && block.type !== 'redacted_thinking'
    );

    // If filtering removed all content, keep the original message to avoid empty messages
    if (filteredContent.length === 0 && message.content.length > 0) {
      console.warn('Filtering thinking blocks would result in empty message content, keeping original');
      return message;
    }

    return {
      ...message,
      content: filteredContent
    };
  }).filter((message) => {
    // Remove messages that would be completely empty after filtering
    if (Array.isArray(message.content)) {
      return message.content.length > 0;
    }
    return true; // Keep string content messages
  });
}

// Function to ensure thinking blocks are properly ordered when thinking is enabled
function ensureThinkingBlockOrder(messages: Message[]): Message[] {
  return messages.map((message) => {
    // Only process assistant messages with array content
    if (message.role !== 'assistant' || !Array.isArray(message.content)) {
      return message;
    }

    // Check if this message has tool_use blocks
    const hasToolUse = message.content.some((block: ContentBlock) => block.type === 'tool_use');
    
    if (!hasToolUse) {
      return message;
    }

    // Check if message already starts with thinking block
    const startsWithThinking = message.content[0]?.type === 'thinking' || message.content[0]?.type === 'redacted_thinking';
    
    if (startsWithThinking) {
      return message;
    }

    // Find thinking blocks and non-thinking blocks
    const thinkingBlocks = message.content.filter((block: ContentBlock) => 
      block.type === 'thinking' || block.type === 'redacted_thinking'
    );
    
    const nonThinkingBlocks = message.content.filter((block: ContentBlock) => 
      block.type !== 'thinking' && block.type !== 'redacted_thinking'
    );

    // If we have thinking blocks, move them to the front
    if (thinkingBlocks.length > 0) {
      return {
        ...message,
        content: [...thinkingBlocks, ...nonThinkingBlocks]
      };
    }

    // CRITICAL FIX: If no thinking blocks found but tool_use blocks exist,
    // return null to filter out this message entirely when thinking is enabled
    return null;
  }).filter(message => message !== null); // Remove null messages
}

// Main function to process messages based on thinking state
function processMessagesForThinking(messages: Message[], isThinkingEnabled: boolean, isClaudeModel: boolean): Message[] {
  if (!isClaudeModel) {
    // For non-Claude models, always filter out thinking blocks
    return filterThinkingBlocks(messages);
  }

  if (isThinkingEnabled) {
    // For Claude models with thinking enabled, ensure proper ordering
    return ensureThinkingBlockOrder(messages);
  } else {
    // For Claude models with thinking disabled, filter out thinking blocks
    return filterThinkingBlocks(messages);
  }
}

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

    console.log('Received model', model)
    console.log('Received baseUrl', baseUrl)
    console.log('Received useToolCalling', useToolCalling)
    console.log('Received tools', tools)
    console.log('Received tool_choice', tool_choice)
    console.log('Received response_format', response_format)

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

    // Check if this is a Claude model for thinking support
    const isClaudeModel = model.toLowerCase().includes('claude');
    
    // Determine if thinking will be enabled for this request
    const willUseThinking = isClaudeModel && (useToolCalling && tools && tools.length > 0);
    
    // Process messages based on thinking state
    const processedMessages = processMessagesForThinking(messages, willUseThinking, isClaudeModel);
    
    // Log thinking state for debugging
    if (isClaudeModel) {
      console.log(`Claude model detected. Thinking enabled: ${willUseThinking}`);
      const originalMessageCount = messages.length;
      const processedMessageCount = processedMessages.length;
      if (originalMessageCount !== processedMessageCount) {
        console.log(`Message count changed from ${originalMessageCount} to ${processedMessageCount} after processing`);
      }
    }
    
    // Prepare request parameters based on output mode
    const baseParams = {
      model,
      messages: processedMessages,
      temperature,
      max_tokens,
    };
    
    // Adjust temperature for Claude models with thinking enabled
    const adjustedBaseParams = {
      ...baseParams,
      ...(isClaudeModel && willUseThinking && { temperature: 1 }),
    };

    // Add tools or response_format based on useToolCalling preference
    if (useToolCalling && tools && tools.length > 0) {
      const paramsWithTools = {
        ...adjustedBaseParams,
        tools,
        tool_choice,
        ...(isClaudeModel && willUseThinking && { thinking: { type: "enabled", budget_tokens: 10000 } }),
      };
      // console.log('Request params with tools:', paramsWithTools);
      console.log('Request params with tools:');
      const completion = await openai.chat.completions.create(paramsWithTools);
      console.log('Completion:', completion);
      return NextResponse.json(completion);
    } else if (!useToolCalling && response_format) {
      const paramsWithFormat = {
        ...adjustedBaseParams,
        response_format,
        ...(isClaudeModel && willUseThinking && { thinking: { type: "enabled", budget_tokens: 10000 } }),
      };
      // console.log('Request params with response format:', paramsWithFormat);
      console.log('Request params with response format:');
      const completion = await openai.chat.completions.create(paramsWithFormat);
      console.log('Completion:', completion);
      return NextResponse.json(completion);
    } else {
      const basicParams = {
        ...adjustedBaseParams,
        ...(isClaudeModel && willUseThinking && { thinking: { type: "enabled", budget_tokens: 10000 } }),
      };
      // console.log('Request params basic:', basicParams);
      console.log('Request params basic:');
      const completion = await openai.chat.completions.create(basicParams);
      console.log('Completion:', completion);
      return NextResponse.json(completion);
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