/**
 * 基于 fetch 的 SSE 流式读取工具
 * 原生 EventSource 无法携带 Authorization 头, 统一改用 fetch + ReadableStream
 */
export interface SseOptions {
    method?: 'GET' | 'POST'
    body?: any
    onMessage: (chunk: string) => void
    onDone?: () => void
    onError?: (err: any) => void
}

export function streamSse(url: string, options: SseOptions): AbortController {
    const controller = new AbortController()
    const token = localStorage.getItem('EXAM_TOKEN')

    const headers: Record<string, string> = {
        'Accept': 'text/event-stream'
    }
    if (token) headers['Authorization'] = 'Bearer ' + token
    if (options.method === 'POST') headers['Content-Type'] = 'application/json'

    fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.method === 'POST' ? JSON.stringify(options.body || {}) : undefined,
        signal: controller.signal
    }).then(async (response) => {
        if (!response.ok || !response.body) {
            throw new Error(`SSE 连接失败: ${response.status}`)
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })

            // SSE 事件以空行分隔; 同一事件内的多行 data: 按规范用 \n 重新拼接, 避免段落换行丢失
            const events = buffer.split('\n\n')
            buffer = events.pop() || ''
            for (const event of events) {
                const dataLines = event.split('\n')
                    .map(l => l.replace(/\r$/, ''))
                    .filter(l => l.startsWith('data:'))
                    .map(l => l.replace(/^data: ?/, ''))
                if (dataLines.length > 0) {
                    options.onMessage(dataLines.join('\n'))
                }
            }
        }
        options.onDone?.()
    }).catch((err) => {
        if (err?.name !== 'AbortError') {
            console.error('SSE 流异常', err)
            options.onError?.(err)
        }
    })

    return controller
}
