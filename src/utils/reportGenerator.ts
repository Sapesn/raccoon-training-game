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


export function generateTaskReport(result: TaskResult, meta: ReportMeta): void {
  const gradeLabel = GRADE_LABEL[result.grade] ?? result.grade
  const gradeColor = GRADE_COLOR[result.grade] ?? '#374151'
  const categoryLabel = CATEGORY_LABEL[meta.taskCategory] ?? meta.taskCategory
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // Convert AI output plain text to readable HTML:
  // blank lines → paragraph breaks, single newlines → <br>
  function formatAIOutput(text: string): string {
    return text
      .split(/\n{2,}/)
      .map(para => {
        const escaped = escapeHtml(para.trim())
        const withBr = escaped.replace(/\n/g, '<br>')
        return `<p style="margin:0 0 1.2em 0">${withBr}</p>`
      })
      .join('')
  }

  const mainContentHTML = result.aiOutput
    ? formatAIOutput(result.aiOutput)
    : `<p style="color:#9ca3af;font-style:italic">（本次任务无 AI 执行成果）</p>`

  const statusChangesHTML = Object.entries(result.statusChanges)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `<span style="padding:1px 7px;border-radius:99px;font-size:11px;
        background:${v > 0 ? '#dcfce7' : '#fee2e2'};color:${v > 0 ? '#15803d' : '#dc2626'};margin:2px;display:inline-block">
        ${escapeHtml(k)} ${v > 0 ? '+' : ''}${v}</span>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.taskName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Noto Sans SC',system-ui,sans-serif;background:#f9fafb;color:#1f2937;min-height:100vh}
    @media print{
      body{background:white}
      .no-print{display:none!important}
      .page-wrap{padding:20px!important}
      .meta-footer{page-break-inside:avoid}
    }
  </style>
</head>
<body>
<div class="page-wrap" style="max-width:760px;margin:0 auto;padding:48px 24px 80px">

  <!-- Document header: task name + date only -->
  <div style="border-bottom:2px solid #e5e7eb;padding-bottom:20px;margin-bottom:32px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div>
        <div style="font-size:11px;font-weight:600;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px">
          ${escapeHtml(categoryLabel)} · ${escapeHtml(meta.taskDifficulty)} 难度
        </div>
        <h1 style="font-size:26px;font-weight:700;color:#111827;line-height:1.3">${escapeHtml(meta.taskName)}</h1>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:11px;color:#9ca3af">${dateStr}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">🦝 ${escapeHtml(meta.raccoonName)} · Lv.${meta.raccoonLevel}</div>
      </div>
    </div>
    <!-- Task brief -->
    <p style="font-size:13px;color:#6b7280;margin-top:12px;line-height:1.65;padding:10px 14px;background:#f3f4f6;border-radius:8px">
      ${escapeHtml(meta.taskDescription)}
    </p>
  </div>

  <!-- PRIMARY: AI-generated deliverable -->
  <div style="font-size:15px;line-height:1.85;color:#1f2937;font-family:'Noto Sans SC',system-ui,sans-serif">
    ${mainContentHTML}
  </div>

  <!-- Divider -->
  <div style="border-top:1px solid #e5e7eb;margin-top:48px;padding-top:20px"></div>

  <!-- Compact metadata footer -->
  <div class="meta-footer" style="background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-top:16px">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <!-- Grade + score -->
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;font-weight:700;color:${gradeColor}">${gradeLabel}</span>
        <span style="font-size:12px;color:#9ca3af">·</span>
        <span style="font-size:12px;color:#6b7280">综合得分 <strong style="color:${gradeColor}">${result.score}</strong>/100</span>
        ${result.aiScore !== undefined ? `<span style="font-size:12px;color:#9ca3af">· AI 自评 ${result.aiScore}</span>` : ''}
      </div>
      <!-- Rewards -->
      <div style="display:flex;align-items:center;gap:12px;margin-left:auto">
        <span style="font-size:12px;color:#d97706;font-weight:600">🪙 +${result.coinsEarned} 金币</span>
        <span style="font-size:12px;color:#3b82f6;font-weight:600">+${result.expEarned} EXP</span>
        <span style="font-size:11px;color:#9ca3af">第 ${meta.gameDay} 天</span>
      </div>
    </div>
    ${statusChangesHTML ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #f3f4f6">${statusChangesHTML}</div>` : ''}
  </div>

  <!-- Footer CTA -->
  <div style="margin-top:32px;text-align:center">
    <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:99px;padding:8px 20px">
      <span style="font-size:16px">🦝</span>
      <span style="font-size:12px;font-weight:600;color:#78350f">办公小浣熊</span>
      <span style="font-size:11px;color:#b45309;opacity:0.8">· Powered by raccoon.ai</span>
    </div>
  </div>

  <!-- Print button -->
  <div class="no-print" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="background:#f59e0b;color:white;border:none;padding:9px 26px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">
      🖨️ 打印 / 保存为 PDF
    </button>
  </div>

</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `办公小浣熊_${meta.taskName}_${now.toISOString().slice(0, 10)}.html`
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
