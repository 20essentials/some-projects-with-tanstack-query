import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useDebouncedValue } from '@tanstack/react-pacer/debouncer';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { productsQueries } from './queries';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>TanStack Query with Algolia</h1>
        <Search />
      </div>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, { wait: 300 });

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setQuery(event.target.value);
  };

  return (
    <div>
      <input
        onChange={handleOnChange}
        value={query}
        placeholder="Search products"
      />
      <SearchResults query={debouncedQuery} />
    </div>
  );
}

type Product = {
  name: string;
  shortDescription: string;
  salePrice: number;
};

type SearchResultsProps = {
  query: string;
};

function SearchResults({ query = '' }: SearchResultsProps) {
  const {
    data: hits,
    error,
    isLoading,
    isFetching,
    status,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...productsQueries.search<Product>({
      indexName: 'bestbuy',
      query,
      hitsPerPage: 5,
    }),
    select: (data) => data.pages.flatMap((page) => page.hits),
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  if (!query) return null;

  if (isLoading) return <div className="loading">Loading...</div>;

  if (status === 'error') return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="search-status">
        Status: {status} {isFetching && <span>fetching...</span>}
      </div>
      <div>
        <div className="search-result">
          {hits && hits.length > 0 ? (
            hits.map((product) => (
              <li key={product.objectID} className="product">
                <span className="product-name">{product.name}</span>
                {product.shortDescription && (
                  <>
                    <br />
                    <span className="product-description">
                      {product.shortDescription}
                    </span>
                  </>
                )}
                <br />
                <span className="product-price">${product.salePrice}</span>
              </li>
            ))
          ) : (
            <h3>No products found!</h3>
          )}
        </div>
        {hasNextPage && (
          <button
            type="button"
            className="search-more"
            onClick={() => fetchNextPage()}
            disabled={isFetching}
          >
            more
          </button>
        )}
        {isFetchingNextPage && (
          <div className="search-status">Fetching next page...</div>
        )}
      </div>
    </div>
  );
}
