export const byTimestamp = <T extends { timestamp: string }>(a: T, b: T) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
