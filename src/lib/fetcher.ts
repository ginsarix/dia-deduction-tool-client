export const fetcher = async (...args: Parameters<typeof fetch>) => {
  const [url, config] = args;

  const res = await fetch(url, {
    ...config,
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body?.message ?? "HTTP error!");
  }
  return await res.json();
};
