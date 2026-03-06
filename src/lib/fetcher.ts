export const fetcher = (...args: Parameters<typeof fetch>) => {
  const [url, config] = args;

  return fetch(url, {
    ...config,
    credentials: "include",
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });
};
