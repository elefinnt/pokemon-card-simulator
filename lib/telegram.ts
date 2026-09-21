import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from './feedback-types'

const TELEGRAM_API = 'https://api.telegram.org'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://packrip.org'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

/**
 * Best-effort Telegram send. Missing credentials or a network blip are logged
 * and ignored — callers should never fail because of this.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) return

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      console.log(
        '[telegram] send failed:',
        res.status,
        await res.text().catch(() => ''),
      )
    }
  } catch (err) {
    console.log(
      '[telegram] send failed:',
      err instanceof Error ? err.message : err,
    )
  }
}

export async function notifyFeedbackSubmitted(input: {
  category: FeedbackCategory
  message: string
  page: string | null
  contactOk: boolean
  email: string | null
  userName: string | null
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()
  if (!token || !chatId) {
    console.log('[telegram] skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set')
    return
  }

  const who = input.userName?.trim() || 'Anonymous visitor'
  const lines = [
    `<b>New feedback</b> · ${escapeHtml(FEEDBACK_CATEGORY_LABELS[input.category])}`,
    '',
    escapeHtml(who),
  ]

  if (input.contactOk && input.email) {
    lines.push(`${escapeHtml(input.email)} · happy to be contacted`)
  }

  if (input.page) {
    lines.push(`Page: ${escapeHtml(input.page)}`)
  }

  lines.push('', escapeHtml(input.message.trim()), '', `${siteUrl}/admin/feedback`)

  await sendTelegramMessage(lines.join('\n'))
}
