/**
 * WEBFLOW CUSTOM CODE - Stories Integration
 *
 * USAGE:
 * 1. Create a page in Webflow Designer at /rs-en/stories
 * 2. Add a div with id="stories-container" where you want stories to appear
 * 3. Add a button with id="load-more-btn" for load more functionality
 * 4. Add this code in Page Settings > Custom Code > Before </body>
 */

(function() {
  // Configuration
  const API_BASE_URL = 'https://webflow-stories.web-migration.workers.dev';
  const ITEMS_PER_PAGE = 12;
  let currentOffset = 0;
  let isLoading = false;
  let hasMore = true;

  // Get DOM elements
  const container = document.getElementById('stories-container');
  const loadMoreBtn = document.getElementById('load-more-btn');

  if (!container) {
    console.error('Stories container not found. Add <div id="stories-container"></div> to your page.');
    return;
  }

  /**
   * Fetch stories from API
   */
  async function fetchStories(offset = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}?all=true&offset=${offset}&limit=${ITEMS_PER_PAGE}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      return null;
    }
  }

  /**
   * Determine collection type from story data
   */
  function getCollectionInfo(story) {
    const { fieldData, cmsLocaleId } = story;

    // Collection mapping based on structure
    // Check which collection this story belongs to
    const collectionMap = {
      'our-stories': { path: 'our-stories', name: 'Our Stories' },
      'messika': { path: 'messika-stories', name: 'Messika' },
      'roberto-coin': { path: 'roberto-coin-stories', name: 'Roberto Coin' },
      'timepieces': { path: 'timepieces-stories', name: 'Timepieces' },
      'rolex': { path: 'rolex-stories', name: 'Rolex' }
    };

    // Try to detect collection from field data or other indicators
    // You may need to adjust this based on your actual data structure
    let collectionKey = 'our-stories';
    let categoryName = 'Our Stories';

    // If there's a tag field with a name, use it for category (Our Stories collection)
    if (fieldData.tag && fieldData.tag.name) {
      categoryName = fieldData.tag.name;
    }

    // TODO: Add logic to detect which collection based on story data
    // For now, using a simple approach - you'll need to refine this

    const collection = collectionMap[collectionKey];
    return {
      path: collection.path,
      category: categoryName
    };
  }

  /**
   * Render a single story card matching Webflow structure
   */
  function createStoryCard(story) {
    const { fieldData, slug, lastPublished } = story;

    const collectionInfo = getCollectionInfo(story);
    const storyUrl = `/rs-en/${collectionInfo.path}/${slug}`;

    // Get image URL - try multiple possible fields
    const imageUrl = fieldData.imge?.url ||
                     fieldData['grid-image']?.url ||
                     fieldData.image?.url ||
                     '';

    // Format date
    const dateObj = new Date(lastPublished || fieldData.date || fieldData['published-date']);
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const formattedDate = `${month} ${day}, ${year}`;

    const card = document.createElement('div');
    card.className = 's__list-item w-dyn-item';
    card.setAttribute('role', 'listitem');

    card.innerHTML = `
      <a aria-label="Read more about this story" href="${storyUrl}" class="stories__imagewrap w-inline-block">
        <img loading="lazy"
             src="${imageUrl}"
             alt="${fieldData.name || ''}"
             sizes="(max-width: 991px) 100vw, 83vw"
             class="image cover abs">
      </a>
      <div id="w-node-_416a8728-29ab-cc3a-a8f9-f07f40d57e73-0a716272" class="stories__content">
        <div class="flex gap16 center mbm">
          <div class="par gray" data-i18n="${collectionInfo.category}">${collectionInfo.category}</div>
          <div class="divider"></div>
          <div class="flex gap4">
            <div class="par gray" data-i18n="${month}">${month}</div>
            <div class="flex">
              <div class="par gray" data-i18n="${day}">${day}</div>
              <div class="par gray">,&nbsp;</div>
              <div class="par gray" data-i18n="${year}">${year}</div>
            </div>
          </div>
        </div>
        <h2 class="stories__content-h2 mbxs" data-i18n="${fieldData.name}">${fieldData.name || 'Untitled'}</h2>
        <p class="par dark-gray mbs" data-i18n="${fieldData['small-description'] || ''}">${fieldData['small-description'] || ''}</p>
        <p fs-cmssort-type="date" fs-cmssort-field="date" class="stories__content-date" data-i18n="${formattedDate}">${formattedDate}</p>
        <div class="stories__content-cta">
          <a href="${storyUrl}" class="button w-inline-block">
            <div class="button__text" data-i18n="Read more">Read more</div>
            <div class="button__iconwrap" style="background-color: rgb(130, 102, 51); color: rgb(255, 255, 255);">
              <div class="button__icon w-embed" style="transform: translate3d(0%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;">
                <svg width="13" height="6" viewBox="0 0 13 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.79995 5.10002V3.70002H0.699951V2.30002H9.79995V0.900024L13.475 3.00002L9.79995 5.10002Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div class="stories__bgimage">
        <img loading="lazy"
             src="${imageUrl}"
             alt=""
             sizes="100vw"
             class="high-story__bg">
        <div class="high-story__gradient"></div>
        <div class="high-story__block"></div>
        <div class="high-story__overlay"></div>
      </div>
    `;

    return card;
  }

  /**
   * Render stories to container
   */
  function renderStories(stories) {
    if (!stories || stories.length === 0) {
      if (currentOffset === 0) {
        container.innerHTML = `
          <div class="stories-empty-state">
            <p class="par">No stories available at the moment.</p>
          </div>
        `;
      }
      return;
    }

    const fragment = document.createDocumentFragment();
    stories.forEach(story => {
      const card = createStoryCard(story);
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  /**
   * Load more stories
   */
  async function loadMore() {
    if (isLoading || !hasMore) return;

    isLoading = true;

    // Update button state
    if (loadMoreBtn) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';
      loadMoreBtn.classList.add('is-loading');
    }

    const data = await fetchStories(currentOffset);

    if (data && data.items) {
      renderStories(data.items);
      currentOffset += data.items.length;

      // Check if there are more stories
      if (currentOffset >= data.total || data.items.length < ITEMS_PER_PAGE) {
        hasMore = false;
        if (loadMoreBtn) {
          loadMoreBtn.style.display = 'none';
        }
      }
    } else {
      hasMore = false;
    }

    isLoading = false;

    // Reset button state
    if (loadMoreBtn) {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
      loadMoreBtn.classList.remove('is-loading');
    }

    // Re-apply i18n translations if you're using a translation library
    if (window.applyTranslations) {
      window.applyTranslations();
    }
  }

  /**
   * Initialize - Load first batch of stories
   */
  async function init() {
    console.log('Initializing stories...');

    // Show loading state
    container.innerHTML = `
      <div class="stories-loading">
        <p class="par">Loading stories...</p>
      </div>
    `;

    await loadMore();

    // Attach load more button event
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', loadMore);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
