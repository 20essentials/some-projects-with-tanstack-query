import { useState } from 'react';
import {
  experimental_streamedQuery as streamedQuery,
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useQuery
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const answers = [
  "I'm just an example chat, I can't really answer any questions :(".split(' '),
  'TanStack is great. Would you like to know more?'.split(' ')
];

const messagesAPI = {
  getAnswer: (question: string, signal: AbortSignal) => {
    void question;

    return {
      async *[Symbol.asyncIterator]() {
        const answer = answers[Math.floor(Math.random() * answers.length)];
        let index = 0;

        while (index < answer.length) {
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, 100 + Math.random() * 300);
            const onAbort = () => {
              clearTimeout(timeout);
              signal.removeEventListener('abort', onAbort);
              resolve();
            };

            signal.addEventListener('abort', onAbort, { once: true });
          });

          if (signal.aborted) return;
          yield answer[index++];
        }
      }
    };
  }
};

const messagesQueries = {
  all: () => ['messages'] as const,
  detail: (id: string, question: string) =>
    queryOptions({
      queryKey: [...messagesQueries.all(), 'detail', id, question] as const,
      queryFn: streamedQuery({
        streamFn: ({ signal }) => messagesAPI.getAnswer(question, signal)
      }),
      staleTime: Infinity
    })
};

const queryClient = new QueryClient();

function Message({
  inProgress,
  message
}: {
  inProgress?: boolean;
  message: { content: string; isQuestion: boolean };
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: message.isQuestion ? 'flex-end' : 'flex-start'
      }}
    >
      <div
        style={{
          maxWidth: '80%',
          borderRadius: 12,
          padding: 12,
          background: message.isQuestion ? '#3b82f6' : '#e5e7eb',
          color: message.isQuestion ? '#ffffff' : '#1f2937'
        }}
      >
        {message.content}
        {inProgress ? '...' : null}
      </div>
    </div>
  );
}

function ChatMessage({ id, question }: { id: string; question: string }) {
  const { error, data = [], isFetching } = useQuery(
    messagesQueries.detail(id, question)
  );

  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Message message={{ content: question, isQuestion: true }} />
      <Message
        inProgress={isFetching}
        message={{ content: data.join(' '), isQuestion: false }}
      />
    </div>
  );
}

function ChatExample() {
  const [questions, setQuestions] = useState<
    Array<{ id: string; question: string }>
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const submitMessage = () => {
    if (!currentQuestion.trim()) return;

    setQuestions([
      ...questions,
      { id: crypto.randomUUID(), question: currentQuestion.trim() }
    ]);
    setCurrentQuestion('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        maxWidth: 768,
        margin: '0 auto',
        padding: 16
      }}
    >
      <h1
        style={{
          margin: '0 0 16px',
          fontSize: 30,
          color: '#1f2937'
        }}
      >
        TanStack Chat Example
      </h1>
      <div
        style={{
          display: 'grid',
          gap: 16,
          overflowY: 'auto',
          marginBottom: 16,
          flex: 1
        }}
      >
        {questions.map(({ id, question }) => (
          <ChatMessage key={id} id={id} question={question} />
        ))}
      </div>

      <form
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage();
        }}
      >
        <input
          style={{
            flex: 1,
            minWidth: 0,
            padding: 10,
            border: '1px solid #d1d5db',
            borderRadius: 8
          }}
          value={currentQuestion}
          onChange={(event) => setCurrentQuestion(event.target.value)}
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={!currentQuestion.trim()}
          style={{
            border: 0,
            borderRadius: 18,
            padding: '10px 16px',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            cursor: currentQuestion.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatExample />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
