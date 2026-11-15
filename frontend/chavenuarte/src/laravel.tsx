import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './app/ErrorBoundary';
import InstitutionalApp from './institutional/InstitutionalApp';
import { initializeTheme } from './theme/preference';
import './styles.css';

initializeTheme();
const root = document.getElementById('chavenuarte-v2-root');
if (!root) throw new Error('Elemento raiz da interface não encontrado.');
if (document.documentElement.dataset.panelAssetsFailed !== 'true') {
    root.dataset.mounted = 'true';
    createRoot(root).render(
        <StrictMode>
            <ErrorBoundary><InstitutionalApp /></ErrorBoundary>
        </StrictMode>,
    );
}
