import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery
} from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';

type Repo = {
  full_name: string;
  description: string | null;
  subscribers_count: number;
  stargazers_count: number;
  forks_count: number;
};

const reposAPI = {
  getRepo: async (): Promise<Repo> => {
    const response = await fetch('https://api.github.com/repos/TanStack/query');
    if (!response.ok) throw new Error('Failed to fetch repo data');
    return await response.json();
  }
};

const reposQueries = {
  all: () => ['repos'] as const,
  detail: () =>
    queryOptions({
      queryKey: [...reposQueries.all(), 'detail'] as const,
      queryFn: () => reposAPI.getRepo()
    })
};

const queryClient = new QueryClient();

export default function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <button onClick={() => setIsOpen(!isOpen)}>{`${isOpen ? 'Close' : 'Open'} the devtools panel`}</button>
      {isOpen && <ReactQueryDevtoolsPanel onClose={() => setIsOpen(false)} />}
    </QueryClientProvider>
  );
}

function Example() {
  const { isPending, error, data, isFetching } = useQuery(reposQueries.detail());

  if (isPending) return 'Loading...';

  if (error) return 'An error has occurred: ' + error.message;

  return (
    <div
      style={{
        paddingBottom: 20
      }}
    >
      <h1>{data.full_name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
      <div>{isFetching ? 'Updating...' : ''}</div>
    </div>
  );
}
