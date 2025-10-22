const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const path = event.queryStringParameters?.path;

  if (!path) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing "path" query parameter' })
    };
  }

  const solrBaseUrls = {
    solr1: 'https://broadsidejumpersrv.emails.services/solr',
    solr2: 'https://broadsidejumper2srv.emails.services/solr',
    solr3: 'https://broadsidejumper3srv.emails.services/solr'
  };

  // Determine which Solr server
  let baseUrl = '';
  if (path.startsWith('/solr1')) baseUrl = solrBaseUrls.solr1;
  else if (path.startsWith('/solr2')) baseUrl = solrBaseUrls.solr2;
  else if (path.startsWith('/solr3')) baseUrl = solrBaseUrls.solr3;
  else return { statusCode: 400, body: 'Invalid path' };

  // Remove the /solrX prefix
  const endpoint = path.replace(/^\/solr[123]/, '');

  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const text = await response.text();

    // Forward as-is (Angular can parse JSON safely)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
