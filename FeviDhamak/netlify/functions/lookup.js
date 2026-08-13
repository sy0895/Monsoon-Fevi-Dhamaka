// Fevi Dhamaka dealer lookup — returns only the one matching dealer's record,
// never the full dataset. data.json is bundled with this function and is not
// part of the publicly served "public/" folder, so it has no public URL.
const data = require('./data.json');

const ZONE_SHORT = {
  'CPASF EAST': 'East',
  'CPASF WEST': 'West',
  'CPASF NORTH': 'North',
  'CPASF SOUTH': 'South',
};

const BANDS = {
  'CPASF EAST':  { Silver: '1–8',  Gold: '9–35',  Platinum: '36 and above' },
  'CPASF WEST':  { Silver: '1–10', Gold: '11–60', Platinum: '61 and above' },
  'CPASF NORTH': { Silver: '1–20', Gold: '21–70', Platinum: '71 and above' },
  'CPASF SOUTH': { Silver: '1–10', Gold: '11–35', Platinum: '36 and above' },
};

// Build the index once per cold start, not per request.
const index = new Map();
for (const row of data.rows) {
  index.set(row[0], row);
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const rawCode = (event.queryStringParameters && event.queryStringParameters.code) || '';
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return { statusCode: 400, headers, body: JSON.stringify({ found: false, error: 'missing code' }) };
  }

  const row = index.get(code);
  if (!row) {
    return { statusCode: 200, headers, body: JSON.stringify({ found: false }) };
  }

  const [dealerCode, name, zoneIdx, clusterIdx, tickets, tierIdx] = row;
  const zoneFull = data.zones[zoneIdx];
  const tierName = data.tiers[tierIdx]; // null | 'Silver' | 'Gold' | 'Platinum'
  const band = BANDS[zoneFull];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      found: true,
      code: dealerCode,
      name: name || null,
      cluster: data.clusters[clusterIdx],
      zoneFull,
      zoneShort: ZONE_SHORT[zoneFull] || zoneFull,
      tickets,
      tier: tierName,
      bandLabel: tierName ? band[tierName] : null,
    }),
  };
};
