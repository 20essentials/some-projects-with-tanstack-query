import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  episode: Array<string>;
};

type Episode = {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: Array<string>;
};

type Location = {
  id: number;
  name: string;
  type: string;
};

type Paginated<T> = {
  results: Array<T>;
};

const charactersAPI = {
  getCharacters: async (): Promise<Paginated<Character>> => {
    const res = await fetch("https://rickandmortyapi.com/api/character/");
    if (!res.ok) throw new Error("Failed to fetch characters");
    return await res.json();
  },
  getCharacter: async (characterId: string): Promise<Character> => {
    const res = await fetch(
      `https://rickandmortyapi.com/api/character/${characterId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch character");
    return await res.json();
  },
};

const episodesAPI = {
  getEpisodes: async (): Promise<Paginated<Episode>> => {
    const res = await fetch("https://rickandmortyapi.com/api/episode/");
    if (!res.ok) throw new Error("Failed to fetch episodes");
    return await res.json();
  },
  getEpisode: async (episodeId: string): Promise<Episode> => {
    const res = await fetch(
      `https://rickandmortyapi.com/api/episode/${episodeId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch episode");
    return await res.json();
  },
};

const locationsAPI = {
  getLocation: async (locationId: string): Promise<Location> => {
    const res = await fetch(
      `https://rickandmortyapi.com/api/location/${locationId}`,
    );
    if (!res.ok) throw new Error("Failed to fetch location");
    return await res.json();
  },
};

const charactersQueries = {
  all: () => ["characters"] as const,
  list: () =>
    queryOptions({
      queryKey: [...charactersQueries.all(), "list"] as const,
      queryFn: () => charactersAPI.getCharacters(),
    }),
  detail: (characterId: string) =>
    queryOptions({
      queryKey: [...charactersQueries.all(), "detail", characterId] as const,
      queryFn: () => charactersAPI.getCharacter(characterId),
    }),
};

const episodesQueries = {
  all: () => ["episodes"] as const,
  list: () =>
    queryOptions({
      queryKey: [...episodesQueries.all(), "list"] as const,
      queryFn: () => episodesAPI.getEpisodes(),
    }),
  detail: (episodeId: string) =>
    queryOptions({
      queryKey: [...episodesQueries.all(), "detail", episodeId] as const,
      queryFn: () => episodesAPI.getEpisode(episodeId),
    }),
};

const locationsQueries = {
  all: () => ["locations"] as const,
  detail: (locationId: string) =>
    queryOptions({
      queryKey: [...locationsQueries.all(), "detail", locationId] as const,
      queryFn: () => locationsAPI.getLocation(locationId),
    }),
};

type View =
  | { name: "home" }
  | { name: "episodes" }
  | { name: "episode"; episodeId: string }
  | { name: "characters" }
  | { name: "character"; characterId: string };

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

function Layout() {
  const [view, setView] = useState<View>({ name: "home" });

  return (
    <div>
      <nav className="bg-gray-300 w-full flex flex-row gap-6 justify-center items-center h-12">
        <button onClick={() => setView({ name: "home" })}>
          <span className="uppercase hover:underline">Home</span>
        </button>
        <button onClick={() => setView({ name: "episodes" })}>
          <span className="uppercase hover:underline">Episodes</span>
        </button>
        <button onClick={() => setView({ name: "characters" })}>
          <span className="uppercase hover:underline">Characters</span>
        </button>
      </nav>
      <div className="p-2">
        {view.name === "home" && (
          <Home onSelectView={(view) => setView(view)} />
        )}
        {view.name === "episodes" && (
          <Episodes onSelectView={(view) => setView(view)} />
        )}
        {view.name === "episode" && (
          <Episode
            episodeId={view.episodeId}
            onSelectView={(view) => setView(view)}
          />
        )}
        {view.name === "characters" && (
          <Characters onSelectView={(view) => setView(view)} />
        )}
        {view.name === "character" && (
          <Character
            characterId={view.characterId}
            onSelectView={(view) => setView(view)}
          />
        )}
      </div>
    </div>
  );
}

function Home({ onSelectView }: { onSelectView: (view: View) => void }) {
  return (
    <div>
      <h2 className="text-4xl">TanStack Query Demo</h2>
      <p>Using the Rick And Morty API</p>
      <p>
        (Built by{" "}
        <a
          className="text-blue-500 hover:underline"
          href="https://twitter.com/axelfuh"
        >
          @axelfuh
        </a>
        )
      </p>
      <h5 className="text-2xl pt-4">Why TanStack Query?</h5>
      <p>
        In this demo you will be able to see how TanStack Query is a significant
        improvement over <strong>redux</strong>, <strong>mobx</strong>, and any
        other general-purpose state container.
      </p>
      <p>
        No reducers, thunks, or sagas. No ES6 models to maintain in order to tag
        them as observable.
      </p>
      <p>
        Simply associate a key with your fetch call and let{" "}
        <strong>TanStack Query</strong> handle the rest.
      </p>
      <h5 className="text-2xl pt-4">Ready to get started?</h5>
      <p>
        Check out the{" "}
        <a
          className="text-blue-500 hover:underline"
          href="#episodes"
          onClick={() => onSelectView({ name: "episodes" })}
        >
          Episodes
        </a>{" "}
        and{" "}
        <a
          className="text-blue-500 hover:underline"
          href="#characters"
          onClick={() => onSelectView({ name: "characters" })}
        >
          Characters
        </a>
        !
      </p>
    </div>
  );
}

function Episodes({ onSelectView }: { onSelectView: (view: View) => void }) {
  const { data, status } = useQuery(episodesQueries.list());

  if (status === "pending") {
    return <p>Loading...</p>;
  }
  if (status === "error") {
    return <p>Error :(</p>;
  }

  return (
    <div>
      <h2 className="text-4xl">Episodes</h2>
      {data.results.map((episode) => (
        <article key={episode.id}>
          <a
            className="text-blue-500 hover:underline"
            href={`#episodes/${episode.id}`}
            onClick={() =>
              onSelectView({ name: "episode", episodeId: `${episode.id}` })
            }
          >
            <h6 className="text-xl">
              {episode.episode} - {episode.name} <em>{episode.air_date}</em>
            </h6>
          </a>
        </article>
      ))}
    </div>
  );
}

function Episode({
  episodeId,
  onSelectView,
}: {
  episodeId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(episodesQueries.detail(episodeId));

  if (status === "pending") return <p>Loading...</p>;

  if (status === "error") return <p>Error :(</p>;

  return (
    <div>
      <h2 className="text-4xl">{data.name}</h2>
      <p>{data.air_date}</p>
      <br />
      <h4 className="text-2xl">Characters</h4>
      {data.characters.map((character) => {
        const characterUrlParts = character.split("/").filter(Boolean);
        const characterId = characterUrlParts[characterUrlParts.length - 1];
        return (
          <EpisodeCharacter
            characterId={characterId}
            key={characterId}
            onSelectView={onSelectView}
          />
        );
      })}
    </div>
  );
}

function EpisodeCharacter({
  characterId,
  onSelectView,
}: {
  characterId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(charactersQueries.detail(characterId));

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error :(</p>;

  return (
    <article key={characterId}>
      <a
        className="text-blue-500 hover:underline"
        href={`#characters/${characterId}`}
        onClick={() => onSelectView({ name: "character", characterId })}
      >
        <h6 className="text-lg">{data.name}</h6>
      </a>
    </article>
  );
}

function Characters({ onSelectView }: { onSelectView: (view: View) => void }) {
  const { status, data } = useQuery(charactersQueries.list());

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error :(</p>;

  return (
    <div>
      <h2 className="text-4xl">Characters</h2>
      {data.results.map((person) => {
        return (
          <article key={person.id}>
            <a
              className="text-blue-500 hover:underline"
              href={`#characters/${person.id}`}
              onClick={() =>
                onSelectView({
                  name: "character",
                  characterId: `${person.id}`,
                })
              }
            >
              <h6 className="text-xl">
                {person.name} - {person.gender}: {person.species}
              </h6>
            </a>
          </article>
        );
      })}
    </div>
  );
}

function Character({
  characterId,
  onSelectView,
}: {
  characterId: string;
  onSelectView: (view: View) => void;
}) {
  const { status, data } = useQuery(charactersQueries.detail(characterId));

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error :(</p>;

  const locationUrlParts = data.location.url.split("/").filter(Boolean);
  const locationId = locationUrlParts[locationUrlParts.length - 1];

  return (
    <div>
      <h2 className="text-4xl">{data.name}</h2>
      <p>
        <strong>Gender</strong>: {data.gender}
      </p>
      <p>
        <strong>Status</strong>: {data.status}
      </p>
      <p>
        <strong>Species</strong>: {data.species}
      </p>
      <p>
        <strong>Origin</strong>: {data.origin.name}
      </p>
      <p>
        <strong>Location</strong>:{" "}
        {locationId ? (
          <CharacterLocation locationId={locationId} />
        ) : (
          data.location.name
        )}
      </p>

      <h4 className="text-2xl pt-4">Episodes</h4>
      {data.episode.map((episode) => {
        const episodeUrlParts = episode.split("/").filter(Boolean);
        const episodeId = episodeUrlParts[episodeUrlParts.length - 1];
        return (
          <CharacterEpisode
            episodeId={episodeId}
            key={`${episodeId}`}
            onSelectView={onSelectView}
          />
        );
      })}
    </div>
  );
}

function CharacterEpisode({
  episodeId,
  onSelectView,
}: {
  episodeId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(episodesQueries.detail(episodeId));

  if (status === "success") {
    return (
      <article key={episodeId}>
        <a
          className="text-blue-500 hover:underline"
          href={`#episodes/${episodeId}`}
          onClick={() => onSelectView({ name: "episode", episodeId })}
        >
          <h6 className="text-lg">
            {data.episode}. {data.name} - {data.air_date}
          </h6>
        </a>
      </article>
    );
  }
}

function CharacterLocation({ locationId }: { locationId: string }) {
  const { data, status } = useQuery(locationsQueries.detail(locationId));

  if (status === "pending") return <span>Loading...</span>;
  if (status === "error") return <span>Error :(</span>;

  return (
    <span>
      {data.name} - {data.type}
    </span>
  );
}
