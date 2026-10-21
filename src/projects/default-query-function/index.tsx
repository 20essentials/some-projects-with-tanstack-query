import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryKey } from '@tanstack/react-query';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

type Post = {
  id: number;
  title: string;
  body: string;
};

const defaultQueryFn = async ({ queryKey }: { queryKey: QueryKey }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com${queryKey[0]}`
  );
  if (!response.ok) throw new Error('Failed to fetch data');
  return await response.json();
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn
    }
  }
});

export default function App() {
  const [postId, setPostId] = useState(-1);

  return (
    <QueryClientProvider client={queryClient}>
      <p>
        As you visit the posts below, you will notice them in a loading state
        the first time you load them. However, after you return to this list and
        click on any posts you have already visited again, you will see them
        load instantly and background refresh right before your eyes!{' '}
        <strong>
          (You may need to throttle your network speed to simulate longer
          loading sequences)
        </strong>
      </p>
      {postId > -1 ? (
        <Post postId={postId} setPostId={setPostId} />
      ) : (
        <Posts setPostId={setPostId} />
      )}
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

function Posts({ setPostId }: { setPostId: Dispatch<SetStateAction<number>> }) {
  const queryClient = useQueryClient();

  const { status, data, error, isFetching } = useQuery<Array<Post>>({
    queryKey: ['/posts']
  });

  return (
    <div>
      <h1>Posts</h1>
      <div>
        {status === 'pending' ? (
          'Loading...'
        ) : status === 'error' ? (
          <span>Error: {error.message}</span>
        ) : (
          <>
            <div>
              {data.map(post => (
                <p key={post.id}>
                  <a
                    onClick={() => setPostId(post.id)}
                    href="#"
                    style={
                      queryClient.getQueryData([`/posts/${post.id}`])
                        ? {
                            fontWeight: 'bold',
                            color: 'green'
                          }
                        : {}
                    }
                  >
                    {post.title}
                  </a>
                </p>
              ))}
            </div>
            <div>{isFetching ? 'Background Updating...' : ' '}</div>
          </>
        )}
      </div>
    </div>
  );
}

function Post({
  postId,
  setPostId
}: {
  postId: number;
  setPostId: Dispatch<SetStateAction<number>>;
}) {
  const { status, data, error, isFetching } = useQuery<Post>({
    queryKey: [`/posts/${postId}`],
    enabled: !!postId
  });

  return (
    <div>
      <div>
        <a onClick={() => setPostId(-1)} href="#">
          Back
        </a>
      </div>
      {!postId || status === 'pending' ? (
        'Loading...'
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          <h1>{data.title}</h1>
          <div>
            <p>{data.body}</p>
          </div>
          <div>{isFetching ? 'Background Updating...' : ' '}</div>
        </>
      )}
    </div>
  );
}
