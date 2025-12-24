import { PrismaClient, Prisma } from '@prisma/client';
import { createWriteStream } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Currency symbol to ISO 4217 code mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  $: 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
  '₹': 'INR',
  C$: 'CAD',
  CA$: 'CAD',
  A$: 'AUD',
  AU$: 'AUD',
  NZ$: 'NZD',
  '₱': 'PHP',
  '₩': 'KRW',
  '฿': 'THB',
  '₫': 'VND',
  R$: 'BRL',
  '₽': 'RUB',
  CHF: 'CHF',
  kr: 'SEK',
  zł: 'PLN',
};

// ISO 4217 currency codes
const ISO_CODES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
  'INR',
  'MXN',
  'BRL',
  'ZAR',
  'NZD',
  'SGD',
  'HKD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'TRY',
  'THB',
  'PHP',
  'IDR',
  'MYR',
  'KRW',
  'RUB',
  'AED',
  'SAR',
  'ILS',
  'EGP',
  'VND',
];

export interface ParsedPrice {
  amount: string;
  currency: string | null;
}

/**
 * Parse a price string into amount and currency
 * @param priceString - Raw price string (e.g., "$19.99", "€29.99", "19.99 USD")
 * @returns Parsed price object or null if unparseable
 */
export function parsePrice(priceString: string | null): ParsedPrice | null {
  if (!priceString || typeof priceString !== 'string') {
    return null;
  }

  const trimmed = priceString.trim();
  if (!trimmed) {
    return null;
  }

  // Pattern 1: Currency code before amount (e.g., "USD 19.99", "EUR 29.99")
  // Check this first to avoid confusion with currency symbols
  const codeFirstRegex = /^([A-Z]{3})\s+([\d,]+\.?\d*)$/i;
  const codeFirstMatch = trimmed.match(codeFirstRegex);
  if (codeFirstMatch) {
    const code = codeFirstMatch[1].toUpperCase();
    const amount = codeFirstMatch[2].replace(/,/g, '');
    const currency = ISO_CODES.includes(code) ? code : null;
    return { amount, currency };
  }

  // Pattern 2: Amount with currency code after (e.g., "19.99 USD", "29.99 EUR")
  const codeAfterRegex = /^([\d,]+\.?\d*)\s+([A-Z]{3})$/i;
  const codeAfterMatch = trimmed.match(codeAfterRegex);
  if (codeAfterMatch) {
    const amount = codeAfterMatch[1].replace(/,/g, '');
    const code = codeAfterMatch[2].toUpperCase();
    const currency = ISO_CODES.includes(code) ? code : null;
    return { amount, currency };
  }

  // Pattern 3: Multi-character currency symbols at start (e.g., "C$19.99", "CA$19.99", "A$19.99")
  const multiSymbolFirstRegex = /^([CAR]{1,2}\$|NZ\$|AU\$)\s*([\d,]+\.?\d*)$/i;
  const multiSymbolFirstMatch = trimmed.match(multiSymbolFirstRegex);
  if (multiSymbolFirstMatch) {
    const symbol = multiSymbolFirstMatch[1].toUpperCase();
    const amount = multiSymbolFirstMatch[2].replace(/,/g, '');
    const currency = CURRENCY_SYMBOLS[symbol] || null;
    return { amount, currency };
  }

  // Pattern 4: Single currency symbol at start (e.g., "$19.99", "€29.99", "¥1500")
  const symbolFirstRegex = /^([€£¥₹₱₩฿₫₽$])\s*([\d,]+\.?\d*)$/;
  const symbolFirstMatch = trimmed.match(symbolFirstRegex);
  if (symbolFirstMatch) {
    const symbol = symbolFirstMatch[1];
    const amount = symbolFirstMatch[2].replace(/,/g, '');
    const currency = CURRENCY_SYMBOLS[symbol] || null;
    return { amount, currency };
  }

  // Pattern 5: Currency symbol at end (e.g., "19.99$", "29.99€")
  const symbolEndRegex = /^([\d,]+\.?\d*)\s*([€£¥₹₱₩฿₫₽$])$/;
  const symbolEndMatch = trimmed.match(symbolEndRegex);
  if (symbolEndMatch) {
    const amount = symbolEndMatch[1].replace(/,/g, '');
    const symbol = symbolEndMatch[2];
    const currency = CURRENCY_SYMBOLS[symbol] || null;
    return { amount, currency };
  }

  // Pattern 6: Just a number (e.g., "19.99", "20")
  const numberOnlyRegex = /^([\d,]+\.?\d*)$/;
  const numberOnlyMatch = trimmed.match(numberOnlyRegex);
  if (numberOnlyMatch) {
    const amount = numberOnlyMatch[1].replace(/,/g, '');
    return { amount, currency: null };
  }

  return null;
}

/**
 * Migrate existing price data
 */
async function migratePriceData() {
  console.log('Starting price data migration...\n');

  // Open CSV file for migration report
  const reportPath = path.join(process.cwd(), 'migration-report.csv');
  const reportStream = createWriteStream(reportPath);
  reportStream.write('Item ID,Original Price,Parsed Amount,Parsed Currency,Status,Note\n');

  let total = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Fetch all items with a price value
    const items = await prisma.wishlistItem.findMany({
      where: {
        price: {
          not: null,
        },
      },
      select: {
        id: true,
        price: true,
        priceAmount: true,
        priceCurrency: true,
      },
    });

    total = items.length;
    console.log(`Found ${total} items with price data\n`);

    for (const item of items) {
      // Skip if already migrated
      if (item.priceAmount !== null) {
        skipped++;
        reportStream.write(
          `"${item.id}","${item.price}","${item.priceAmount}","${item.priceCurrency}","SKIPPED","Already migrated"\n`
        );
        continue;
      }

      const parsed = parsePrice(item.price);

      if (parsed) {
        try {
          // Convert amount to Decimal
          const decimalAmount = new Prisma.Decimal(parsed.amount);

          // Update item with parsed values
          await prisma.wishlistItem.update({
            where: { id: item.id },
            data: {
              priceAmount: decimalAmount,
              priceCurrency: parsed.currency,
            },
          });

          migrated++;
          reportStream.write(
            `"${item.id}","${item.price}","${parsed.amount}","${parsed.currency || 'null'}","SUCCESS",""\n`
          );
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          reportStream.write(
            `"${item.id}","${item.price}","${parsed.amount}","${parsed.currency || 'null'}","FAILED","${errorMsg}"\n`
          );
        }
      } else {
        failed++;
        reportStream.write(
          `"${item.id}","${item.price}","","","FAILED","Could not parse price string"\n`
        );
      }
    }

    reportStream.end();

    console.log('\n=== Migration Summary ===');
    console.log(`Total items with price:     ${total}`);
    console.log(`Successfully migrated:      ${migrated}`);
    console.log(`Skipped (already migrated): ${skipped}`);
    console.log(`Failed to parse:            ${failed}`);
    console.log(`\nMigration report saved to: ${reportPath}`);

    if (failed > 0) {
      console.log(`\n⚠ ${failed} items could not be migrated. Please review the migration report.`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/');
if (isMainModule) {
  migratePriceData()
    .then(() => {
      console.log('\n✓ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Migration failed:', error);
      process.exit(1);
    });
}

export { migratePriceData };
