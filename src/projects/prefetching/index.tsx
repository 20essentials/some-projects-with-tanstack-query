import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  noop,
  queryOptions,
  skipToken,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: { name: string };
};

const getCharacters = async (): Promise<{ results: Array<Character> }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const response = await fetch('https://rickandmortyapi.com/api/character/');
  if (!response.ok) throw new Error('Failed to fetch characters');
  return await response.json();
};

const getCharacter = async (selectedChar: number): Promise<Character> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const response = await fetch(
    `https://rickandmortyapi.com/api/character/${selectedChar}`
  );
  if (!response.ok) throw new Error('Failed to fetch character');
  return await response.json();
};

const charactersQueryOptions = queryOptions({
  queryKey: ['characters'],
  queryFn: getCharacters
});

const characterQueryOptions = (id: number | undefined) =>
  queryOptions({
    queryKey: ['character', id],
    queryFn: id ? () => getCharacter(id) : skipToken
  });

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

function CharacterItem({
  char,
  onSelect,
  onShowDetails
}: {
  char: Character;
  onSelect: (id: number) => void;
  onShowDetails: (id: number) => void;
}) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    ...characterQueryOptions(char.id),
    enabled: false
  });

  return (
    <li
      onClick={() => {
        onSelect(char.id);
      }}
      onMouseEnter={() => {
        queryClient
          .query({
            ...characterQueryOptions(char.id),
            staleTime: 10 * 1000
          })
          .catch(noop);
      }}
    >
      <div
        style={
          data
            ? {
                fontWeight: 'bold'
              }
            : {}
        }
      >
        {char.id} - {char.name}{' '}
        <button
          onClick={event => {
            event.stopPropagation();
            onShowDetails(char.id);
          }}
        >
          details
        </button>
      </div>
    </li>
  );
}

function CharacterDetails({ id, onBack }: { id: number; onBack: () => void }) {
  const { status, data, error, isFetching } = useQuery(
    characterQueryOptions(id)
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {status === 'pending' ? (
        'Loading...'
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          <h1>{data.name}</h1>
          <div>
            <p>status: {data.status}</p>
            <p>species: {data.species}</p>
            <p>gender: {data.gender}</p>
            <p>origin: {data.origin.name}</p>
          </div>
          <div>{isFetching ? 'Background Updating...' : ' '}</div>
        </>
      )}
      <br />
      <br />
      <button onClick={onBack}>Back</button>
    </div>
  );
}

function Example() {
  const [selectedChar, setSelectedChar] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const charactersQuery = useQuery(charactersQueryOptions);

  const characterQuery = useQuery(characterQueryOptions(selectedChar));

  const handleShowDetails = (id: number) => {
    setSelectedChar(id);
    setShowDetails(true);
  };

  if (showDetails) {
    return (
      <CharacterDetails
        id={selectedChar}
        onBack={() => setShowDetails(false)}
      />
    );
  }

  return (
    <div className="App">
      <p>
        Hovering over a character will prefetch it, and when it's been
        prefetched it will turn <strong>bold</strong>. Clicking on a prefetched
        character will show their stats below immediately, and opening its
        details page will render it without a loading state.
      </p>
      <h2>Characters</h2>
      {charactersQuery.isPending ? (
        'Loading...'
      ) : charactersQuery.isError ? (
        <span>Error: {charactersQuery.error.message}</span>
      ) : (
        <>
          <ul>
            {charactersQuery.data.results.map(char => (
              <CharacterItem
                key={char.id}
                char={char}
                onSelect={setSelectedChar}
                onShowDetails={handleShowDetails}
              />
            ))}
          </ul>

          <h3>Selected Character</h3>
          {characterQuery.isPending ? (
            'Loading...'
          ) : characterQuery.isError ? (
            <span>Error: {characterQuery.error.message}</span>
          ) : (
            <>
              <pre>{JSON.stringify(characterQuery.data, null, 2)}</pre>
            </>
          )}
        </>
      )}
    </div>
  );
}
