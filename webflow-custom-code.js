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
  const API_BASE_URL = 'https://petite-geneve.webflow.io/rs-en/stories/api/stories';
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
   * Render a single story card
   */
  function createStoryCard(story) {
    const { fieldData, slug } = story;
    const storyUrl = `/rs-en/stories/${slug}`;

    // Determine collection/category
    let category = 'Our Stories';
    if (fieldData.category) {
      category = fieldData.category;
    }

    const card = document.createElement('div');
    card.className = 's__list-item';
    card.innerHTML = `
      <a href="${storyUrl}" class="stories__link w-inline-block">
        <div class="stories__imagewrap">
          ${fieldData.image?.url ? `
            <img
              src="${fieldData.image.url}"
              alt="${fieldData.image.alt || fieldData.name || 'Story image'}"
              class="stories__image"
              loading="lazy"
            />
          ` : ''}
        </div>
        <div class="stories-text-wrap">
          <p class="par dark-gray" data-i18n="${category}">${category}</p>
          <h3 class="h5">${fieldData.name || 'Untitled Story'}</h3>
        </div>
      </a>
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
