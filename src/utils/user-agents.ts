import got from 'got';

/**
 * Interface for user agent data
 */
interface UserAgent {
  browser: string;
  os: string;
  userAgent: string;
}

/**
 * Cache for user agent data to avoid repeated fetches
 */
let userAgentCache: UserAgent[] | null = null;

/**
 * URL for user agent data
 */
const USER_AGENT_DATA_URL = 'https://jnrbsn.github.io/user-agents/user-agents.json';

/**
 * Fetches user agent data from the source
 */
async function fetchUserAgents(): Promise<UserAgent[]> {
  try {
    // Use cached data if available
    if (userAgentCache) {
      return userAgentCache;
    }

    // Fetch user agent data
    const response = await got(USER_AGENT_DATA_URL, {
      timeout: { request: 5000 },
      retry: { limit: 2 }
    });

    // Parse the response
    const userAgentStrings: string[] = JSON.parse(response.body);

    // Process the user agent strings to extract browser and OS information
    const userAgents: UserAgent[] = userAgentStrings.map(ua => {
      // Extract browser information
      let browser = 'unknown';
      if (ua.includes('Firefox/')) {
        browser = 'firefox';
      } else if (ua.includes('Chrome/')) {
        if (ua.includes('Edg/')) {
          browser = 'edge';
        } else if (ua.includes('OPR/')) {
          browser = 'opera';
        } else {
          browser = 'chrome';
        }
      } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        browser = 'safari';
      }

      // Extract OS information
      let os = 'unknown';
      if (ua.includes('Windows')) {
        os = 'windows';
      } else if (ua.includes('Macintosh')) {
        os = 'macos';
      } else if (ua.includes('Linux') && !ua.includes('Android')) {
        os = 'linux';
      } else if (ua.includes('Android')) {
        os = 'android';
      } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'ios';
      }

      return { browser, os, userAgent: ua };
    });

    // Cache the results
    userAgentCache = userAgents;
    return userAgents;
  } catch (error) {
    console.error('Failed to fetch user agent data:', error);
    // Return a default set of user agents if fetch fails
    return getDefaultUserAgents();
  }
}

/**
 * Returns a default set of user agents in case the fetch fails
 */
function getDefaultUserAgents(): UserAgent[] {
  return [
    {
      browser: 'chrome',
      os: 'windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    },
    {
      browser: 'firefox',
      os: 'windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
    },
    {
      browser: 'chrome',
      os: 'macos',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    },
    {
      browser: 'firefox',
      os: 'macos',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0'
    },
    {
      browser: 'chrome',
      os: 'linux',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    },
    {
      browser: 'firefox',
      os: 'linux',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0'
    }
  ];
}

/**
 * Gets a user agent string based on browser-OS combination
 * @param userAgentSpec - Browser-OS combination (e.g., 'firefox-linux') or a custom user agent string
 */
export async function getUserAgent(userAgentSpec: string): Promise<string> {
  // If it doesn't contain a dash, assume it's a custom user agent string
  if (!userAgentSpec.includes('-')) {
    return userAgentSpec;
  }

  // Parse browser-OS combination
  const [browser, os] = userAgentSpec.toLowerCase().split('-');
  
  // Fetch user agents
  const userAgents = await fetchUserAgents();
  
  // Find matching user agent
  const matchingUserAgents = userAgents.filter(ua => 
    ua.browser === browser && ua.os === os
  );
  
  // Return the first matching user agent, or a default if none found
  if (matchingUserAgents.length > 0) {
    return matchingUserAgents[0].userAgent;
  }
  
  // If no match found, try to find a user agent with just the browser
  const browserMatches = userAgents.filter(ua => ua.browser === browser);
  if (browserMatches.length > 0) {
    return browserMatches[0].userAgent;
  }
  
  // If still no match, return a default user agent
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
}

/**
 * Gets available browser-OS combinations
 */
export async function getAvailableBrowserOsCombinations(): Promise<string[]> {
  const userAgents = await fetchUserAgents();
  
  // Get unique browser-OS combinations
  const combinations = new Set<string>();
  userAgents.forEach(ua => {
    if (ua.browser !== 'unknown' && ua.os !== 'unknown') {
      combinations.add(`${ua.browser}-${ua.os}`);
    }
  });
  
  return Array.from(combinations).sort();
}
