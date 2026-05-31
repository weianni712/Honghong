import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { createPost } from '@/storage/database/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { topic, category, style } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建生成提示
    const systemPrompt = `你是一个专业的情感沟通类文章作家，擅长写轻松幽默、实用的恋爱/沟通技巧文章。

请根据用户给的主题，生成一篇完整的文章。

要求：
1. 标题要吸引人，简洁明了
2. 摘要要能概括文章核心价值，30-50字
3. 内容要有干货，包含具体方法和案例
4. 风格轻松幽默，像朋友聊天
5. 使用Markdown格式：
   - 一级标题用 # 
   - 二级标题用 ##
   - 重点用 **加粗**
   - 列表用 -
   - 引用用 >
6. 字数控制在300-500字
7. 标签用逗号分隔的关键词

请严格按照以下JSON格式输出，不要输出其他内容：
{
  "title": "标题",
  "summary": "摘要",
  "content": "正文内容(包含Markdown格式)",
  "cover_image": "一个emoji",
  "tags": "标签1,标签2,标签3",
  "read_time": "X分钟"
}`;

    const response = await client.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `请生成一篇关于"${topic}"的文章，风格${style || '轻松幽默'}` },
    ], {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
    });

    // 解析JSON响应
    let articleData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse article data' }, { status: 500 });
    }

    // 保存到数据库
    const savedPost = await createPost({
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      cover_image: articleData.cover_image || '📝',
      category: category || articleData.category || '沟通技巧',
      tags: articleData.tags || '',
      read_time: articleData.read_time || '5分钟',
      publish_date: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      post: savedPost,
    });
  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
  }
}
