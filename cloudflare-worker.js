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
      // Webflow collection IDs
      const COLLECTIONS = {
        'our-stories': '674e5da2ab9e88cfe8f7e5e1',
        'messika': '674e5da2ab9e88cfe8f7e5de',
        'roberto-coin': '674e5da2ab9e88cfe8f7e5db',
        'timepieces': '674e5da2ab9e88cfe8f7e5d5',
        'rolex': '674e5da2ab9e88cfe8f7e5d8',
      };

      // ⚠️ REPLACE THIS WITH YOUR ACTUAL WEBFLOW API TOKEN
      const WEBFLOW_API_TOKEN = 'YOUR_WEBFLOW_API_TOKEN';

      // Parse query parameters
      const url = new URL(request.url);
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const limit = parseInt(url.searchParams.get('limit') || '12');

      console.log('Fetching stories from all collections...');

      // Fetch from all collections in parallel
      const fetchPromises = Object.values(COLLECTIONS).map(async (collectionId) => {
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
          return { items: [] };
        }

        return await response.json();
      });

      // Wait for all requests to complete
      const results = await Promise.all(fetchPromises);

      // Combine all stories
      let allStories = [];
      results.forEach((result) => {
        if (result.items && Array.isArray(result.items)) {
          allStories.push(...result.items);
        }
      });

      console.log(`Total stories fetched: ${allStories.length}`);

      // Sort by published date (newest first)
      allStories.sort((a, b) => {
        const dateA = new Date(a.lastPublished || a.createdOn).getTime();
        const dateB = new Date(b.lastPublished || b.createdOn).getTime();
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
