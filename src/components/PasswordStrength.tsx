'use client';

import { useMemo } from 'react';
import zxcvbn from 'zxcvbn';

export default function PasswordStrength({ value }: { value: string }) {
  const res = useMemo(() => zxcvbn(value || ''), [value]);
  const score = res.score; // 0..4
  const pct = ((score + 1) / 5) * 100;

  const label = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  const tips =
    res.feedback.suggestions?.length
      ? res.feedback.suggestions
      : [
          'Use 10+ chars, mix upper/lower, numbers & symbols.',
          'Avoid common words or personal info.',
        ];

  // marka renkleri: zayıf=rose, orta=amber, iyi=emerald
  const barClass =
    score < 2 ? 'bg-rose-500' : score < 3 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <div className="h-2 bg-neutral-200/70 dark:bg-white/10 rounded">
        <div
          className={`h-2 rounded transition-all ${barClass}`}
          style={{ width: pct + '%' }}
        />
      </div>
      <div className="text-xs text-neutral-600 dark:text-neutral-400">
        {label} {value ? '– ' + tips[0] : ''}
      </div>
    </div>
  );
}
