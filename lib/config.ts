// Configuration for Webflow API and collections
export const CONFIG = {
  // Webflow API Configuration
  WEBFLOW_API_TOKEN: process.env.WEBFLOW_API_TOKEN || '',
  WEBFLOW_SITE_ID: process.env.WEBFLOW_SITE_ID || '',

  // CMS Collection IDs
  COLLECTIONS: [
    {
      id: '64e76dbbe94dbbf00a71619e',
      name: 'Our Stories'
    },
    {
      id: '64e76dbbe94dbbf00a716348',
      name: 'Messika Stories'
    },
    {
      id: '64e76dbbe94dbbf00a716315',
      name: 'Roberto Coin Stories'
    },
    {
      id: '64e76dbbe94dbbf00a716332',
      name: 'Timepieces Stories'
    },
    {
      id: '64e76dbbe94dbbf00a71635d',
      name: 'Rolex Stories'
    }
  ],

  // Field Mappings
  FIELD_MAPPING: {
    title: 'name',
    description: 'summary',
    date: 'published-date',
    image: 'grid-image',
    brandName: 'brand',
    slug: 'slug'
  },

  // API Settings
  API_LIMIT: 100,
} as const;
