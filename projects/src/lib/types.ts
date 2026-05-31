// 场景相关类型
export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'romance' | 'work' | 'family' | 'friend' | 'client';
  character: {
    name: string;
    role: string;
    avatar: string;
  };
  initialAnger: number; // 初始愤怒值 0-100
  initialDialogue: string; // 初始对话
  systemPrompt: string; // AI角色设定
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

// 对话相关类型
export interface DialogueMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isTTS?: boolean; // 是否是TTS播报的消息
}

export interface ConversationState {
  scenarioId: string;
  messages: DialogueMessage[];
  currentAnger: number; // 当前愤怒值
  isCompleted: boolean;
  turns: number; // 回合数
  startTime: number;
  userScore: number; // 用户情商分数
}

// 成就相关类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: ConversationState) => boolean;
  unlocked: boolean;
  unlockedAt?: number;
}

// 复盘相关类型
export interface ReviewResult {
  scenarioId: string;
  scenarioTitle: string;
  turns: number;
  duration: number;
  achievements: Achievement[];
  score: number;
  scoreLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  keyDialogues: DialogueMessage[];
}

// 每日挑战相关类型
export interface DailyChallenge {
  date: string;
  scenarioId: string;
  completed: boolean;
  score?: number;
  completedAt?: number;
}

// 成长记录相关类型
export interface GrowthRecord {
  date: string;
  score: number;
  scenarioId: string;
}

// 用户数据（本地存储）
export interface UserData {
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  growthRecords: GrowthRecord[];
  totalScenariosCompleted: number;
  averageScore: number;
}
