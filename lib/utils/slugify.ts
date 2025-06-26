/**
 * Convert a string to a URL-safe slug
 * Examples:
 * "Daily Walk" -> "daily-walk"
 * "Read Book for 30 min" -> "read-book-for-30-min"
 * "Call Mom & Dad" -> "call-mom-and-dad"
 * "Méditation" -> "meditation"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace special characters with words
    .replace(/&/g, 'and')
    .replace(/@/g, 'at')
    .replace(/%/g, 'percent')
    .replace(/\+/g, 'plus')
    .replace(/=/g, 'equals')
    // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces or hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Convert a slug back to a display name (best effort)
 * Examples:
 * "daily-walk" -> "Daily Walk"
 * "read-book-for-30-min" -> "Read Book For 30 Min"
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Find an activity by slug from a list of activities
 * Uses case-insensitive matching and handles slug variations
 */
export function findActivityBySlug(activities: Array<{ title: string }>, slug: string): { title: string } | null {
  const targetSlug = slug.toLowerCase();
  
  // First try exact slug match
  for (const activity of activities) {
    if (slugify(activity.title) === targetSlug) {
      return activity;
    }
  }
  
  // If no exact match, try partial matching for flexibility
  for (const activity of activities) {
    const activitySlug = slugify(activity.title);
    if (activitySlug.includes(targetSlug) || targetSlug.includes(activitySlug)) {
      return activity;
    }
  }
  
  return null;
}