import { NextRequest, NextResponse } from 'next/server';
import { ASRClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { audioData } = await request.json();

    if (!audioData) {
      return NextResponse.json({ error: 'Missing audio data' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ASRClient(config, customHeaders);

    const result = await client.recognize({
      uid: `asr-${Date.now()}`,
      base64Data: audioData,
    });

    return NextResponse.json({
      text: result.text,
      duration: result.duration,
    });
  } catch (error) {
    console.error('ASR API Error:', error);
    return NextResponse.json({ error: 'Speech recognition failed' }, { status: 500 });
  }
}
