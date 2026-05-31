import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import axios from 'axios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 角色对应的声音
const voiceMap: Record<string, string> = {
  '女朋友': 'zh_female_meilinvyou_saturn_bigtts',
  '未婚妻': 'zh_female_meilinvyou_saturn_bigtts',
  '儿子': 'saturn_zh_male_shuanglangshaonian_tob',
  '好兄弟': 'zh_male_taocheng_uranus_bigtts',
  '闺蜜': 'zh_female_mizai_saturn_bigtts',
  '甲方负责人': 'zh_male_dayi_saturn_bigtts',
  '客户老板': 'zh_male_dayi_saturn_bigtts',
  '部门总监': 'zh_male_ruyayichen_saturn_bigtts',
  '项目经理': 'zh_male_dayi_saturn_bigtts',
  '副总裁': 'zh_male_ruyayichen_saturn_bigtts',
};

export async function POST(request: NextRequest) {
  try {
    const { text, role, emotion } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 根据角色选择声音
    const speaker = role ? (voiceMap[role] || voiceMap['女朋友']) : voiceMap['女朋友'];

    // 根据情绪调整语速
    let speechRate = 0;
    if (emotion === 'happy') {
      speechRate = 10;
    } else if (emotion === 'sad') {
      speechRate = -10;
    } else if (emotion === 'angry') {
      speechRate = 5;
    }

    const response = await client.synthesize({
      uid: `tts-${Date.now()}`,
      text,
      speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
      speechRate,
    });

    // 获取音频数据并转为base64
    const audioData = await axios.get(response.audioUri, { responseType: 'arraybuffer' });
    const base64Audio = Buffer.from(audioData.data).toString('base64');

    return NextResponse.json({
      audioUri: `data:audio/mp3;base64,${base64Audio}`,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'TTS synthesis failed' }, { status: 500 });
  }
}
