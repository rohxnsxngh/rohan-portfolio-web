/**
 * Calculate reading time for a piece of content
 * Average reading speed: 200-250 words per minute
 * Using 200 wpm for technical content
 */
export function calculateReadingTime(content: string): number {
  // Strip HTML tags and markdown syntax
  const text = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert links to just text
    .replace(/[#*_~]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  const words = text.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // 200 words per minute for technical content
  const minutes = Math.ceil(wordCount / 200);

  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  if (minutes === 1) {
    return '1 min read';
  }
  return `${minutes} min read`;
}
