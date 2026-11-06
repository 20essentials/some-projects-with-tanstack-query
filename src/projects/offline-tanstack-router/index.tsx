import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  MutationCache,
  QueryClient,
  mutationOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Toaster, toast } from 'react-hot-toast';

type Movie = {
  comment: string;
  id: string;
  title: string;
};

type MovieResponse = {
  ts: number;
  movie: Movie;
};

type MoviesResponse = {
  ts: number;
  movies: Array<Pick<Movie, 'id' | 'title'>>;
};

type UpdateMovieResponse = {
  message: string;
};

const movies: Array<Movie> = [
  {
    id: '1',
    title: 'Guardians of the Galaxy',
    comment: ''
  },
  {
    id: '2',
    title: 'Wall-E',
    comment: ''
  }
];

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const moviesAPI = {
  getMovie: async (id: string): Promise<MovieResponse> => {
    await delay(500);

    const movie = movies.find(item => item.id === id);

    if (!movie) {
      throw new Error(`Movie with id ${id} not found`);
    }

    return { ts: Date.now(), movie };
  },
  getMovies: async (): Promise<MoviesResponse> => {
    await delay(500);

    return {
      ts: Date.now(),
      movies: movies.map(({ id, title }) => ({ id, title }))
    };
  },
  updateMovie: async (
    id: string,
    comment: string
  ): Promise<UpdateMovieResponse> => {
    await delay(500);

    movies.forEach(movie => {
      if (movie.id === id) {
        movie.comment = comment.toUpperCase();
      }
    });

    return { message: `Successfully updated movie ${id}` };
  }
};

const moviesQueries = {
  all: () => ['movies'] as const,
  list: () =>
    queryOptions({
      queryKey: [...moviesQueries.all(), 'list'] as const,
      queryFn: () => moviesAPI.getMovies()
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...moviesQueries.all(), 'detail', id] as const,
      queryFn: () => moviesAPI.getMovie(id)
    })
};

const moviesMutations = {
  update: () =>
    mutationOptions({
      mutationFn: async (
        { id, comment }: { id: string; comment: string },
        context
      ) => {
        await context.client.cancelQueries({
          queryKey: moviesQueries.detail(id).queryKey
        });

        return moviesAPI.updateMovie(id, comment);
      }
    })
};

const memoryStorage = {
  getItem: async (_key: string) => null,
  setItem: async (_key: string, _value: string) => {},
  removeItem: async (_key: string) => {}
};

const persister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : memoryStorage
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      staleTime: 2000,
      retry: 0
    }
  },
  mutationCache: new MutationCache({
    onError: error => {
      toast.error(error.message);
    }
  })
});

queryClient.setMutationDefaults(moviesQueries.all(), {
  ...moviesMutations.update(),
  onSuccess: data => {
    toast.success(data.message);
  }
});

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      <Movies />
      <Toaster />
      <ReactQueryDevtools initialIsOpen />
    </PersistQueryClientProvider>
  );
}

type View = { name: 'list' } | { name: 'detail'; movieId: string };

function Movies() {
  const [view, setView] = useState<View>({ name: 'list' });

  if (view.name === 'detail') {
    return (
      <Detail
        movieId={view.movieId}
        onBack={() => setView({ name: 'list' })}
      />
    );
  }

  return (
    <List
      onSelectMovie={movieId => setView({ name: 'detail', movieId })}
    />
  );
}

function List({
  onSelectMovie
}: {
  onSelectMovie: (movieId: string) => void;
}) {
  const moviesQuery = useQuery(moviesQueries.list());

  if (moviesQuery.isLoading) {
    return 'Loading...';
  }

  if (moviesQuery.data) {
    return (
      <div>
        <h1>Movies</h1>
        <p>
          Try to mock offline behavior with the button in the devtools. You can
          navigate around as long as there is already data in the cache. You'll
          get a refetch as soon as you go online again.
        </p>
        <ul>
          {moviesQuery.data.movies.map(movie => (
            <li key={movie.id}>
              <a
                href={`#movie-${movie.id}`}
                onClick={event => {
                  event.preventDefault();
                  onSelectMovie(movie.id);
                }}
              >
                {movie.title}
              </a>
            </li>
          ))}
        </ul>
        <div>
          Updated at: {new Date(moviesQuery.data.ts).toLocaleTimeString()}
        </div>
        <div>{moviesQuery.isFetching && 'fetching...'}</div>
      </div>
    );
  }

  if (moviesQuery.isError) {
    return (
      <div>
        <h1>Couldn't load movies!</h1>
        <div>{moviesQuery.error.message}</div>
      </div>
    );
  }

  return null;
}

function Detail({
  movieId,
  onBack
}: {
  movieId: string;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const movieQuery = useQuery(moviesQueries.detail(movieId));

  const [commentDraft, setCommentDraft] = useState<string | undefined>();

  const updateMovie = useMutation({
    ...moviesMutations.update(),
    mutationKey: moviesQueries.detail(movieId).queryKey,
    onMutate: async variables => {
      await queryClient.cancelQueries({
        queryKey: moviesQueries.detail(movieId).queryKey
      });

      const { queryKey } = moviesQueries.detail(movieId);
      const previousData = queryClient.getQueryData(queryKey);

      setCommentDraft(undefined);

      queryClient.setQueryData(
        queryKey,
        old =>
          old && {
            ...old,
            movie: {
              ...old.movie,
              comment: variables.comment
            }
          }
      );

      return { previousData };
    },
    onError: (_, __, onMutateResult) => {
      queryClient.setQueryData(
        moviesQueries.detail(movieId).queryKey,
        onMutateResult?.previousData
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: moviesQueries.detail(movieId).queryKey
      });
    }
  });

  const comment = commentDraft ?? movieQuery.data?.movie.comment;

  if (movieQuery.isLoading) {
    return 'Loading...';
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (comment === undefined) {
      return;
    }

    updateMovie.mutate({
      id: movieId,
      comment
    });
  }

  if (movieQuery.data) {
    return (
      <form onSubmit={submitForm}>
        <a
          href="#"
          onClick={event => {
            event.preventDefault();
            onBack();
          }}
        >
          Back
        </a>
        <h1>Movie: {movieQuery.data.movie.title}</h1>
        <p>
          Try to mock offline behavior with the button in the devtools, then
          update the comment. The optimistic update will succeed, but the actual
          mutation will be paused and resumed once you go online again.
        </p>
        <p>
          You can also reload the page, which will make the persisted mutation
          resume, as you will be online again when you "come back".
        </p>
        <p>
          <label>
            Comment: <br />
            <textarea
              name="comment"
              value={comment}
              onChange={event => setCommentDraft(event.target.value)}
            />
          </label>
        </p>
        <button type="submit">Submit</button>
        <div>
          Updated at: {new Date(movieQuery.data.ts).toLocaleTimeString()}
        </div>
        <div>{movieQuery.isFetching && 'fetching...'}</div>
        <div>
          {updateMovie.isPaused
            ? 'mutation paused - offline'
            : updateMovie.isPending && 'updating...'}
        </div>
      </form>
    );
  }

  if (movieQuery.isError) {
    return (
      <div>
        <a
          href="#"
          onClick={event => {
            event.preventDefault();
            onBack();
          }}
        >
          Back
        </a>
        <h1>Couldn't load movie!</h1>
        <div>{movieQuery.error.message}</div>
      </div>
    );
  }

  if (movieQuery.isPaused) {
    return "We're offline and have no data to show :(";
  }

  return null;
}
