import { Icon } from './Icon';
export function EmptyState({
    title = 'Nenhum registro',
    description = 'Os registros aparecerão aqui.',
}: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="empty-state" role="status">
            <Icon name="keys" />
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}
export function LoadingState() {
    return (
        <div className="loading-state" role="status" aria-live="polite">
            <div className="loading-bars" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <h2>Carregando dados</h2>
            <p>Aguarde um momento.</p>
        </div>
    );
}
export function ErrorState({ retry }: { retry: () => void }) {
    return (
        <div className="empty-state" role="alert">
            <Icon name="info" />
            <h2>Não foi possível carregar os dados</h2>
            <p>Tente novamente.</p>
            <button className="button button-primary" onClick={retry}>
                Tentar novamente
            </button>
        </div>
    );
}
export function AccessDenied({ production = false }: { production?: boolean }) {
    return (
        <section className="access-state" aria-labelledby="access-title">
            <span className="access-symbol">
                <Icon name="lock" />
            </span>
            <h1 id="access-title">
                {production
                    ? 'Aguardando integração institucional'
                    : 'Acesso não autorizado'}
            </h1>
            <p>
                {production
                    ? 'O acesso será liberado após a integração de identidade e permissões com o backend institucional.'
                    : 'Seu perfil não tem permissão para acessar o painel.'}
            </p>
            {production && (
                <p className="muted-note">
                    O acesso administrativo está desabilitado nesta versão.
                </p>
            )}
        </section>
    );
}
