import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  noop,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';

import { fetchProjects } from './api';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

function Example() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { status, data, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
    placeholderData: keepPreviousData,
    staleTime: 5000
  });

  useEffect(() => {
    if (!isPlaceholderData && data?.hasMore) {
      queryClient
        .query({
          queryKey: ['projects', page + 1],
          queryFn: () => fetchProjects(page + 1)
        })
        .catch(noop);
    }
  }, [data, isPlaceholderData, page, queryClient]);

  return (
    <div>
      <p>
        In this example, each page of data remains visible as the next page is
        fetched. The buttons and capability to proceed to the next page are also
        suppressed until the next page cursor is known. Each page is cached as a
        normal query too, so when going to previous pages, you'll see them
        instantaneously while they are also refetched invisibly in the
        background.
      </p>
      {status === 'pending' ? (
        <div>Loading...</div>
      ) : status === 'error' ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          {data?.projects.map(project => (
            <p key={project.id}>{project.name}</p>
          ))}
        </div>
      )}
      <div>Current Page: {page + 1}</div>
      <button
        onClick={() => setPage(old => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous Page
      </button>{' '}
      <button
        onClick={() => {
          setPage(old => (data?.hasMore ? old + 1 : old));
        }}
        disabled={isPlaceholderData || !data?.hasMore}
      >
        Next Page
      </button>{' '}
      {isFetching ? <span> Loading...</span> : null}{' '}
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}
