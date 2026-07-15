import {
  boolean,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'
import type { PokemonCard } from '@/lib/pokemon'

// ---- Auth.js tables --------------------------------------------------------

export const users = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }),
  image: varchar('image', { length: 255 }),
  friendCode: varchar('friend_code', { length: 12 }).unique(),
})

export const accounts = mysqlTable(
  'account',
  {
    userId: varchar('userId', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('providerAccountId', {
      length: 255,
    }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: int('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const sessions = mysqlTable('session', {
  sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', fsp: 3 }).notNull(),
})

export const verificationTokens = mysqlTable(
  'verificationToken',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date', fsp: 3 }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// ---- Collection tables -----------------------------------------------------

// Surrogate `id` primary keys are used on app tables (with a unique index for
// the natural key) instead of composite PKs. This avoids a drizzle-kit push bug
// where composite PKs backing a foreign-key index are dropped/recreated on every
// push and fail with ER_DROP_INDEX_FK.

export const collectedCards = mysqlTable(
  'collected_cards',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: varchar('card_id', { length: 255 }).notNull(),
    setId: varchar('set_id', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    number: varchar('number', { length: 64 }).notNull(),
    rarity: varchar('rarity', { length: 128 }).notNull(),
    tier: varchar('tier', { length: 32 }).notNull(),
    foil: boolean('foil').notNull().default(false),
    rainbow: boolean('rainbow').notNull().default(false),
    imageSmall: text('image_small').notNull(),
    imageLarge: text('image_large').notNull(),
    count: int('count').notNull().default(1),
    firstPulledAt: timestamp('first_pulled_at', {
      mode: 'date',
      fsp: 3,
    }).notNull(),
    lastPulledAt: timestamp('last_pulled_at', {
      mode: 'date',
      fsp: 3,
    }).notNull(),
  },
  (t) => ({
    userCard: uniqueIndex('collected_cards_user_id_card_id_unique').on(
      t.userId,
      t.cardId,
    ),
  }),
)

export const setProgress = mysqlTable(
  'set_progress',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    setId: varchar('set_id', { length: 255 }).notNull(),
    poolTotal: int('pool_total').notNull().default(0),
    packsOpened: int('packs_opened').notNull().default(0),
  },
  (t) => ({
    userSet: uniqueIndex('set_progress_user_id_set_id_unique').on(
      t.userId,
      t.setId,
    ),
  }),
)

export const userStats = mysqlTable(
  'user_stats',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    totalPacksOpened: int('total_packs_opened').notNull().default(0),
    totalCardsPulled: int('total_cards_pulled').notNull().default(0),
  },
  (t) => ({
    user: uniqueIndex('user_stats_user_id_unique').on(t.userId),
  }),
)

// ---- Friends tables --------------------------------------------------------

export const friendships = mysqlTable(
  'friendships',
  {
    id: int('id').autoincrement().primaryKey(),
    requesterId: varchar('requester_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    addresseeId: varchar('addressee_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 'pending' until the addressee accepts, then 'accepted'.
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 }).notNull(),
    respondedAt: timestamp('responded_at', { mode: 'date', fsp: 3 }),
  },
  (t) => ({
    pair: uniqueIndex('friendships_requester_id_addressee_id_unique').on(
      t.requesterId,
      t.addresseeId,
    ),
    // Dedicated index so the addressee FK doesn't rely on the unique index
    // (which only covers addressee_id as a non-leading column).
    addressee: index('friendships_addressee_id_idx').on(t.addresseeId),
  }),
)

// ---- Community feed tables -------------------------------------------------

export const packOpenings = mysqlTable(
  'pack_openings',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    setId: varchar('set_id', { length: 255 }).notNull(),
    packName: varchar('pack_name', { length: 255 }).notNull(),
    series: varchar('series', { length: 255 }).notNull(),
    bestTier: varchar('best_tier', { length: 32 }).notNull(),
    cardCount: int('card_count').notNull().default(0),
    // Denormalised snapshot of the pulled cards so the feed renders without
    // re-fetching from the Pokémon TCG API.
    cards: json('cards').$type<PokemonCard[]>().notNull(),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (t) => ({
    recent: index('pack_openings_created_at_idx').on(t.createdAt),
    user: index('pack_openings_user_id_idx').on(t.userId),
  }),
)

export const packOpeningReactions = mysqlTable(
  'pack_opening_reactions',
  {
    id: int('id').autoincrement().primaryKey(),
    openingId: int('opening_id')
      .notNull()
      .references(() => packOpenings.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // One reaction per user per opening; switching updates this row.
    reaction: varchar('reaction', { length: 16 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (t) => ({
    openingUser: uniqueIndex(
      'pack_opening_reactions_opening_id_user_id_unique',
    ).on(t.openingId, t.userId),
    user: index('pack_opening_reactions_user_id_idx').on(t.userId),
  }),
)

// ---- Trade tables ----------------------------------------------------------

export const tradeOffers = mysqlTable(
  'trade_offers',
  {
    id: int('id').autoincrement().primaryKey(),
    // The player who composed and sent the offer.
    fromUserId: varchar('from_user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The player who receives it and may accept/decline/modify.
    toUserId: varchar('to_user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 'pending' until the recipient responds. 'countered' means the recipient
    // modified it, superseding this offer with a new reversed one.
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    message: varchar('message', { length: 280 }),
    // Points back to the offer this one supersedes (a counter-offer).
    replacesId: int('replaces_id'),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 }).notNull(),
    respondedAt: timestamp('responded_at', { mode: 'date', fsp: 3 }),
  },
  (t) => ({
    recipient: index('trade_offers_to_user_id_idx').on(t.toUserId),
    sender: index('trade_offers_from_user_id_idx').on(t.fromUserId),
    status: index('trade_offers_status_idx').on(t.status),
  }),
)

export const tradeOfferItems = mysqlTable(
  'trade_offer_items',
  {
    id: int('id').autoincrement().primaryKey(),
    offerId: int('offer_id')
      .notNull()
      .references(() => tradeOffers.id, { onDelete: 'cascade' }),
    // 'from' = a card the sender is giving; 'to' = a card requested from the
    // recipient. Both parties' cards live in this one table.
    side: varchar('side', { length: 4 }).notNull(),
    cardId: varchar('card_id', { length: 255 }).notNull(),
    quantity: int('quantity').notNull().default(1),
    // Denormalised card snapshot so an offer renders correctly even after the
    // underlying card has been traded away (mirrors collected_cards).
    setId: varchar('set_id', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    number: varchar('number', { length: 64 }).notNull(),
    rarity: varchar('rarity', { length: 128 }).notNull(),
    tier: varchar('tier', { length: 32 }).notNull(),
    foil: boolean('foil').notNull().default(false),
    rainbow: boolean('rainbow').notNull().default(false),
    imageSmall: text('image_small').notNull(),
    imageLarge: text('image_large').notNull(),
  },
  (t) => ({
    offer: index('trade_offer_items_offer_id_idx').on(t.offerId),
  }),
)
