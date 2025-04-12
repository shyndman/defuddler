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
 * Interface for crawler user agent data
 */
interface CrawlerUserAgent {
  pattern: string;
  url?: string;
  instances: string[];
  addition_date?: string;
  description?: string;
}

/**
 * Cache for user agent data to avoid repeated fetches
 */
let userAgentCache: UserAgent[] | null = null;
let crawlerUserAgentCache: Record<string, string> | null = null;

/**
 * URLs for user agent data
 */
const USER_AGENT_DATA_URL = 'https://jnrbsn.github.io/user-agents/user-agents.json';
const CRAWLER_USER_AGENT_DATA_URL =
  'https://raw.githubusercontent.com/monperrus/crawler-user-agents/master/crawler-user-agents.json';

/**
 * Selected crawler types to include
 */
const SELECTED_CRAWLERS = [
  { name: 'googlebot', pattern: 'Googlebot' },
  { name: 'bingbot', pattern: 'Bingbot' },
  { name: 'yahoo', pattern: 'Slurp' },
  { name: 'duckduckgo', pattern: 'DuckDuckBot' },
  { name: 'twitter', pattern: 'Twitterbot' },
  { name: 'facebook', pattern: 'facebookexternalhit' },
  { name: 'linkedin', pattern: 'LinkedInBot' },
  { name: 'feedly', pattern: 'Feedly' },
  { name: 'feedbin', pattern: 'Feedbin' },
  { name: 'ahrefs', pattern: 'AhrefsBot' },
  { name: 'semrush', pattern: 'SemrushBot' },
];

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
      retry: { limit: 2 },
    });

    // Parse the response
    const userAgentStrings: string[] = JSON.parse(response.body);

    // Process the user agent strings to extract browser and OS information
    const userAgents: UserAgent[] = userAgentStrings.map((ua) => {
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
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
    {
      browser: 'firefox',
      os: 'windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    },
    {
      browser: 'chrome',
      os: 'macos',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
    {
      browser: 'firefox',
      os: 'macos',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    },
    {
      browser: 'chrome',
      os: 'linux',
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
    {
      browser: 'firefox',
      os: 'linux',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
    },
  ];
}

/**
 * Returns a default set of crawler user agents in case the fetch fails
 */
function getDefaultCrawlerUserAgents(): Record<string, string> {
  return {
    googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bingbot: 'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    yahoo: 'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
    duckduckgo: 'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
    twitter: 'Twitterbot/1.0',
    facebook: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    linkedin:
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1 +http://www.linkedin.com)',
    feedly: 'Mozilla/5.0 (compatible; Feedlybot/1.0; http://feedly.com/fetcher.html)',
    feedbin: 'Feedbin feed-id:1 - 1 subscribers',
    ahrefs: 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    semrush: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
  };
}

/**
 * Fetches crawler user agent data from the source
 */
async function fetchCrawlerUserAgents(): Promise<Record<string, string>> {
  try {
    // Use cached data if available
    if (crawlerUserAgentCache) {
      return crawlerUserAgentCache;
    }

    // Fetch crawler user agent data
    const response = await got(CRAWLER_USER_AGENT_DATA_URL, {
      timeout: { request: 5000 },
      retry: { limit: 2 },
    });

    // Parse the response
    const crawlerData: CrawlerUserAgent[] = JSON.parse(response.body);

    // Create a map of crawler name to user agent string
    const crawlerMap: Record<string, string> = {};

    // Process each selected crawler
    SELECTED_CRAWLERS.forEach(({ name, pattern }) => {
      // Find the crawler in the data
      const crawler = crawlerData.find((c) => c.pattern.includes(pattern));
      if (crawler && crawler.instances && crawler.instances.length > 0) {
        // Use the first instance as the user agent
        crawlerMap[name] = crawler.instances[0];
      }
    });

    // Cache the results
    crawlerUserAgentCache = crawlerMap;
    return crawlerMap;
  } catch (error) {
    console.error('Failed to fetch crawler user agent data:', error);
    // Return a default set of crawler user agents if fetch fails
    return getDefaultCrawlerUserAgents();
  }
}

/**
 * Gets a user agent string based on browser-OS combination or crawler type
 * @param userAgentSpec - Browser-OS combination (e.g., 'firefox-linux'), crawler type (e.g., 'crawler-googlebot'), or a custom user agent string
 */
export async function getUserAgent(userAgentSpec: string): Promise<string> {
  // If it doesn't contain a dash, assume it's a custom user agent string
  if (!userAgentSpec.includes('-')) {
    return userAgentSpec;
  }

  // Check if it's a crawler specification
  if (userAgentSpec.startsWith('crawler-')) {
    const crawlerName = userAgentSpec.substring(8); // Remove 'crawler-' prefix
    const crawlerUserAgents = await fetchCrawlerUserAgents();

    if (crawlerUserAgents[crawlerName]) {
      return crawlerUserAgents[crawlerName];
    }

    // If crawler not found, return a default crawler user agent
    return getDefaultCrawlerUserAgents().googlebot;
  }

  // Parse browser-OS combination
  const [browser, os] = userAgentSpec.toLowerCase().split('-');

  // Fetch user agents
  const userAgents = await fetchUserAgents();

  // Find matching user agent
  const matchingUserAgents = userAgents.filter((ua) => ua.browser === browser && ua.os === os);

  // Return the first matching user agent, or a default if none found
  if (matchingUserAgents.length > 0) {
    return matchingUserAgents[0].userAgent;
  }

  // If no match found, try to find a user agent with just the browser
  const browserMatches = userAgents.filter((ua) => ua.browser === browser);
  if (browserMatches.length > 0) {
    return browserMatches[0].userAgent;
  }

  // If still no match, return a default user agent
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
}

/**
 * Gets available browser-OS combinations and crawler types
 */
export async function getAvailableBrowserOsCombinations(): Promise<string[]> {
  // Get browser-OS combinations
  const userAgents = await fetchUserAgents();

  // Get unique browser-OS combinations
  const combinations = new Set<string>();
  userAgents.forEach((ua) => {
    if (ua.browser !== 'unknown' && ua.os !== 'unknown') {
      combinations.add(`${ua.browser}-${ua.os}`);
    }
  });

  // Get crawler user agents
  const crawlerUserAgents = await fetchCrawlerUserAgents();

  // Add crawler types
  Object.keys(crawlerUserAgents).forEach((crawlerName) => {
    combinations.add(`crawler-${crawlerName}`);
  });

  return Array.from(combinations).sort();
}
