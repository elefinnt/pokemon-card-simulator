# AI search discovery

Public search tools can already find PackRip. These changes make the full
catalogue easier to discover and the simulator easier to describe accurately;
they do not guarantee recommendations, citations or indexing.

## Public entry points

- `/packs` is a server-rendered directory containing a normal HTML link to
  every curated pack, grouped by series. The homepage and footer link to it.
  It does not need a tab click, authentication or a database query. Pack links
  disable automatic Next.js prefetching to avoid loading the entire catalogue
  just because someone visits the directory.
- Pack landing pages include visible information about the simulated pack,
  card count and companion galleries, plus links back to the full directory
  and relevant guides. The details follow the selected pack in the simulator.
- `/llms.txt` is an optional plain-text site summary generated from the same
  curated catalogue and guides. It is statically generated and cacheable.
  The format is a proposal, not a registration or ranking mechanism.
- Structured data describes the free web application and directory using
  facts also available to visitors. It contains no invented ratings or reviews.
- `robots.txt` explicitly permits OAI-SearchBot, Claude-SearchBot and
  PerplexityBot on public pages. API and account-page exclusions apply to these
  agents too. Existing wildcard rules, including training-crawler preferences,
  remain in place.

The catalogue and guide lists are generated from existing source data, so
adding a supported set also updates the directory and plain-text guide.

## After deployment

1. Verify `/packs`, `/llms.txt`, `/robots.txt` and `/sitemap.xml` return 200 on
   the production domain. The directory must be linked from the homepage and
   present in the sitemap.
2. Inspect `/packs` in Search Console and request indexing once. Continue
   monitoring the existing indexing backlog rather than repeatedly submitting
   the same URLs.
3. Review Vercel firewall/request logs for AI search crawlers. Check actual
   response statuses and verify identities using the providers' documentation;
   a user-agent string alone is not proof of the source. A robots allow rule
   does not override a firewall block. Any pack-opening rate rule should target
   `/api/open/`, not public HTML pages.
4. In PostHog, compare landing pages and referring domains as well as UTM
   sources for AI referrals. A crawler visit is not a visitor referral, and
   no attributed referrals does not prove that a provider cannot find the site.

Genuine links and mentions from relevant Pokémon communities, useful original
guides, accurate information and reliable uptime can make the site a more
useful source. There is no promise that a service will recommend it, and model
training inclusion is separate from search visibility.

Sources:

- [OpenAI crawlers and search access](https://developers.openai.com/api/docs/bots)
- [Anthropic's crawler controls](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Crawlable HTML links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [The llms.txt proposal](https://llmstxt.org/)
