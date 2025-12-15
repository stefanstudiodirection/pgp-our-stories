'use client';

import { useState } from 'react';
import { Story } from '@/lib/api/webflow';
import { StoryCard } from './StoryCard';
import { PAGINATION } from '@/lib/constants';

interface StoriesGridProps {
  stories: Story[];
}

export function StoriesGrid({ stories }: StoriesGridProps) {
  const [visibleCount, setVisibleCount] = useState<number>(PAGINATION.ITEMS_PER_PAGE);

  if (!stories.length) {
    return (
      <div className="stories-empty-state" role="status" aria-live="polite">
        <p className="par dark-gray">No stories are live at the moment.</p>
        <p className="par gray">Please check back soon for fresh highlights from our maisons.</p>
      </div>
    );
  }

  const visibleStories = stories.slice(0, visibleCount);
  const hasMore = visibleCount < stories.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + PAGINATION.ITEMS_PER_PAGE);
  };

  return (
    <>
      <div className="s__listwrap">
        <div id="storiesGrid" className="s__list" role="list">
          {visibleStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>

      {hasMore && (
        <div id="loadMoreContainer" className="load-more-container">
          <button
            onClick={loadMore}
            className="button w-inline-block"
          >
            <div className="button__text">Load More</div>
            <div className="button__iconwrap" style={{ backgroundColor: 'rgb(130, 102, 51)', color: 'rgb(255, 255, 255)' }}>
              <div className="button__icon w-embed">
                <svg width="13" height="6" viewBox="0 0 13 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.79995 5.10002V3.70002H0.699951V2.30002H9.79995V0.900024L13.475 3.00002L9.79995 5.10002Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </button>
        </div>
      )}
    </>
  );
}
