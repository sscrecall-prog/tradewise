import { RawStockRow } from '../../types/tradepulse';

/**
 * Splits a CSV line properly respecting quoted values containing commas.
 * e.g. '"23,910.90","24,005.75",...' -> ['23,910.90', '24,005.75', ...]
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

/**
 * Cleans string into clean float: removes commas, quotes, % signs, handles "-" as 0.
 */
export function parseNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/,/g, '').replace(/%/g, '').replace(/"/g, '').trim();
  if (str === '-' || str === '' || str.toLowerCase() === 'nan') return 0;
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses full CSV string into structured RawStockRow objects.
 */
export function parseNiftyCsv(csvText: string): RawStockRow[] {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map(h => h.toUpperCase().trim());

  // Find column indexes
  const colIndex = {
    symbol: headers.findIndex(h => h.includes('SYMBOL')),
    open: headers.findIndex(h => h === 'OPEN'),
    high: headers.findIndex(h => h === 'HIGH'),
    low: headers.findIndex(h => h === 'LOW'),
    prevClose: headers.findIndex(h => h.includes('PREV')),
    ltp: headers.findIndex(h => h === 'LTP' || h.includes('LAST') || h.includes('CLOSE')),
    indicativeClose: headers.findIndex(h => h.includes('INDICATIVE')),
    change: headers.findIndex(h => h === 'CHANGE' || h === 'CHNG'),
    changePercent: headers.findIndex(h => h.includes('%') && (h.includes('CHANGE') || h.includes('CHNG')) && !h.includes('30') && !h.includes('365')),
    volume: headers.findIndex(h => h.includes('VOLUME')),
    valueCrores: headers.findIndex(h => h.includes('VALUE')),
    high52W: headers.findIndex(h => h.includes('52') && h.includes('HIGH')),
    low52W: headers.findIndex(h => h.includes('52') && h.includes('LOW')),
    change30D: headers.findIndex(h => h.includes('30') && h.includes('D')),
    change365D: headers.findIndex(h => h.includes('365') && h.includes('D')),
  };

  const rows: RawStockRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    if (values.length < 5) continue;

    const symbol = values[colIndex.symbol !== -1 ? colIndex.symbol : 0] || '';
    if (!symbol) continue;

    const open = parseNumber(values[colIndex.open !== -1 ? colIndex.open : 1]);
    const high = parseNumber(values[colIndex.high !== -1 ? colIndex.high : 2]);
    const low = parseNumber(values[colIndex.low !== -1 ? colIndex.low : 3]);
    const prevClose = parseNumber(values[colIndex.prevClose !== -1 ? colIndex.prevClose : 4]);
    const ltp = parseNumber(values[colIndex.ltp !== -1 ? colIndex.ltp : 5]);
    const indicativeClose = values[colIndex.indicativeClose !== -1 ? colIndex.indicativeClose : 6] || '-';
    const change = parseNumber(values[colIndex.change !== -1 ? colIndex.change : 7]);
    const changePercent = parseNumber(values[colIndex.changePercent !== -1 ? colIndex.changePercent : 8]);
    const volume = parseNumber(values[colIndex.volume !== -1 ? colIndex.volume : 9]);
    const valueCrores = parseNumber(values[colIndex.valueCrores !== -1 ? colIndex.valueCrores : 10]);
    const high52W = parseNumber(values[colIndex.high52W !== -1 ? colIndex.high52W : 11]);
    const low52W = parseNumber(values[colIndex.low52W !== -1 ? colIndex.low52W : 12]);
    const change30D = parseNumber(values[colIndex.change30D !== -1 ? colIndex.change30D : 13]);
    const change365D = parseNumber(values[colIndex.change365D !== -1 ? colIndex.change365D : 14]);

    rows.push({
      symbol: symbol.toUpperCase(),
      open,
      high,
      low,
      prevClose,
      ltp: ltp > 0 ? ltp : prevClose,
      indicativeClose,
      change,
      changePercent,
      volume,
      valueCrores,
      high52W,
      low52W,
      change30D,
      change365D
    });
  }

  return rows;
}
