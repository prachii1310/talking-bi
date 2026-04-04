// scripts/seed.mjs
// Run with: node scripts/seed.mjs
// This inserts 200 realistic e-commerce records into your MongoDB

import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const uri    = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'talking-bi'

if (!uri) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

// ── Sample data pools ──────────────────────────────────────────────────

const PRODUCTS = [
  { name: 'Wireless Earbuds',   category: 'Electronics', basePrice: 1299 },
  { name: 'Running Shoes',      category: 'Footwear',    basePrice: 2499 },
  { name: 'Yoga Mat',           category: 'Fitness',     basePrice: 799  },
  { name: 'Coffee Maker',       category: 'Kitchen',     basePrice: 3499 },
  { name: 'Backpack',           category: 'Bags',        basePrice: 1599 },
  { name: 'Sunglasses',         category: 'Accessories', basePrice: 999  },
  { name: 'Bluetooth Speaker',  category: 'Electronics', basePrice: 1899 },
  { name: 'Water Bottle',       category: 'Fitness',     basePrice: 499  },
  { name: 'Desk Lamp',          category: 'Home',        basePrice: 899  },
  { name: 'Smartwatch',         category: 'Electronics', basePrice: 4999 },
  { name: 'Notebook Set',       category: 'Stationery',  basePrice: 349  },
  { name: 'Face Cream',         category: 'Beauty',      basePrice: 699  },
  { name: 'Protein Powder',     category: 'Fitness',     basePrice: 1299 },
  { name: 'Phone Case',         category: 'Accessories', basePrice: 299  },
  { name: 'Resistance Bands',   category: 'Fitness',     basePrice: 599  },
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
]

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash on Delivery']

const STATUSES = ['delivered', 'delivered', 'delivered', 'shipped', 'processing', 'cancelled']
// delivered appears 3x so it's more likely — realistic distribution

// ── Helpers ────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// ── Generate 200 orders ────────────────────────────────────────────────

function generateOrders(count = 200) {
  const orders = []
  const startDate = new Date('2024-01-01')
  const endDate   = new Date('2024-12-31')

  for (let i = 1; i <= count; i++) {
    const product   = randomChoice(PRODUCTS)
    const quantity  = randomInt(1, 5)
    const discount  = randomChoice([0, 0, 0, 5, 10, 15, 20]) // % discount
    const unitPrice = product.basePrice * (1 + (Math.random() * 0.2 - 0.1)) // ±10% variation
    const revenue   = round2(unitPrice * quantity * (1 - discount / 100))
    const cost      = round2(unitPrice * quantity * 0.55) // 55% cost ratio
    const profit    = round2(revenue - cost)
    const orderDate = randomDate(startDate, endDate)

    orders.push({
      orderId:       `ORD-${String(i).padStart(4, '0')}`,
      orderDate:     orderDate,
      month:         orderDate.toLocaleString('default', { month: 'long' }),
      quarter:       `Q${Math.ceil((orderDate.getMonth() + 1) / 3)}`,
      productName:   product.name,
      category:      product.category,
      quantity:      quantity,
      unitPrice:     round2(unitPrice),
      discount:      discount,
      revenue:       revenue,
      cost:          cost,
      profit:        profit,
      profitMargin:  round2((profit / revenue) * 100),
      city:          randomChoice(CITIES),
      paymentMethod: randomChoice(PAYMENT_METHODS),
      status:        randomChoice(STATUSES),
      rating:        round2(3 + Math.random() * 2), // 3.0 to 5.0
      returnFlag:    Math.random() < 0.08,            // 8% return rate
    })
  }

  // Sort by date ascending
  return orders.sort((a, b) => a.orderDate - b.orderDate)
}

// ── Insert into MongoDB ────────────────────────────────────────────────

async function seed() {
  console.log('🔌 Connecting to MongoDB…')
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected!')

    const db         = client.db(dbName)
    const collection = db.collection('sales')

    // Drop existing data so we start fresh
    const existing = await collection.countDocuments()
    if (existing > 0) {
      console.log(`🗑  Dropping ${existing} existing records…`)
      await collection.deleteMany({})
    }

    // Generate and insert
    console.log('⚙️  Generating 200 e-commerce orders…')
    const orders = generateOrders(200)

    console.log('📥 Inserting into MongoDB collection "sales"…')
    const result = await collection.insertMany(orders)
    console.log(`✅ Inserted ${result.insertedCount} records into "sales"`)

    // Print a sample record so you can see what it looks like
    console.log('\n📄 Sample record:')
    console.log(JSON.stringify(orders[0], null, 2))

    // Print summary stats
    const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0)
    const totalProfit  = orders.reduce((s, o) => s + o.profit,  0)
    console.log('\n📊 Data summary:')
    console.log(`   Total orders:  ${orders.length}`)
    console.log(`   Total revenue: ₹${Math.round(totalRevenue).toLocaleString()}`)
    console.log(`   Total profit:  ₹${Math.round(totalProfit).toLocaleString()}`)
    console.log(`   Categories:    ${[...new Set(orders.map(o => o.category))].join(', ')}`)
    console.log(`   Date range:    Jan 2024 → Dec 2024`)
    console.log('\n🎉 Seeding complete! Your MongoDB "sales" collection is ready.')
    console.log('   Now go to http://localhost:3000/dashboard')
    console.log('   Collection name to enter: sales')
    console.log('   KPIs to try: Revenue, Profit, Orders, Profit Margin')

  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await client.close()
  }
}

seed()