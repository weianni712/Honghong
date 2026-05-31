'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScenarioById } from '@/lib/scenarios';
import { Scenario, DialogueMessage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Home,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const scenarioId = params.id as string;
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnger, setCurrentAnger] = useState(100);
  const [isCompleted, setIsCompleted] = useState(false);
  const [turns, setTurns] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadedScenario = getScenarioById(scenarioId);
    if (loadedScenario) {
      setScenario(loadedScenario);
      setCurrentAnger(loadedScenario.initialAnger);
      // 添加初始对话
      setMessages([{
        id: 'initial',
        role: 'assistant',
        content: loadedScenario.initialDialogue,
        timestamp: Date.now(),
      }]);
    }
  }, [scenarioId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 播放TTS
  const playTTS = useCallback(async (text: string, role?: string) => {
    if (isMuted) return;
    
    try {
      setIsTTSPlaying(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          role: scenario?.character.role 
        }),
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const data = await response.json();
      const audio = new Audio(data.audioUri);
      await audio.play();
      
      audio.onended = () => setIsTTSPlaying(false);
    } catch (error) {
      console.error('TTS error:', error);
      setIsTTSPlaying(false);
    }
  }, [isMuted, scenario?.character.role]);

  // 发送消息
  const handleSend = async () => {
    if (!userInput.trim() || isLoading || !scenario) return;
    
    const userMessage: DialogueMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setTurns(prev => prev + 1);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt: scenario.systemPrompt,
          scenarioTitle: scenario.title,
          characterName: scenario.character.name,
        }),
      });
      
      if (!response.ok) throw new Error('Chat failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let isSuccess = false;
      
      // 添加AI消息占位
      const aiMessageId = `ai-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullContent += data.content;
                // 更新消息内容（打字机效果）
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId 
                    ? { ...m, content: fullContent }
                    : m
                ));
              }
              if (data.isSuccess) {
                isSuccess = data.isSuccess;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      // 检查是否成功
      if (isSuccess) {
        setIsCompleted(true);
        setCurrentAnger(10);
        // 播放TTS
        await playTTS('谢谢你愿意听我说话，我感受到了你的诚意。');
      } else {
        // 根据回合数逐渐降低愤怒值
        setCurrentAnger(prev => Math.max(prev - 15, 20));
      }
      
      // 在关键回合播放TTS
      if (turns > 0 && turns % 3 === 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage) {
          await playTTS(lastMessage.content, scenario.character.role);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // 移除最后一条消息
      setMessages(prev => prev.slice(0, -2));
      setTurns(prev => prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  // 录音功能
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const response = await fetch('/api/asr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio }),
            });
            const data = await response.json();
            if (data.text) {
              setUserInput(prev => prev + data.text);
            }
          } catch (error) {
            console.error('ASR error:', error);
          }
        };
        reader.readAsDataURL(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 计算情商分数
  const calculateScore = () => {
    let score = 100;
    score -= turns * 5; // 每多一轮扣5分
    score += currentAnger < 20 ? 0 : (currentAnger - 20) * 0.5; // 愤怒值高扣分
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  if (!scenario) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (isCompleted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-4">
        <div className="mx-auto max-w-md pt-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-2">恭喜你成功哄好了对方！</h1>
            <p className="text-muted-foreground">
              你用了 {turns} 轮对话，展现了你的沟通能力
            </p>
          </div>
          
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4">你的表现</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>情商评分</span>
                  <span className="font-medium">{score}分</span>
                </div>
                <Progress value={score} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">{turns}</div>
                  <div className="text-xs text-muted-foreground">对话轮数</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{currentAnger}%</div>
                  <div className="text-xs text-muted-foreground">对方愤怒值</div>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="space-y-3">
            <Link href={`/review/${scenarioId}?turns=${turns}&score=${score}`}>
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                查看复盘
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setMessages([{
                  id: 'initial',
                  role: 'assistant',
                  content: scenario.initialDialogue,
                  timestamp: Date.now(),
                }]);
                setIsCompleted(false);
                setTurns(0);
                setCurrentAnger(scenario.initialAnger);
              }}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              再来一次
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full">
                <Home className="mr-1 h-4 w-4" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-sm">{scenario.title}</h1>
              <p className="text-xs text-muted-foreground">
                {scenario.character.name} • {scenario.character.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* 愤怒值进度条 */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">愤怒值</span>
            <Progress 
              value={currentAnger} 
              className="h-2 flex-1" 
            />
            <Badge variant={currentAnger > 60 ? 'destructive' : currentAnger > 30 ? 'default' : 'secondary'}>
              {currentAnger}%
            </Badge>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>平静 😌</span>
            <span>暴怒 😡</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                  : 'bg-white shadow-md rounded-bl-md'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {scenario.character.name[0]}
                  </div>
                  <span>{scenario.character.name}</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {isLoading && message.id === messages[messages.length - 1]?.id && (
                <span className="ml-2 animate-pulse">...</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            className={isRecording ? 'bg-red-100 border-red-300' : ''}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            {isRecording ? <Mic className="h-5 w-5 text-red-500" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你想说的话..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!userInput.trim() || isLoading}
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          长按麦克风说话，松开发送
        </p>
      </footer>
    </div>
  );
}
