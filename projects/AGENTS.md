# 哄哄你 - AI情景模拟练习平台

## 项目概述

"哄哄你"是一个基于AI情景模拟的人际冲突沟通训练平台，帮助用户学习在真实冲突场景中如何有效沟通、化解矛盾。

## 核心功能

- **预设场景库**：涵盖情侣/夫妻、职场、亲子、朋友、客户等多种场景
- **AI情景模拟**：用户选择场景后，AI扮演冲突中的对方进行多轮对话练习
- **语音交互**：支持ASR语音输入和TTS关键时刻播报
- **成就系统**：根据表现解锁不同成就
- **复盘建议**：AI分析对话并给出可执行的沟通话术建议
- **成长曲线**：记录练习历史，展示情商提升趋势
- **每日挑战**：每天推送新场景，引导持续使用
- **恋爱攻略博客**：分享沟通技巧和情感文章（数据库驱动）
- **用户认证**：注册/登录系统，保护用户隐私

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLM, TTS, ASR)
- **图表**: recharts

## 项目结构

```
src/
├── app/
│   ├── page.tsx                    # 首页（场景选择+登录入口）
│   ├── layout.tsx                  # 根布局（含AuthProvider）
│   ├── globals.css                 # 全局样式
│   ├── chat/[id]/page.tsx          # 情景模拟对话页面
│   ├── review/[id]/page.tsx        # 复盘总结页面
│   ├── achievements/page.tsx       # 成就中心页面
│   ├── growth/page.tsx             # 成长轨迹页面
│   ├── blog/
│   │   ├── page.tsx                # 博客列表页
│   │   ├── [id]/page.tsx          # 文章详情页
│   │   └── generate/page.tsx      # AI生成文章页
│   ├── register/page.tsx           # 注册页面
│   ├── login/page.tsx              # 登录页面
│   └── api/
│       ├── chat/route.ts           # AI对话API（流式输出）
│       ├── tts/route.ts            # 文字转语音API
│       ├── asr/route.ts            # 语音识别API
│       ├── review/route.ts         # 复盘分析API
│       ├── blog/route.ts           # 博客列表API
│       ├── blog/[id]/route.ts      # 博客详情API
│       ├── blog/generate/route.ts  # AI生成文章API
│       └── auth/
│           ├── register/route.ts   # 注册API
│           ├── login/route.ts      # 登录API
│           ├── logout/route.ts     # 退出登录API
│           └── me/route.ts         # 获取当前用户API
├── components/ui/                   # shadcn/ui 组件库
├── lib/
│   ├── types.ts                    # 类型定义
│   ├── scenarios.ts                # 预设场景数据
│   ├── achievements.ts             # 成就系统逻辑
│   └── auth-context.tsx           # 认证ContextProvider
└── storage/
    └── database/
        ├── supabase-client.ts     # 数据库客户端
        ├── blog.ts                 # 博客数据库操作
        └── user.ts                 # 用户数据库操作
```

## API 路由

| 路径 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | AI对话（流式SSE输出） |
| `/api/tts` | POST | 文字转语音 |
| `/api/asr` | POST | 语音识别 |
| `/api/review` | POST | 对话复盘分析 |
| `/api/blog` | GET | 获取博客列表 |
| `/api/blog/[id]` | GET | 获取博客详情 |
| `/api/blog/generate` | POST | AI生成文章 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 退出登录 |
| `/api/auth/me` | GET | 获取当前用户 |

## 数据库表

### users 表
- `id`: 用户ID（自增）
- `username`: 用户名
- `email`: 邮箱（唯一）
- `password`: 加密后的密码（bcrypt）
- `created_at`: 创建时间

### blog_posts 表
- `id`: 文章ID（自增）
- `title`: 标题
- `content`: 内容
- `excerpt`: 摘要
- `author`: 作者
- `tags`: 标签数组
- `cover_image`: 封面图URL
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 开发命令

- `pnpm install` - 安装依赖
- `pnpm dev` - 启动开发服务器（端口5000）
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 代码检查
- `pnpm ts-check` - TypeScript类型检查

## 注意事项

- LLM、TTS、ASR功能使用coze-coding-dev-sdk，仅限后端使用
- 语音功能需要用户授权麦克风权限
- 成就、成长记录存储在浏览器localStorage中
- 用户认证数据存储在postgres数据库中
- 会话通过HttpOnly Cookie管理，有效期7天
- 不存储用户对话信息，保护隐私
