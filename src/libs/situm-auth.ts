const SITUM_DOMAIN_PATTERN = /\.situm\.com/i;

export function isSitumUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "http://dummy");
    return SITUM_DOMAIN_PATTERN.test(parsed.hostname);
  } catch {
    return SITUM_DOMAIN_PATTERN.test(url);
  }
}

export function createSitumTransformRequest(jwt: string | null) {
  return (url: string) => {
    if (jwt && isSitumUrl(url)) {
      return {
        url,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      };
    }
    return { url };
  };
}

export function situmFetchInit(jwt: string | null, url: string): RequestInit {
  const init: RequestInit = { mode: "cors" };
  if (jwt && isSitumUrl(url)) {
    init.headers = {
      Authorization: `Bearer ${jwt}`,
    };
  }
  return init;
}
