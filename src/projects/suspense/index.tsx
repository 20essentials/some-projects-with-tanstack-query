import 'font-awesome/css/font-awesome.min.css';
import { lazy, Suspense, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  noop,
  useQueryClient
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';

import { projectsQueryOptions } from './queries';

import Button from './components/Button';

const Projects = lazy(() => import('./components/Projects'));
const Project = lazy(() => import('./components/Project'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

function Example() {
  const queryClient = useQueryClient();
  const [showProjects, setShowProjects] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  return (
    <>
      <Button
        onClick={() => {
          if (!showProjects) {
            queryClient.query(projectsQueryOptions).catch(noop);
          }
          setShowProjects(old => !old);
        }}
      >
        {showProjects ? 'Hide Projects' : 'Show Projects'}
      </Button>

      <hr />

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div>
                There was an error!{' '}
                <Button onClick={() => resetErrorBoundary()}>Try again</Button>
                <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
              </div>
            )}
            onReset={reset}
          >
            {showProjects ? (
              <Suspense fallback={<h1>Loading projects...</h1>}>
                {activeProject ? (
                  <Project
                    activeProject={activeProject}
                    setActiveProject={setActiveProject}
                  />
                ) : (
                  <Projects setActiveProject={setActiveProject} />
                )}
              </Suspense>
            ) : null}
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
      <ReactQueryDevtools initialIsOpen />
    </>
  );
}
