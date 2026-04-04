import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { cleanData } from '@/lib/data-cleaner'

export async function POST(req: NextRequest) {
  try {
    const { collection, limit = 500, filter = {} } = await req.json()

    if (!collection) {
      return NextResponse.json({ error: 'Missing field: collection' }, { status: 400 })
    }

    const db = await getDb()
    const rawData = await db
      .collection(collection)
      .find(filter)
      .limit(limit)
      .toArray()

    // Remove MongoDB _id from rows before cleaning
    const withoutId = rawData.map(({ _id, ...rest }) => rest)
    const cleaned = cleanData(withoutId)

    return NextResponse.json({ success: true, collection, ...cleaned })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}