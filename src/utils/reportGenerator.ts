/**
 * reportGenerator — produces a self-contained HTML report from a task result.
 * Opens in a new browser tab via a Blob URL.
 */

import type { TaskResult } from '../types/task'

interface ReportMeta {
  taskName: string
  taskDescription: string
  taskCategory: string
  taskDifficulty: string
  raccoonName: string
  raccoonLevel: number
  gameDay: number
}

const GRADE_LABEL: Record<string, string> = {
  perfect:   '完美 🌟',
  excellent: '优秀 ⭐',
  good:      '良好 ✅',
  partial:   '勉强 🆗',
  fail:      '失败 ❌',
}

const GRADE_COLOR: Record<string, string> = {
  perfect:   '#7c3aed',
  excellent: '#1d4ed8',
  good:      '#15803d',
  partial:   '#b45309',
  fail:      '#dc2626',
}

const CATEGORY_LABEL: Record<string, string> = {
  writing:       '写作',
  analysis:      '分析',
  creative:      '创意',
  research:      '研究',
  planning:      '规划',
  communication: '沟通',
  data:          '数据',
  social:        '社交',
}

const SCORE_LABEL: Record<string, string> = {
  accuracy:     '准确性',
  completeness: '完整度',
  expression:   '表达力',
  timeliness:   '时效性',
  stability:    '稳定性',
}

function scoreBar(value: number, color: string): string {
  const pct = Math.round(value)
  return `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7280;margin-bottom:4px">
        <span>${color}</span><span>${pct}</span>
      </div>
      <div style="height:6px;background:#f3f4f6;border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:99px;transition:width 0.6s ease"></div>
      </div>
    </div>`
}

export function generateTaskReport(result: TaskResult, meta: ReportMeta): void {
  const gradeLabel = GRADE_LABEL[result.grade] ?? result.grade
  const gradeColor = GRADE_COLOR[result.grade] ?? '#374151'
  const categoryLabel = CATEGORY_LABEL[meta.taskCategory] ?? meta.taskCategory
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const scoreBreakdownHTML = Object.entries(result.scoreBreakdown)
    .map(([key, val]) => scoreBar(val, SCORE_LABEL[key] ?? key))
    .join('')

  const statusChangesHTML = Object.entries(result.statusChanges)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `
      <span style="display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;
        background:${v > 0 ? '#dcfce7' : '#fee2e2'};color:${v > 0 ? '#15803d' : '#dc2626'};margin:3px">
        ${k} ${v > 0 ? '+' : ''}${v}
      </span>`)
    .join('')

  const aiOutputHTML = result.aiOutput
    ? `
    <div style="margin-top:28px">
      <h2 style="font-size:15px;font-weight:700;color:#1f2937;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span style="background:#f3e8ff;color:#7c3aed;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">AI 执行成果</span>
      </h2>
      <div style="background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:20px;
        font-size:13px;line-height:1.8;color:#374151;white-space:pre-wrap;font-family:'Noto Sans SC',sans-serif">
${escapeHtml(result.aiOutput)}
      </div>
      ${result.aiScore !== undefined ? `<p style="text-align:right;font-size:11px;color:#9ca3af;margin-top:8px">AI 自评分：${result.aiScore}/100</p>` : ''}
    </div>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.taskName)} — 办公小浣熊任务报告</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans SC',system-ui,sans-serif;background:#f9fafb;color:#1f2937;min-height:100vh}
    @media print{body{background:white}.no-print{display:none!important}}
  </style>
</head>
<body>
<div style="max-width:720px;margin:0 auto;padding:40px 20px 80px">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:20px;padding:28px 32px;margin-bottom:28px;position:relative;overflow:hidden">
    <div style="position:absolute;right:24px;top:50%;transform:translateY(-50%);font-size:72px;opacity:0.3">🦝</div>
    <div style="font-size:12px;color:#92400e;font-weight:600;letter-spacing:0.08em;margin-bottom:6px;opacity:0.8">TASK REPORT</div>
    <h1 style="font-size:24px;font-weight:700;color:#78350f;margin-bottom:8px">${escapeHtml(meta.taskName)}</h1>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <span style="background:rgba(255,255,255,0.6);padding:3px 10px;border-radius:99px;font-size:12px;color:#92400e">${categoryLabel}</span>
      <span style="background:rgba(255,255,255,0.6);padding:3px 10px;border-radius:99px;font-size:12px;color:#92400e">${meta.taskDifficulty} 难度</span>
      <span style="background:rgba(255,255,255,0.6);padding:3px 10px;border-radius:99px;font-size:12px;color:#92400e">第 ${meta.gameDay} 天</span>
    </div>
  </div>

  <!-- Result banner -->
  <div style="background:white;border-radius:16px;padding:24px;margin-bottom:20px;border:2px solid ${gradeColor}20;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    <div style="display:flex;align-items:center;gap:16px">
      <div style="flex:1">
        <div style="font-size:22px;font-weight:700;color:${gradeColor}">${gradeLabel}</div>
        <div style="font-size:13px;color:#6b7280;margin-top:4px">综合得分 ${result.score}/100</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:28px;font-weight:800;color:${gradeColor}">${result.score}</div>
        <div style="font-size:10px;color:#9ca3af;letter-spacing:0.05em">/ 100 pts</div>
      </div>
    </div>
  </div>

  <!-- Two columns: breakdown + rewards -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <!-- Score breakdown -->
    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
      <h2 style="font-size:13px;font-weight:600;color:#374151;margin-bottom:14px">评分细项</h2>
      ${scoreBreakdownHTML}
    </div>

    <!-- Rewards + status -->
    <div style="background:white;border-radius:16px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
      <h2 style="font-size:13px;font-weight:600;color:#374151;margin-bottom:14px">奖励与影响</h2>
      <div style="display:flex;gap:16px;margin-bottom:16px">
        <div style="text-align:center;flex:1">
          <div style="font-size:22px;font-weight:700;color:#d97706">🪙 ${result.coinsEarned}</div>
          <div style="font-size:11px;color:#9ca3af">金币</div>
        </div>
        <div style="text-align:center;flex:1">
          <div style="font-size:22px;font-weight:700;color:#3b82f6">+${result.expEarned}</div>
          <div style="font-size:11px;color:#9ca3af">EXP</div>
        </div>
      </div>
      ${statusChangesHTML ? `<div style="border-top:1px solid #f3f4f6;padding-top:12px">${statusChangesHTML}</div>` : ''}
    </div>
  </div>

  <!-- Task description -->
  <div style="background:white;border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    <h2 style="font-size:13px;font-weight:600;color:#374151;margin-bottom:8px">任务说明</h2>
    <p style="font-size:13px;color:#4b5563;line-height:1.7">${escapeHtml(meta.taskDescription)}</p>
  </div>

  <!-- AI Output -->
  ${aiOutputHTML}

  <!-- Raccoon info -->
  <div style="background:white;border-radius:16px;padding:16px 20px;margin-top:20px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
    <span style="font-size:28px">🦝</span>
    <div>
      <div style="font-size:13px;font-weight:600;color:#374151">${escapeHtml(meta.raccoonName)}</div>
      <div style="font-size:11px;color:#9ca3af">Lv.${meta.raccoonLevel} · 生成于 ${dateStr}</div>
    </div>
  </div>

  <!-- Footer / CTA -->
  <div style="margin-top:40px;text-align:center">
    <div style="display:inline-block;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;padding:20px 32px">
      <div style="font-size:24px;margin-bottom:6px">🦝</div>
      <div style="font-size:16px;font-weight:700;color:#78350f;margin-bottom:4px">办公小浣熊</div>
      <div style="font-size:12px;color:#92400e;margin-bottom:12px">让 AI 助理陪你完成每一个工作挑战</div>
      <div style="font-size:11px;color:#b45309;opacity:0.8">Powered by 办公小浣熊 · raccoon.ai</div>
    </div>
  </div>

  <!-- Print button -->
  <div class="no-print" style="text-align:center;margin-top:24px">
    <button onclick="window.print()" style="background:#f59e0b;color:white;border:none;padding:10px 28px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
      🖨️ 打印 / 保存为 PDF
    </button>
  </div>

</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  // Use <a download> — immune to popup blockers
  const a = document.createElement('a')
  a.href = url
  a.download = `办公小浣熊报告_${meta.taskName}_${now.toISOString().slice(0, 10)}.html`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
