import { describe, it, expect } from 'vitest';
import { parsePrice } from './migrate-price-data';

describe('Price Parser', () => {
  describe('Currency symbol at start', () => {
    it('should parse USD dollar format', () => {
      expect(parsePrice('$19.99')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice('$ 19.99')).toEqual({ amount: '19.99', currency: 'USD' });
    });

    it('should parse EUR euro format', () => {
      expect(parsePrice('€29.99')).toEqual({ amount: '29.99', currency: 'EUR' });
      expect(parsePrice('€ 29.99')).toEqual({ amount: '29.99', currency: 'EUR' });
    });

    it('should parse GBP pound format', () => {
      expect(parsePrice('£45.50')).toEqual({ amount: '45.50', currency: 'GBP' });
      expect(parsePrice('£ 45.50')).toEqual({ amount: '45.50', currency: 'GBP' });
    });

    it('should parse JPY yen format', () => {
      expect(parsePrice('¥1500')).toEqual({ amount: '1500', currency: 'JPY' });
      expect(parsePrice('¥ 1500')).toEqual({ amount: '1500', currency: 'JPY' });
    });

    it('should parse CAD dollar format', () => {
      expect(parsePrice('C$19.99')).toEqual({ amount: '19.99', currency: 'CAD' });
      expect(parsePrice('CA$25.00')).toEqual({ amount: '25.00', currency: 'CAD' });
    });

    it('should parse AUD dollar format', () => {
      expect(parsePrice('A$19.99')).toEqual({ amount: '19.99', currency: 'AUD' });
      expect(parsePrice('AU$25.00')).toEqual({ amount: '25.00', currency: 'AUD' });
    });

    it('should parse INR rupee format', () => {
      expect(parsePrice('₹999')).toEqual({ amount: '999', currency: 'INR' });
    });
  });

  describe('Currency code formats', () => {
    it('should parse amount with currency code after', () => {
      expect(parsePrice('19.99 USD')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice('29.99 EUR')).toEqual({ amount: '29.99', currency: 'EUR' });
      expect(parsePrice('1500 JPY')).toEqual({ amount: '1500', currency: 'JPY' });
    });

    it('should parse currency code before amount', () => {
      expect(parsePrice('USD 19.99')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice('EUR 29.99')).toEqual({ amount: '29.99', currency: 'EUR' });
      expect(parsePrice('GBP 45.50')).toEqual({ amount: '45.50', currency: 'GBP' });
    });

    it('should handle lowercase currency codes', () => {
      expect(parsePrice('19.99 usd')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice('eur 29.99')).toEqual({ amount: '29.99', currency: 'EUR' });
    });
  });

  describe('Number only formats', () => {
    it('should parse plain numbers without currency', () => {
      expect(parsePrice('19.99')).toEqual({ amount: '19.99', currency: null });
      expect(parsePrice('20')).toEqual({ amount: '20', currency: null });
      expect(parsePrice('1500')).toEqual({ amount: '1500', currency: null });
    });
  });

  describe('Currency symbol at end', () => {
    it('should parse amount with symbol at end', () => {
      expect(parsePrice('19.99$')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice('29.99€')).toEqual({ amount: '29.99', currency: 'EUR' });
      expect(parsePrice('45.50£')).toEqual({ amount: '45.50', currency: 'GBP' });
    });
  });

  describe('Thousands separator handling', () => {
    it('should handle comma thousands separator', () => {
      expect(parsePrice('$1,234.56')).toEqual({ amount: '1234.56', currency: 'USD' });
      expect(parsePrice('€1,000.00')).toEqual({ amount: '1000.00', currency: 'EUR' });
      expect(parsePrice('1,500 USD')).toEqual({ amount: '1500', currency: 'USD' });
    });
  });

  describe('Edge cases', () => {
    it('should return null for null input', () => {
      expect(parsePrice(null)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parsePrice('')).toBeNull();
      expect(parsePrice('   ')).toBeNull();
    });

    it('should return null for unparseable strings', () => {
      expect(parsePrice('invalid')).toBeNull();
      expect(parsePrice('free')).toBeNull();
      expect(parsePrice('abc123')).toBeNull(); // Mixed alphanumeric is invalid
    });

    it('should parse amount but return null currency for invalid currency codes', () => {
      // Parser extracts amount even if currency code is invalid
      const result = parsePrice('19.99 XXX');
      expect(result).toEqual({ amount: '19.99', currency: null });
    });

    it('should handle zero amounts', () => {
      expect(parsePrice('$0.00')).toEqual({ amount: '0.00', currency: 'USD' });
      expect(parsePrice('0')).toEqual({ amount: '0', currency: null });
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace', () => {
      expect(parsePrice('  $19.99  ')).toEqual({ amount: '19.99', currency: 'USD' });
      expect(parsePrice(' 19.99 USD ')).toEqual({ amount: '19.99', currency: 'USD' });
    });
  });
});
