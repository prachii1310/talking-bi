import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const collections = await db.listCollections().toArray()
    return NextResponse.json({
      status: 'connected',
      database: db.databaseName,
      collections: collections.map(c => c.name),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}