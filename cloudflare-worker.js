/**
 * CLOUDFLARE WORKER - Webflow Stories API Proxy
 *
 * DEPLOYMENT:
 * 1. Go to cloudflare.com → Workers & Pages
 * 2. Click "Create Worker"
 * 3. Copy this entire code
 * 4. Replace YOUR_WEBFLOW_API_TOKEN with your actual token
 * 5. Deploy
 * 6. Copy the worker URL (e.g., https://webflow-stories.your-subdomain.workers.dev)
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Webflow collection IDs - CORRECTED
      const COLLECTIONS = {
        'our-stories': '64e76dbbe94dbbf00a71619e',
        'messika': '64e76dbbe94dbbf00a716348',
        'roberto-coin': '64e76dbbe94dbbf00a716315',
        'timepieces': '64e76dbbe94dbbf00a716332',
        'rolex': '64e76dbbe94dbbf00a71635d',
      };

      // ⚠️ REPLACE THIS WITH YOUR ACTUAL WEBFLOW API TOKEN
      const WEBFLOW_API_TOKEN = 'YOUR_WEBFLOW_API_TOKEN';

      // Parse query parameters
      const url = new URL(request.url);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '12');

      console.log('Fetching stories from all collections...');

      // Fetch from all collections in parallel
      const fetchPromises = Object.entries(COLLECTIONS).map(async ([collectionKey, collectionId]) => {
        const response = await fetch(
          `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
              'accept-version': '1.0.0',
            },
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch collection ${collectionId}: ${response.status}`);
          return { items: [], collectionKey };
        }

        const data = await response.json();
        return { items: data.items || [], collectionKey };
      });

      // Wait for all requests to complete
      const results = await Promise.all(fetchPromises);

      // Combine all stories and add collection metadata
      let allStories = [];
      results.forEach((result) => {
        if (result.items && Array.isArray(result.items)) {
          // Add collection key to each item
          const itemsWithCollection = result.items.map(item => ({
            ...item,
            _collectionKey: result.collectionKey
          }));
          allStories.push(...itemsWithCollection);
        }
      });

      console.log(`Total stories fetched: ${allStories.length}`);

      // Sort by CMS date field (newest first)
      allStories.sort((a, b) => {
        const dateA = new Date(a.fieldData?.date || a.fieldData?.['published-date'] || a.lastPublished || a.createdOn).getTime();
        const dateB = new Date(b.fieldData?.date || b.fieldData?.['published-date'] || b.lastPublished || b.createdOn).getTime();
        return dateB - dateA;
      });

      // Apply pagination
      const total = allStories.length;
      const paginatedStories = allStories.slice(offset, offset + limit);

      console.log(`Returning ${paginatedStories.length} stories (offset: ${offset}, limit: ${limit})`);

      // Return response
      return new Response(
        JSON.stringify({
          items: paginatedStories,
          total: total,
          offset: offset,
          limit: limit,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
          },
        }
      );
    } catch (error) {
      console.error('Worker error:', error);

      return new Response(
        JSON.stringify({
          error: 'Failed to fetch stories',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
