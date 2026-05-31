import { Achievement, ConversationState } from './types';

export const achievements: Achievement[] = [
  {
    id: 'three-words',
    name: '三句话哄好',
    description: '3轮内解决问题',
    icon: '⚡',
    condition: (state: ConversationState) => state.turns <= 3 && state.isCompleted,
    unlocked: false,
  },
  {
    id: 'five-words',
    name: '五步定乾坤',
    description: '5轮内解决问题',
    icon: '🎯',
    condition: (state: ConversationState) => state.turns <= 5 && state.turns > 3 && state.isCompleted,
    unlocked: false,
  },
  {
    id: 'humor-master',
    name: '幽默大师',
    description: '用幽默化解尴尬',
    icon: '😄',
    condition: (state: ConversationState) => {
      return state.messages.some(m => 
        m.role === 'user' && 
        (m.content.includes('哈哈') || m.content.includes('笑') || m.content.includes('幽默'))
      ) && state.isCompleted;
    },
    unlocked: false,
  },
  {
    id: 'stand-ground',
    name: '立场坚守者',
    description: '既哄好对方又没丢掉自己的立场',
    icon: '🛡️',
    condition: (state: ConversationState) => {
      return state.isCompleted && state.userScore >= 70;
    },
    unlocked: false,
  },
  {
    id: 'empathy-expert',
    name: '共情高手',
    description: '多次表达理解和认同',
    icon: '❤️',
    condition: (state: ConversationState) => {
      const empathyKeywords = ['理解', '明白', '知道', '感受', '心疼', '对不起'];
      const count = state.messages.filter(m => 
        m.role === 'user' && 
        empathyKeywords.some(kw => m.content.includes(kw))
      ).length;
      return count >= 2 && state.isCompleted;
    },
    unlocked: false,
  },
  {
    id: 'apology-master',
    name: '真诚道歉',
    description: '真诚道歉并得到对方回应',
    icon: '🙏',
    condition: (state: ConversationState) => {
      return state.messages.some(m => 
        m.role === 'user' && 
        (m.content.includes('对不起') || m.content.includes('抱歉') || m.content.includes('我的错'))
      ) && state.isCompleted;
    },
    unlocked: false,
  },
  {
    id: 'quick-witted',
    name: '机智如你',
    description: '用巧妙的方式化解矛盾',
    icon: '🧠',
    condition: (state: ConversationState) => {
      return state.messages.some(m => 
        m.role === 'user' && 
        (m.content.includes('其实') || m.content.includes('但是') || m.content.includes('要不'))
      ) && state.isCompleted;
    },
    unlocked: false,
  },
  {
    id: 'patient',
    name: '耐心倾听',
    description: '对话超过10轮仍坚持',
    icon: '👂',
    condition: (state: ConversationState) => state.turns >= 10 && state.isCompleted,
    unlocked: false,
  },
];

export const checkAchievements = (state: ConversationState): Achievement[] => {
  return achievements.map(achievement => ({
    ...achievement,
    unlocked: achievement.condition(state),
    unlockedAt: achievement.condition(state) ? Date.now() : undefined,
  })).filter(a => a.unlocked);
};

export const getUnlockedAchievements = (states: ConversationState[]): Achievement[] => {
  const allUnlocked: Achievement[] = [];
  const seenIds = new Set<string>();
  
  states.forEach(state => {
    const unlocked = checkAchievements(state);
    unlocked.forEach(a => {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        allUnlocked.push(a);
      }
    });
  });
  
  return allUnlocked;
};
