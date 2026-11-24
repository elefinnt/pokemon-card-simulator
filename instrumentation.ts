export async function register() {
  // Opt in only for a long-running server. Serverless cold starts should not
  // fetch every set; committed snapshots serve the selected set immediately.
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.WARM_ALL_POOLS === 'true') {
    const { warmCuratedPools } = await import('./lib/pokemontcg/warm')
    warmCuratedPools().catch((err) => {
      console.warn(
        '[instrumentation] pool warm-up failed:',
        err instanceof Error ? err.message : err,
      )
    })
  }
}
