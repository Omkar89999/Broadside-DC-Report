import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const path = event.queryStringParameters.path || '';
    const solrUrl = `https://broadsidejumper2srv.emails.services/solr${path}`;

    const res = await fetch(solrUrl);
    const text = await res.text();

    return {
      statusCode: 200,
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
