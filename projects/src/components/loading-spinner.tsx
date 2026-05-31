'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ 
  size = 'md', 
  text = '加载中...',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-pink-500`} />
      {text && <span className="text-gray-600 text-sm">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-white to-purple-50">
        {content}
      </div>
    );
  }

  return content;
}

export function PageLoader() {
  return <LoadingSpinner size="lg" text="页面加载中..." fullScreen />;
}

export function SectionLoader() {
  return (
    <div className="py-12 flex items-center justify-center">
      <LoadingSpinner size="md" text="加载中..." />
    </div>
  );
}
