import { ContentMetadata } from '../../types/index.js';

/**
 * Formats the output as JSON
 */
export function formatAsJson(
  content: string, 
  metadata: ContentMetadata, 
  includeReadingTime: boolean
): string {
  const result: any = {
    ...metadata,
    content,
  };
  
  // Remove reading time if not requested
  if (!includeReadingTime) {
    delete result.readingTime;
  }
  
  return JSON.stringify(result, null, 2);
}
