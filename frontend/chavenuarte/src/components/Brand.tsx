export function Brand({ onNavigate }: { onNavigate?: () => void }) {
    return (
        <a
            href="./"
            className="brand"
            aria-label="ChaveNUARTE — Visão geral"
            onClick={(event) => {
                if (onNavigate) {
                    event.preventDefault();
                    onNavigate();
                }
            }}
        >
            <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <use href="./chavenuarte-key.svg#chavenuarte-key" />
                </svg>
            </span>
            <span className="brand-name">
                Chave<strong>NUARTE</strong>
            </span>
        </a>
    );
}
