import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { dogsQueries } from './queries';

const queryClient = new QueryClient();

export const DogList = () => {
  const { data, status } = useQuery(dogsQueries.list());

  if (status === 'pending') return 'Loading...';

  if (status === 'error') return 'Error!';

  const dogs = Object.keys(data.message);

  return (
    <div>
      {dogs.map(dog => (
        <div key={dog}>{dog}</div>
      ))}
    </div>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container && !container.shadowRoot) {
      setShadowRoot(container.attachShadow({ mode: 'open' }));
    }
  }, []);

  return (
    <div ref={containerRef}>
      {shadowRoot &&
        createPortal(
          <QueryClientProvider client={queryClient}>
            <div
              style={{
                padding: '30px'
              }}
            >
              <h2>Dog Breeds</h2>
              <DogList />
            </div>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
              shadowDOMTarget={shadowRoot}
            />
          </QueryClientProvider>,
          shadowRoot
        )}
    </div>
  );
}
