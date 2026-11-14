import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './app/ErrorBoundary';
import { LoadingState } from './components/States';
import './styles.css';
import { initializeTheme } from './theme/preference';
initializeTheme();

// Vite eliminates the dev import and its full module graph from production.
const App = import.meta.env.DEV
    ? lazy(() => import('./dev/DevelopmentApp'))
    : lazy(() => import('./app/ProductionApp'));

const root = document.getElementById('root');
if (!root) throw new Error('Elemento raiz da interface não encontrado.');
createRoot(root).render(
    <StrictMode>
        <ErrorBoundary>
            <Suspense fallback={<LoadingState />}>
                <App />
            </Suspense>
        </ErrorBoundary>
    </StrictMode>,
);
