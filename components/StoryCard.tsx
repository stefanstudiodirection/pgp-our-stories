import Image from 'next/image';
import Link from 'next/link';
import { Story } from '@/lib/api/webflow';
import { IMAGE_FALLBACK } from '@/lib/constants';

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  const date = new Date(story.date);
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const storyUrl = `/rs-en/${story.brandName ? story.brandName.toLowerCase().replace(/\s+/g, '-') : 'our'}-stories/${story.slug}`;
  const imageSrc = story.image || IMAGE_FALLBACK.STORY;
  const altText = story.imageAlt || story.title || 'Story image';

  // Determine display label based on collection name or brand
  let displayLabel = '';

  // Check collection name or brand name to determine display
  const brandOrCollection = (story.brandName || story.collectionName || '').toLowerCase();

  if (brandOrCollection.includes('messika')) {
    displayLabel = 'Messika';
  } else if (brandOrCollection.includes('roberto') || brandOrCollection.includes('coin')) {
    displayLabel = 'Roberto Coin';
  } else if (brandOrCollection.includes('timepiece') || brandOrCollection.includes('tudor')) {
    displayLabel = 'Tudor';
  } else if (brandOrCollection.includes('rolex')) {
    displayLabel = 'Rolex';
  } else if (brandOrCollection.includes('our stories')) {
    // Our Stories collection - use Tag field
    displayLabel = story.tag || '';
  } else {
    // Fallback to tag or brand name
    displayLabel = story.tag || story.brandName || '';
  }

  return (
    <div role="listitem" className="s__list-item w-dyn-item">
      <Link
        aria-label="Read more about this story"
        href={storyUrl}
        className="stories__imagewrap w-inline-block"
        style={{ position: 'relative' }}
      >
        <Image
          src={imageSrc}
          alt={altText}
          sizes="(max-width: 991px) 100vw, 83vw"
          fill
          className="image cover abs"
          priority={false}
        />
      </Link>
      <div id="w-node-_416a8728-29ab-cc3a-a8f9-f07f40d57e73-0a716272" className="stories__content">
        <div className="flex gap16 center mbm">
          {displayLabel && <div className="par gray">{displayLabel}</div>}
          {displayLabel && <div className="divider"></div>}
          <div className="flex gap4">
            <div className="par gray">{month}</div>
            <div className="flex">
              <div className="par gray">{day}</div>
              <div className="par gray">,&nbsp;</div>
              <div className="par gray">{year}</div>
            </div>
          </div>
        </div>
        <h2 className="stories__content-h2 mbxs">{story.title}</h2>
        <p className="par dark-gray mbs">{story.description}</p>
        <p className="stories__content-date">{`${month} ${day}, ${year}`}</p>
        <div className="stories__content-cta">
          <Link href={storyUrl} className="button w-inline-block">
            <div className="button__text">Read more</div>
            <div className="button__iconwrap" style={{ backgroundColor: 'rgb(130, 102, 51)', color: 'rgb(255, 255, 255)' }}>
              <div className="button__icon w-embed" style={{ transform: 'translate3d(0%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d' }}>
                <svg width="13" height="6" viewBox="0 0 13 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.79995 5.10002V3.70002H0.699951V2.30002H9.79995V0.900024L13.475 3.00002L9.79995 5.10002Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </Link>
          <Link href={storyUrl} className="button-light hide w-inline-block">
            <div className="button-light__text">Read more</div>
            <div style={{ backgroundColor: 'rgb(130, 102, 51)', color: 'rgb(255, 255, 255)' }} className="button-light__iconwrap">
              <div style={{ transform: 'translate3d(0%, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d' }} className="button-light__icon w-embed">
                <svg width="13" height="6" viewBox="0 0 13 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.79995 5.10002V3.70002H0.699951V2.30002H9.79995V0.900024L13.475 3.00002L9.79995 5.10002Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="stories__bgimage">
        <Image
          src={imageSrc}
          alt={altText}
          sizes="100vw"
          fill
          className="high-story__bg"
          priority={false}
        />
        <div className="high-story__gradient"></div>
        <div className="high-story__block"></div>
        <div className="high-story__overlay"></div>
      </div>
    </div>
  );
}
