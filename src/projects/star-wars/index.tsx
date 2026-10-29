import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  skipToken,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

type Character = {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  eye_color: string;
  birth_year: string;
  homeworld: string;
  films: Array<string>;
  url: string;
};

type Film = {
  title: string;
  episode_id: number;
  opening_crawl: string;
  release_date: string;
  characters: Array<string>;
  url: string;
};

type Planet = {
  name: string;
};

type Paginated<T> = {
  results: Array<T>;
};

const charactersAPI = {
  getCharacters: async (): Promise<Paginated<Character>> => {
    const res = await fetch("https://swapi.dev/api/people/");
    if (!res.ok) throw new Error("Failed to fetch characters");
    return await res.json();
  },
  getCharacter: async (characterId: string): Promise<Character> => {
    const res = await fetch(`https://swapi.dev/api/people/${characterId}/`);
    if (!res.ok) throw new Error("Failed to fetch character");
    return await res.json();
  },
};

const filmsAPI = {
  getFilms: async (): Promise<Paginated<Film>> => {
    const res = await fetch("https://swapi.dev/api/films/");
    if (!res.ok) throw new Error("Failed to fetch films");
    return await res.json();
  },
  getFilm: async (filmId: string): Promise<Film> => {
    const res = await fetch(`https://swapi.dev/api/films/${filmId}/`);
    if (!res.ok) throw new Error("Failed to fetch film");
    return await res.json();
  },
};

const planetsAPI = {
  getPlanet: async (planetId: string): Promise<Planet> => {
    const res = await fetch(`https://swapi.dev/api/planets/${planetId}/`);
    if (!res.ok) throw new Error("Failed to fetch planet");
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

const filmsQueries = {
  all: () => ["films"] as const,
  list: () =>
    queryOptions({
      queryKey: [...filmsQueries.all(), "list"] as const,
      queryFn: () => filmsAPI.getFilms(),
    }),
  detail: (filmId: string | undefined) =>
    queryOptions({
      queryKey: [...filmsQueries.all(), "detail", filmId] as const,
      queryFn: filmId ? () => filmsAPI.getFilm(filmId) : skipToken,
    }),
};

const planetsQueries = {
  all: () => ["planets"] as const,
  detail: (planetId: string) =>
    queryOptions({
      queryKey: [...planetsQueries.all(), "detail", planetId] as const,
      queryFn: () => planetsAPI.getPlanet(planetId),
    }),
};

type View =
  | { name: "home" }
  | { name: "films" }
  | { name: "film"; filmId: string }
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
      <nav className="flex flex-row gap-6 justify-center items-center">
        <button onClick={() => setView({ name: "home" })}>
          <span className="uppercase hover:underline">Home</span>
        </button>
        <button onClick={() => setView({ name: "films" })}>
          <span className="uppercase hover:underline">Films</span>
        </button>
        <button onClick={() => setView({ name: "characters" })}>
          <span className="uppercase hover:underline">Characters</span>
        </button>
      </nav>
      {view.name === "home" && <Home onSelectView={(view) => setView(view)} />}
      {view.name === "films" && (
        <Films onSelectView={(view) => setView(view)} />
      )}
      {view.name === "film" && (
        <Film filmId={view.filmId} onSelectView={(view) => setView(view)} />
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
  );
}

function Home({ onSelectView }: { onSelectView: (view: View) => void }) {
  return (
    <div>
      <h2 className="text-4xl">TanStack Query Demo</h2>
      <p>Using the Star Wars API</p>
      <h5 className="text-2xl pt-4">Why TanStack Query?</h5>
      <p>
        In this demo you will be able to see how TanStack Query is a significant
        improvement over <strong>redux</strong>, <strong>mobx</strong>, and any
        other general-purpose state container.
      </p>
      <p>No reducers, thunks, or sagas to maintain.</p>
      <p>
        Simply associate a key with your fetch call and let{" "}
        <strong>TanStack Query</strong> handle the rest.
      </p>
      <h5 className="text-2xl pt-4">Ready to get started?</h5>
      <p>
        <a
          className="text-blue-500 hover:underline"
          href="#films"
          onClick={() => onSelectView({ name: "films" })}
        >
          Films
        </a>{" "}
        and{" "}
        <a
          className="text-blue-500 hover:underline"
          href="#characters"
          onClick={() => onSelectView({ name: "characters" })}
        >
          Characters
        </a>
      </p>
    </div>
  );
}

function Films({ onSelectView }: { onSelectView: (view: View) => void }) {
  const { data, status } = useQuery(filmsQueries.list());

  if (status === "pending") {
    return <p>Loading...</p>;
  }
  if (status === "error") {
    return <p>Error :(</p>;
  }

  return (
    <div>
      <h2 className="text-4xl">Films</h2>
      {data.results.map((film) => {
        const parts = film.url.split("/").filter(Boolean);
        const filmId = parts[parts.length - 1];
        return (
          <article key={filmId}>
            <a
              className="text-blue-500 hover:underline"
              href={`#films/${filmId}`}
              onClick={() => onSelectView({ name: "film", filmId })}
            >
              <h6 className="text-xl">
                {film.episode_id}. {film.title}{" "}
                <em>
                  ({new Date(Date.parse(film.release_date)).getFullYear()})
                </em>
              </h6>
            </a>
          </article>
        );
      })}
    </div>
  );
}

function Film({
  filmId,
  onSelectView,
}: {
  filmId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(filmsQueries.detail(filmId));

  if (status === "pending") return <p>Loading...</p>;

  if (status === "error") return <p>Error :(</p>;

  return (
    <div>
      <h2 className="text-4xl">{data.title}</h2>
      <p>{data.opening_crawl}</p>
      <br />
      <h4 className="text-2xl">Characters</h4>
      {data.characters.map((character) => {
        const parts = character.split("/").filter(Boolean);
        const characterId = parts[parts.length - 1];
        return (
          <FilmCharacter
            characterId={characterId}
            key={characterId}
            onSelectView={onSelectView}
          />
        );
      })}
    </div>
  );
}

function FilmCharacter({
  characterId,
  onSelectView,
}: {
  characterId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(charactersQueries.detail(characterId));

  if (status !== "success") {
    return null;
  }

  return (
    <a
      className="text-blue-500 hover:underline"
      href={`#characters/${characterId}`}
      onClick={() => onSelectView({ name: "character", characterId })}
    >
      <h6 className="text-lg">{data.name}</h6>
    </a>
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
        const parts = person.url.split("/").filter(Boolean);
        const personId = parts[parts.length - 1];
        return (
          <article key={personId}>
            <a
              className="text-blue-500 hover:underline"
              href={`#characters/${personId}`}
              onClick={() =>
                onSelectView({ name: "character", characterId: personId })
              }
            >
              <h6 className="text-xl">{person.name}</h6>
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

  const homeworldParts = data.homeworld.split("/").filter(Boolean);
  const homeworldId = homeworldParts[homeworldParts.length - 1];

  return (
    <div>
      <h2 className="text-4xl">{data.name}</h2>
      <p>
        <strong>Born</strong>: {data.birth_year}
      </p>
      <p>
        <strong>Eyes</strong>: {data.eye_color}
      </p>
      <p>
        <strong>Hair</strong>: {data.hair_color}
      </p>
      <p>
        <strong>Height</strong>: {data.height}
      </p>
      <p>
        <strong>Mass</strong>: {data.mass}
      </p>
      <p>
        <strong>Homeworld</strong>: <Homeworld homeworldId={homeworldId} />
      </p>

      <h4 className="text-2xl pt-4">Films</h4>
      {data.films.map((film) => {
        const parts = film.split("/").filter(Boolean);
        const filmId = parts[parts.length - 1];
        return (
          <CharacterFilm
            filmId={filmId}
            key={filmId}
            onSelectView={onSelectView}
          />
        );
      })}
    </div>
  );
}

function CharacterFilm({
  filmId,
  onSelectView,
}: {
  filmId: string;
  onSelectView: (view: View) => void;
}) {
  const { data, status } = useQuery(filmsQueries.detail(filmId));

  if (status === "success") {
    return (
      <a
        className="text-blue-500 hover:underline"
        href={`#films/${filmId}`}
        onClick={() => onSelectView({ name: "film", filmId })}
      >
        <h6 className="text-lg">
          {data.episode_id}. {data.title}
        </h6>
      </a>
    );
  }
}

function Homeworld({ homeworldId }: { homeworldId: string }) {
  const { data, status } = useQuery(planetsQueries.detail(homeworldId));

  if (status === "pending") return <span>Loading...</span>;
  if (status === "error") return <span>Error :(</span>;

  return <span>{data.name}</span>;
}
