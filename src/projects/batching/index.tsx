import { AsyncBatcher } from '@tanstack/react-pacer/async-batcher';
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQueries
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
}

interface CharacterRequest {
  resolve: (character: Character | null) => void;
  reject: (error: unknown) => void;
  id: number;
}

const fetchCharacters = async (ids: ReadonlyArray<number>) => {
  const uniqueIds = [...new Set(ids)];
  const response = await fetch(
    `https://rickandmortyapi.com/api/character/[${uniqueIds.join(',')}]`
  );
  if (!response.ok) throw new Error('Failed to fetch characters');

  const characters =
    (await response.json()) as Array<Character> | Character;
  const characterMap = new Map<number, Character>();
  for (const character of Array.isArray(characters)
    ? characters
    : [characters]) {
    characterMap.set(character.id, character);
  }

  return characterMap;
};

const characterBatcher = new AsyncBatcher<CharacterRequest>(
  requests => fetchCharacters(requests.map(({ id }) => id)),
  {
    wait: 0,
    onSuccess: (charactersById, requests) => {
      for (const { resolve, id } of requests) {
        resolve(charactersById.get(id) ?? null);
      }
    },
    onError: (error, requests) => {
      for (const { reject } of requests) {
        reject(error);
      }
    }
  }
);

const charactersAPI = {
  getCharacter: (id: number) =>
    new Promise<Character | null>((resolve, reject) => {
      characterBatcher.addItem({ resolve, reject, id });
    })
};

const charactersQueries = {
  all: () => ['characters'] as const,
  detail: (id: number) =>
    queryOptions({
      queryKey: [...charactersQueries.all(), 'detail', id] as const,
      queryFn: () => charactersAPI.getCharacter(id),
      staleTime: 60 * 1000
    })
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0
    }
  }
});

function Characters({ ids }: { ids: Array<number> }) {
  const characters = useQueries({
    queries: ids.map(id => charactersQueries.detail(id))
  });

  return (
    <>
      {characters.map((character, index) => {
        if (character.status === 'pending') {
          return <p key={String(index)}>Loading...</p>;
        }
        if (character.status === 'error') {
          return <p key={String(index)}>Error...</p>;
        }
        if (character.data === null) {
          return <p key={String(index)}>Not found ...</p>;
        }

        return (
          <div key={character.data.id} style={{ display: 'flex' }}>
            <img
              width={100}
              height={100}
              alt={character.data.name}
              src={character.data.image}
            />
            <div style={{ paddingLeft: 10, textAlign: 'left' }}>
              <h5 style={{ marginTop: 0, marginBottom: 5 }}>
                {character.data.name} (#{character.data.id})
              </h5>
              <p style={{ marginTop: 0, marginBottom: 2 }}>
                Status: {character.data.status}
              </p>
              <p style={{ marginTop: 0, marginBottom: 2 }}>
                Species: {character.data.species}
              </p>
              <p style={{ marginTop: 0, marginBottom: 2 }}>
                Gender: {character.data.gender}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}

function BatchingExample() {
  const [ids, setIds] = useState<Array<number>>([]);
  const [idsToLoad, setIdsToLoad] = useState<Array<number>>([]);
  const [error, setError] = useState('');

  return (
    <div>
      <h2>Character fetcher</h2>
      <div>
        <label style={{ display: 'block' }}>
          Character ids (numeric, comma separated)
        </label>
        <input
          style={{ display: 'inline-block' }}
          placeholder="ids"
          onChange={event => {
            const parsedIds = event.target.value
              .split(',')
              .map(id => id.trim());

            if (parsedIds.every(id => /^\d+$/.test(id))) {
              setIds(parsedIds.map(Number));
              setError('');
            } else {
              setError('Invalid.. only use numbers and comma');
            }
          }}
        />
      </div>

      {error ? <h3 style={{ color: 'red' }}>{error}</h3> : null}

      <button
        type="button"
        disabled={!!error}
        onClick={() => {
          setIdsToLoad(ids);
        }}
      >
        Load characters
      </button>
      <div>
        <h4 style={{ textAlign: 'left' }}>Characters:</h4>
        <Characters ids={idsToLoad} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BatchingExample />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}
