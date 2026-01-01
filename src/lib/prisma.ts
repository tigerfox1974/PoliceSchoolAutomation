import { PrismaClient } from '@prisma/client'

function normalizeDatabaseUrl(raw: string) {
  const trimmed = raw.trim()

  // dotenv/ortam bazen tirnaklari degerin icinde birakabiliyor
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed

  try {
    const url = new URL(unquoted)
    const schema = url.searchParams.get('schema')
    if (schema !== null) {
      const normalizedSchema = schema.replace(/^['"]|['"]$/g, '').trim()
      if (!normalizedSchema) {
        url.searchParams.set('schema', 'public')
      } else if (normalizedSchema !== schema) {
        url.searchParams.set('schema', normalizedSchema)
      }
    }
    return url.toString()
  } catch {
    // URL parse edilemezse (nadir), en azindan dis tirnaklari temizlenmis haliyle birak
    return unquoted
  }
}

if (process.env.DATABASE_URL) {
  const normalized = normalizeDatabaseUrl(process.env.DATABASE_URL)
  if (normalized !== process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
    console.warn('DATABASE_URL normalize edildi (schema/public kontrolu).')
  }
  process.env.DATABASE_URL = normalized
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
