# Pack opening and Vercel usage

Normal play has no daily allowance. Sustained extreme use receives HTTP 429
with a readable cooldown and `Retry-After`; counters are shared across tabs,
sets and serverless instances. These are request limits, so failed attempts
also count. Fixed windows reset on UTC minute/hour boundaries.

| Scope | Per minute | Per hour | Environment variables |
| --- | ---: | ---: | --- |
| Signed-in account | 30 | 300 | `PACK_OPEN_PER_MINUTE`, `PACK_OPEN_PER_HOUR` |
| Guest IP | 12 | 60 | `PACK_GUEST_PER_MINUTE`, `PACK_GUEST_PER_HOUR` |

Guests behind the same public IP share a limit. On Vercel, the app uses the
platform's trusted `x-vercel-forwarded-for` header. Other hosts must supply
their own trusted IP integration; outside Vercel, guests share a local key.
Only HMACs of account/IP identifiers are stored. A database failure stops new
openings with 503 instead of allowing unlimited requests. Local development
without a database can still preview guest openings.

## Rollout

1. Run `pnpm db:setup-pack-limits` against the production `DATABASE_URL` before
   deploying. This creates only `pack_open_limits` and its index; it does not
   alter existing accounts, collections or trades. It is safe to rerun.
2. Deploy the application. Defaults apply without additional environment values.
3. In Vercel Firewall, create a rate limit rule matching **Request Path starts
   with `/api/open/`**, counting by IP, **60 requests per 60 seconds**, action
   **429**. Include both GET and POST and all set IDs in the same rule. Start
   with Log to inspect shared-IP effects, then publish the 429 action.
   Firewall enforcement protects the function itself; app limits protect
   individual accounts. App-side rejection still invokes a function and MySQL.
4. In Vercel Usage, identify the exhausted resource and review this project's
   function duration/invocations and data transfer. Configure Spend Management
   notifications well before the budget ceiling. A whole-project pause prevents
   overages but takes browsing and collections offline too.

Set `PACK_OPENINGS_PAUSED=true` and redeploy to stop only pack openings during
an incident. Browsing, collections and existing trades stay available. This
environment switch requires deployment; it is not an instant remote toggle.
Keep Vercel's budget ceiling as a final backstop. Neither rate limits nor spend
notifications guarantee a billing cap against many accounts or distributed IPs.

Periodically remove inactive counter rows if needed:

```sql
DELETE FROM pack_open_limits WHERE updated_at < UTC_TIMESTAMP() - INTERVAL 2 DAY;
```

## Cost reductions in this change

- Successful signed-in openings update the in-browser binder from the returned
  pack, removing the full `/api/collection` download after every opening. A page
  reload or opening the collection view retrieves the authoritative collection,
  including trades/other tabs.
- Saving an opening no longer reads the full collection. One batched card
  upsert plus set/stat upserts replace per-card writes. Duplicate cards within
  one pack and overlapping requests use atomic count increments.
- Complete committed card pools are served directly. Optional `LIVE_POOL_REFRESH=true`
  restores background API refresh; otherwise run `pnpm snapshot` when updating
  a pool. Missing snapshots still use the upstream API.
- Cold starts and page renders no longer warm every curated set. `WARM_ALL_POOLS=true`
  is available for a long-running server, and should stay unset on Vercel.
- Public card catalogues and pool readiness responses have browser/CDN cache
  headers. Pack openings and rate-limit responses must never be cached.
- Selection warming is deduplicated with hover warming, including companion sets.
- An analytics failure no longer reports an already-saved opening as failed.

Further options: add bot challenges at the firewall, lower sustained account
limits after observing real usage, or move guest-only simulation into the
browser. Keep saved/tradeable pulls server-generated. Measure the actual Vercel
usage category before making a hosting migration.

References: [Vercel WAF rate limits](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting),
[usage diagnostics](https://vercel.com/docs/pricing/manage-and-optimize-usage),
[Spend Management](https://vercel.com/docs/spend-management),
[trusted request headers](https://vercel.com/docs/headers/request-headers).
