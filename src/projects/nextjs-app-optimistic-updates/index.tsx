import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

import { addTodo, getTodos } from './api';
import type { Todo } from './api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000
    }
  }
});

type Tab = 'ui-variables' | 'cache';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1>Optimistic Updates with TanStack Query</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Add todos to see optimistic updates in action. The server randomly
          fails ~30% of the time so you can observe automatic rollback.
        </p>
        <ApproachTabs />
      </main>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

function ApproachTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('ui-variables');

  const tabStyle = (tab: Tab): CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom:
      activeTab === tab ? '2px solid #0070f3' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? '#0070f3' : '#555'
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #ddd',
          marginBottom: '1.5rem'
        }}
      >
        <button
          style={tabStyle('ui-variables')}
          onClick={() => setActiveTab('ui-variables')}
        >
          Via UI Variables
        </button>
        <button style={tabStyle('cache')} onClick={() => setActiveTab('cache')}>
          Via Cache Manipulation
        </button>
      </div>

      {activeTab === 'ui-variables' ? <TodoListUI /> : <TodoListCache />}
    </div>
  );
}

function TodoListUI() {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos
  });

  const addTodoMutation = useMutation({
    mutationFn: addTodo,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    addTodoMutation.mutate(text);
    setInputValue('');
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1rem' }}>
        <strong>Approach 1 — via UI variables:</strong> The pending item is
        rendered directly from <code>mutation.variables</code>. No cache
        manipulation needed. On error the pending item simply disappears.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}
      >
        <input
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          placeholder="New todo…"
          style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={addTodoMutation.isPending}>
          Add
        </button>
      </form>

      {addTodoMutation.isError && (
        <p style={{ color: 'red', marginBottom: '0.5rem' }}>
          {addTodoMutation.error.message}
        </p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{ padding: '0.4rem 0', borderBottom: '1px solid #eee' }}
          >
            {todo.text}
          </li>
        ))}
        {addTodoMutation.isPending && (
          <li
            style={{
              padding: '0.4rem 0',
              borderBottom: '1px solid #eee',
              opacity: 0.5
            }}
          >
            {addTodoMutation.variables} <em>(saving…)</em>
          </li>
        )}
      </ul>
    </div>
  );
}

interface MutationContext {
  previousTodos: Array<Todo> | undefined;
  optimisticId: string;
}

function TodoListCache() {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [lastError, setLastError] = useState<string | null>(null);

  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos
  });

  const addTodoMutation = useMutation<Todo, Error, string, MutationContext>({
    mutationFn: addTodo,
    onMutate: async text => {
      setLastError(null);
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueryData<Array<Todo>>(['todos']);

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticTodo: Todo = {
        id: optimisticId,
        text,
        createdAt: Date.now()
      };

      queryClient.setQueryData<Array<Todo>>(['todos'], (old = []) => [
        ...old,
        optimisticTodo
      ]);

      return { previousTodos, optimisticId };
    },
    onError: (err, _text, context) => {
      setLastError(err.message);
      if (context?.previousTodos !== undefined) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      } else if (context?.optimisticId) {
        queryClient.setQueryData<Array<Todo>>(['todos'], (old = []) =>
          old.filter(todo => todo.id !== context.optimisticId)
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    addTodoMutation.mutate(text);
    setInputValue('');
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '1rem' }}>
        <strong>Approach 2 — via cache manipulation:</strong>{' '}
        <code>onMutate</code> snapshots the cache and writes the optimistic item
        in. <code>onError</code> restores the snapshot on failure.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}
      >
        <input
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          placeholder="New todo…"
          style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={addTodoMutation.isPending}>
          Add
        </button>
      </form>

      {lastError && (
        <p style={{ color: 'red', marginBottom: '0.5rem' }}>{lastError}</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              padding: '0.4rem 0',
              borderBottom: '1px solid #eee',
              opacity: todo.id.startsWith('optimistic-') ? 0.5 : 1
            }}
          >
            {todo.text}
            {todo.id.startsWith('optimistic-') && <em> (saving…)</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}
