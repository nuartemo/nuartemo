// Resolved against the JS module, never against /painel-chaves or the page URL.
export const keySymbolUrl = new URL('../public/chavenuarte-key.svg', import.meta.url).href;

export function panelHomeUrl(): string {
    return document.getElementById('chavenuarte-v2-root')?.dataset.panelUrl ?? './';
}
