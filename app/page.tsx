import { webflowAPI } from '@/lib/api/webflow';
import { StoriesGrid } from '@/components/StoriesGrid';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function StoriesPage() {
  const stories = await webflowAPI.getAllStories();

  // Sort by date (newest first)
  const sortedStories = stories.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <section className="o-section other-news">
      <div className="o-container">
        {/* Section Header */}
        <div className="section-header">
          <h1>Our Stories</h1>
          <p>Discover the latest news, events, and stories from the world of luxury jewelry</p>
        </div>

        {/* Stories Grid */}
        <StoriesGrid stories={sortedStories} />
      </div>
    </section>
  );
}
