// Returns just the "data as of" date baked into data.json, so the page can
// show freshness without exposing any dealer data.
const data = require('./data.json');

exports.handler = async function () {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ asOf: data.asOf || null }),
  };
};
