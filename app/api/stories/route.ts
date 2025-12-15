import { NextRequest, NextResponse } from 'next/server';

// Collection IDs
const COLLECTIONS = {
  'our-stories': '674e5da2ab9e88cfe8f7e5e1',
  'messika': '674e5da2ab9e88cfe8f7e5de',
  'roberto-coin': '674e5da2ab9e88cfe8f7e5db',
  'timepieces': '674e5da2ab9e88cfe8f7e5d5',
  'rolex': '674e5da2ab9e88cfe8f7e5d8',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const offset = searchParams.get('offset') || '0';
  const limit = searchParams.get('limit') || '100';
  const allCollections = searchParams.get('all') === 'true';

  try {
    let allStories: any[] = [];

    if (allCollections) {
      // Fetch from all collections
      const promises = Object.values(COLLECTIONS).map(async (collectionId) => {
        const response = await fetch(
          `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
              'accept-version': '1.0.0',
            },
            next: { revalidate: 300 }, // Cache for 5 minutes
          }
        );

        if (!response.ok) {
          console.error(`Failed to fetch collection ${collectionId}:`, response.statusText);
          return { items: [] };
        }

        return await response.json();
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        if (result.items) {
          allStories.push(...result.items);
        }
      });

      // Sort by published date (newest first)
      allStories.sort((a, b) => {
        const dateA = new Date(a.lastPublished || a.createdOn).getTime();
        const dateB = new Date(b.lastPublished || b.createdOn).getTime();
        return dateB - dateA;
      });

      // Apply pagination
      const start = parseInt(offset);
      const end = start + parseInt(limit);
      const paginatedStories = allStories.slice(start, end);

      return NextResponse.json(
        {
          items: paginatedStories,
          total: allStories.length,
          offset: parseInt(offset),
          limit: parseInt(limit),
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    } else {
      // Fetch from single collection
      const collectionId = collection && COLLECTIONS[collection as keyof typeof COLLECTIONS];

      if (!collectionId) {
        return NextResponse.json(
          { error: 'Invalid collection name' },
          { status: 400 }
        );
      }

      const response = await fetch(
        `https://api.webflow.com/v2/collections/${collectionId}/items?offset=${offset}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
            'accept-version': '1.0.0',
          },
          next: { revalidate: 300 },
        }
      );

      if (!response.ok) {
        throw new Error(`Webflow API error: ${response.statusText}`);
      }

      const data = await response.json();

      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
