import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages, scenarioTitle, turns, characterName, userMessages } = await request.json();

    if (!scenarioTitle) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建复盘提示
    const userDialogues = userMessages || (messages ? messages.filter((m: { role: string }) => m.role === 'user').map((m: { content: string }) => m.content).join('\n') : '用户完成了对话练习');

    const systemPrompt = `你是一个专业的人际沟通教练，擅长分析对话并给出改进建议。

请根据以下对话记录，为用户进行复盘：

场景：${scenarioTitle}
对方角色：${characterName}
对话轮数：${turns}

用户的对话：
${userDialogues}

请从以下几个维度进行分析：
1. strengths: 用户做得好的地方（3点）
2. improvements: 用户可以改进的地方（3点）
3. suggestions: 下次遇到类似情况的可执行话术建议（2-3句）
4. score: 0-100的情商评分
5. scoreLevel: low(0-40), medium(41-70), high(71-100)

请用JSON格式输出，示例：
{
  "strengths": ["能够表达理解", "道歉态度诚恳", "提供了解决方案"],
  "improvements": ["可以更具体地道歉", "倾听对方感受", "避免找借口"],
  "suggestions": ["下次可以先说：'我完全理解你的感受'，然后具体道歉", "可以说：'我明白你为什么生气，如果是我也会不开心'"],
  "score": 75,
  "scoreLevel": "high"
}`;

    const response = await client.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请分析这段对话并给出复盘建议' },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.7,
    });

    // 解析JSON响应
    let reviewData;
    try {
      // 尝试提取JSON
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reviewData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // 如果解析失败，使用默认数据
      reviewData = {
        strengths: ['表达了一定的理解和歉意'],
        improvements: ['可以更加具体和真诚'],
        suggestions: ['下次遇到类似情况，可以先共情，再道歉，最后给出解决方案'],
        score: 60,
        scoreLevel: 'medium',
      };
    }

    return NextResponse.json(reviewData);
  } catch (error) {
    console.error('Review API Error:', error);
    return NextResponse.json({ 
      strengths: ['成功完成了对话'],
      improvements: ['沟通技巧可以进一步提升'],
      suggestions: ['多练习可以提高沟通能力'],
      score: 65,
      scoreLevel: 'medium',
    });
  }
}
