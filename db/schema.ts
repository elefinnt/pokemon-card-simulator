import {
  boolean,
  int,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'

// ---- Auth.js tables --------------------------------------------------------

export const users = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }),
  image: varchar('image', { length: 255 }),
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

export const collectedCards = mysqlTable(
  'collected_cards',
  {
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
    pk: primaryKey({ columns: [t.userId, t.cardId] }),
  }),
)

export const setProgress = mysqlTable(
  'set_progress',
  {
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    setId: varchar('set_id', { length: 255 }).notNull(),
    poolTotal: int('pool_total').notNull().default(0),
    packsOpened: int('packs_opened').notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.setId] }),
  }),
)

export const userStats = mysqlTable('user_stats', {
  userId: varchar('user_id', { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalPacksOpened: int('total_packs_opened').notNull().default(0),
  totalCardsPulled: int('total_cards_pulled').notNull().default(0),
})
