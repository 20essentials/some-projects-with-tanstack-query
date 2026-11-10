import { searchClient } from '@algolia/client-search';
import type { SearchOptions, SearchResponse } from './types';

const ALGOLIA_APP_ID = 'latency';
const ALGOLIA_SEARCH_API_KEY = '6be0576ff61c053d5f9a3225e2a90f76';

export const productsAPI = {
  searchProducts: async <TData>({
    indexName,
    query,
    pageParam,
    hitsPerPage = 10
  }: SearchOptions): Promise<SearchResponse<TData>> => {
    const client = searchClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

    const { hits, nbPages = 0 } = await client.searchSingleIndex<TData>({
      indexName,
      searchParams: { query, page: pageParam, hitsPerPage },
    });

    return { hits, nbPages };
  },
};
