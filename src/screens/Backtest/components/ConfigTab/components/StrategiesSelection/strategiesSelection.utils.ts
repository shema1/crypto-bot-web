const BATCH_SIZE = 100;

type PaginatedFetchResult<T> = {
  items: T[];
  total: number;
};

type PaginatedFetchFn<T> = (params: {
  page: number;
  limit: number;
}) => Promise<PaginatedFetchResult<T>>;

export async function fetchAllStrategyPages<T>(fetchPage: PaginatedFetchFn<T>): Promise<T[]> {
  const first = await fetchPage({ page: 1, limit: BATCH_SIZE });
  let items = [...first.items];
  const total = first.total;

  for (let page = 2; items.length < total; page++) {
    const next = await fetchPage({ page, limit: BATCH_SIZE });
    items = [...items, ...next.items];
  }

  return items;
}
