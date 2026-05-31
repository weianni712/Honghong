import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt, scenarioTitle, characterName } = await request.json();

    if (!messages || !systemPrompt) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建带有角色设定的对话
    const fullSystemPrompt = `${systemPrompt}

当前场景：${scenarioTitle}
对方角色：${characterName}

重要规则：
1. 你扮演生气的一方，要根据用户的回复来判断情绪变化
2. 如果用户回复能让对方消气，逐渐降低愤怒度
3. 如果用户回复不当，对方会更生气
4. 当对方基本消气时（愤怒值低于20），给出结束信号：<SUCCESS>
5. 回复要自然，符合角色性格，2-3句话即可
6. 可以用一些表情符号增加生动感
7. 每条回复都要评估用户的沟通方式，给予适当反馈`;

    const conversationMessages = [
      { role: 'system' as const, content: fullSystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // 使用流式输出
    const stream = client.stream(conversationMessages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
    });

    // 构建SSE响应
    const encoder = new TextEncoder();
    const stream2 = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          
          // 检查是否成功
          const isSuccess = fullContent.includes('<SUCCESS>');
          const cleanContent = fullContent.replace('<SUCCESS>', '').trim();
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: cleanContent, 
            isSuccess,
            isFinal: true 
          })}\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream2, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('LLM API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
