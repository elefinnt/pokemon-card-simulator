export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { warmCuratedPools } = await import('./lib/pokemontcg/warm')
    warmCuratedPools().catch((err) => {
      console.warn(
        '[instrumentation] pool warm-up failed:',
        err instanceof Error ? err.message : err,
      )
    })
  }
}
