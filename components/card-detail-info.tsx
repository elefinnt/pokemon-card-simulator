import type { CardDetail } from '@/lib/pokemontcg/types'

export function CardDetailInfo({ detail }: { detail: CardDetail }) {
  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4 text-left text-sm">
      {detail.hp && (
        <MetaRow label="HP" value={detail.hp} />
      )}
      {detail.types.length > 0 && (
        <MetaRow label="Type" value={detail.types.join(' · ')} />
      )}
      {detail.evolvesFrom && (
        <MetaRow label="Evolves from" value={detail.evolvesFrom} />
      )}
      {detail.artist && (
        <MetaRow label="Artist" value={detail.artist} />
      )}
      {detail.flavorText && (
        <p className="text-pretty text-xs italic leading-relaxed text-muted-foreground">
          &ldquo;{detail.flavorText}&rdquo;
        </p>
      )}

      {detail.abilities.map((ability) => (
        <AttackBlock
          key={ability.name}
          title={ability.type ? `${ability.type}: ${ability.name}` : ability.name}
          text={ability.text}
        />
      ))}

      {detail.attacks.map((attack) => (
        <AttackBlock
          key={attack.name}
          title={
            attack.damage
              ? `${attack.name} — ${attack.damage}`
              : attack.name
          }
          subtitle={
            attack.cost && attack.cost.length > 0
              ? attack.cost.join(' ')
              : undefined
          }
          text={attack.text}
        />
      ))}

      {(detail.weaknesses.length > 0 || detail.resistances.length > 0) && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {detail.weaknesses.map((w) => (
            <span key={`w-${w.type}`}>
              Weakness: {w.type} {w.value}
            </span>
          ))}
          {detail.resistances.map((r) => (
            <span key={`r-${r.type}`}>
              Resistance: {r.type} {r.value}
            </span>
          ))}
        </div>
      )}

      {detail.convertedRetreatCost != null && detail.convertedRetreatCost > 0 && (
        <MetaRow
          label="Retreat cost"
          value={String(detail.convertedRetreatCost)}
        />
      )}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs">
      <span className="font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function AttackBlock({
  title,
  subtitle,
  text,
}: {
  title: string
  subtitle?: string
  text?: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <p className="text-xs font-bold text-foreground">{title}</p>
      {subtitle && (
        <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{subtitle}</p>
      )}
      {text && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
      )}
    </div>
  )
}
