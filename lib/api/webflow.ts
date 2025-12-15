import { CONFIG } from '../config';

// Tag ID to Name mapping from Webflow schema
const TAG_MAP: Record<string, string> = {
  '26e015fb5ad6a458a51c21502b20a968': 'Rolex',
  '1d969c9969d908dcdbc9e0a5ff97560e': 'Tudor',
  '92f3574988a20bdcd87ae49f0d397191': 'Roberto Coin',
  '15bf6fc00b43952c42dccc9645a372bc': 'Messika',
  'a31375b3a8df2fe7aad9d591e1828b54': 'Petrović Diamonds',
  'c2fc1ade67e96d9b6f53de00adab3635': 'Swiss Kubik',
  '2bc626e173b980f4ac8ffa63a770b6b8': 'Petite Geneve Petrović',
  '32a6732ea3c35edc7bf1fc94dbde051f': 'Boutique Belgrade',
  '11d155df25d184496c712dc68560cc4e': 'Boutique Budapest',
  '73154105964515051d6cca0407ef9abb': 'Boutique Porto Montenegro'
};

export interface Story {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imageAlt: string;
  brandName: string;
  collectionName: string;
  tag: string;
  slug: string;
  isDraft: boolean;
  isArchived: boolean;
}

interface WebflowItem {
  id: string;
  fieldData: Record<string, unknown>;
  isDraft?: boolean;
  isArchived?: boolean;
  _collectionName?: string;
}

interface ImageField {
  url?: string;
  alt?: string;
}

interface TagReference {
  name?: string;
}

const isImageField = (value: unknown): value is ImageField => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'url' in value || 'alt' in value;
};

const isTagReference = (value: unknown): value is TagReference => {
  return typeof value === 'object' && value !== null && 'name' in value;
};

const toStringOrFallback = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback;
};

/**
 * Webflow API Client
 * Handles all communication with Webflow CMS API
 */
class WebflowAPI {
  private baseURL = 'https://api.webflow.com/v2';
  private token: string;
  private headers: HeadersInit;

  constructor() {
    this.token = CONFIG.WEBFLOW_API_TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'accept-version': '1.0.0',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch items from a single collection
   * @param collectionId - Webflow collection ID
   * @returns Array of collection items
   */
  async fetchCollection(collectionId: string): Promise<WebflowItem[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/collections/${collectionId}/items?limit=${CONFIG.API_LIMIT}`,
        {
          method: 'GET',
          headers: this.headers,
          next: { revalidate: 60 } // Revalidate every 60 seconds
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch collection ${collectionId}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`Error fetching collection ${collectionId}:`, error);
      return [];
    }
  }

  /**
   * Fetch items from all configured collections
   * @returns Combined array of all items with collection metadata
   */
  async fetchAllCollections(): Promise<WebflowItem[]> {
    try {
      const promises = CONFIG.COLLECTIONS.map(collection =>
        this.fetchCollection(collection.id).then(items =>
          items.map(item => ({
            ...item,
            _collectionName: collection.name
          }))
        )
      );

      const results = await Promise.all(promises);
      const allItems = results.flat();

      console.log(`Fetched ${allItems.length} total items from ${CONFIG.COLLECTIONS.length} collections`);

      return allItems;
    } catch (error) {
      console.error('Error fetching all collections:', error);
      return [];
    }
  }

  /**
   * Transform raw Webflow item to standardized format
   * @param item - Raw Webflow CMS item
   * @returns Normalized story object
   */
  normalizeItem(item: WebflowItem): Story {
    const fieldData = item.fieldData || {};
    const mapping = CONFIG.FIELD_MAPPING;

    // Try multiple possible image fields with fallbacks
    const possibleImageFields = [
      mapping.image,           // grid-image
      'imge',                  // typo field from Webflow
      'background-image',      // desktop background
      'background-image-mobile' // mobile background
    ];

    let imageData: ImageField | null = null;
    for (const field of possibleImageFields) {
      const candidate = fieldData[field];
      if (typeof candidate === 'string') {
        imageData = { url: candidate };
        break;
      }

      if (isImageField(candidate)) {
        imageData = candidate;
        break;
      }
    }

    // Try multiple possible description/summary fields with fallbacks
    const possibleDescriptionFields = [
      mapping.description,                    // summary (from config)
      'small-description',                    // our-stories, messika, rolex
      'paragraph-on-the-our-stories-page',   // roberto coin
      'small description'                     // tudor (with space)
    ];

    let description = '';
    for (const field of possibleDescriptionFields) {
      const candidate = fieldData[field];
      if (typeof candidate === 'string') {
        description = candidate;
        break;
      }
    }

    // Get tag field for Our Stories collection
    // Tag field is an Option type with ID values that need to be mapped to names
    let tag = '';
    const rawTag = fieldData['tag'];
    if (isTagReference(rawTag) && rawTag.name) {
      tag = rawTag.name;
    } else if (typeof rawTag === 'string') {
      tag = TAG_MAP[rawTag] || rawTag;
    }

    // Use collection name as fallback for brand when brand field is undefined
    const brandName = toStringOrFallback(fieldData[mapping.brandName], item._collectionName || '');
    const title = toStringOrFallback(fieldData[mapping.title], 'Untitled');
    const slug = toStringOrFallback(fieldData[mapping.slug]);
    const explicitDate = toStringOrFallback(fieldData[mapping.date]);
    const fallbackDate = toStringOrFallback(fieldData['date']);
    const date = explicitDate || fallbackDate || new Date().toISOString();

    return {
      id: item.id,
      title,
      description,
      date,
      image: imageData?.url || '',
      imageAlt: toStringOrFallback(imageData?.alt),
      brandName: brandName,
      collectionName: item._collectionName || '',
      tag: tag,
      slug,
      isDraft: item.isDraft || false,
      isArchived: item.isArchived || false,
    };
  }

  /**
   * Fetch and normalize all stories
   * @returns Array of normalized story objects
   */
  async getAllStories(): Promise<Story[]> {
    const items = await this.fetchAllCollections();
    const normalizedStories = items.map(item => this.normalizeItem(item));

    const publishedStories = normalizedStories.filter(story => {
      const hasSlug = Boolean(story.slug);
      const isPublished = !story.isDraft && !story.isArchived;
      return hasSlug && isPublished;
    });

    const uniqueStories: Story[] = [];
    const seenSlugs = new Set<string>();

    for (const story of publishedStories) {
      const key = `${story.collectionName}:${story.slug}`;
      if (seenSlugs.has(key)) {
        continue;
      }

      seenSlugs.add(key);
      uniqueStories.push(story);
    }

    return uniqueStories;
  }
}

export const webflowAPI = new WebflowAPI();
