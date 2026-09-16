export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { symbol, path, range = '1d', interval = '5m' } = req.query || {};

    let targetUrl = '';
    if (symbol) {
      targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    } else if (path) {
      const pathStr = Array.isArray(path) ? path.join('/') : path;
      targetUrl = `https://query1.finance.yahoo.com/${pathStr}`;
    } else {
      // Default query for NIFTY 50
      targetUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=1d&interval=5m';
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: `Upstream error ${upstreamRes.status}` });
    }

    const data = await upstreamRes.json();
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=45');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
