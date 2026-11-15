<?php
// Isolated presentation test: no Laravel bootstrap, .env, auth, database or routes.
// The view uses native PHP supported by Blade, so it can also be rendered without vendor/.
declare(strict_types=1);
$repository = dirname(__DIR__, 3);
$assetPrefix = getenv('CHAVENUARTE_TEST_PREFIX') ?: '';
$artifactFixture = null;
$sessionIdentifier = getenv('CHAVENUARTE_TEST_IDENTIFIER') ?: null;
function public_path(string $path): string { global $repository, $artifactFixture; return ($artifactFixture ?? $repository.'/public').'/'.$path; }
function asset(string $path): string { global $assetPrefix; return 'http://127.0.0.1:4176'.$assetPrefix.'/'.$path; }
function route(string $name): string { global $assetPrefix; return $assetPrefix.($name === 'home' ? '/' : '/painel-chaves'); }
function session(string $key): ?string { global $sessionIdentifier; return $key === 'suap.key_panel_identifier' ? $sessionIdentifier : null; }
function csrf_token(): string { return 'test-csrf-presentation-only'; }
function e(mixed $value): string { return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function renderPanel(): string {
    global $repository;
    ob_start();
    include $repository.'/resources/views/pages/key-panel.blade.php';
    return ob_get_clean();
}
if (getenv('CHAVENUARTE_TEST_MISSING')) { $artifactFixture = sys_get_temp_dir().'/chavenuarte-no-artifact'; }
if (in_array('--html', $argv, true)) { echo renderPanel(); exit; }
function check(bool $condition, string $message): void { if (! $condition) { throw new RuntimeException($message); } }
$html = renderPanel();
check(hash_file('sha256', $repository.'/resources/views/pages/key-panel-legacy.blade.php') === 'e061ed56e69eacbf1c945016684f50a802ee10d0544653f71fe6b2d04d2782b4', 'Legacy rollback copy changed.');
check(str_contains($html, 'id="chavenuarte-v2-root"'), 'The active panel view must mount V2.');
check(str_contains($html, 'type="module"'), 'Valid manifest must load the React entry.');
check(str_contains($html, 'csrf-token'), 'CSRF meta missing.');
check(!str_contains($html, 'chavenuarte-assets/'), 'Legacy assets loaded.');
check(!str_contains($html, '/build/'), 'Global Vite artifact loaded.');
check(!str_contains($html, 'bootstrap'), 'Institutional/global styles loaded.');
check(!str_contains($html, 'suap.key_panel_identifier'), 'Identity leaked.');
check(file_get_contents($repository.'/resources/views/pages/key-panel-legacy.blade.php') !== file_get_contents($repository.'/resources/views/pages/key-panel.blade.php'), 'Rollback copy must remain separate.');
$sessionIdentifier = 'provided-session-identifier';
check(str_contains(renderPanel(), 'data-suap-identifier="provided-session-identifier"'), 'Existing session identifier not reused.');
$sessionIdentifier = 'id"<script>unsafe</script>';
check(! str_contains(renderPanel(), $sessionIdentifier), 'Session identifier must be escaped.');
$sessionIdentifier = null;
$assetPrefix = '/nuarte';
check(str_contains(renderPanel(), '/nuarte/chavenuarte-v2/assets/'), 'Subdirectory missing.');
$artifactFixture = sys_get_temp_dir().'/chavenuarte-blade-'.bin2hex(random_bytes(6));
mkdir($artifactFixture.'/chavenuarte-v2', 0777, true);
try {
    $html = renderPanel();
    check(str_contains($html, 'Interface temporariamente indisponível'), 'Missing manifest fallback.');
    check(!str_contains($html, 'type="module"'), 'Invalid artifact must not execute.');
    $manifestFile = $artifactFixture.'/chavenuarte-v2/manifest.json';
    foreach (['{invalid', '{}', '{"src/laravel.tsx":{"isEntry":true,"file":"../escape.js"}}',
        '{"src/laravel.tsx":{"isEntry":true,"file":"assets/missing.js"}}'] as $invalid) {
        file_put_contents($manifestFile, $invalid);
        check(str_contains(renderPanel(), 'Interface temporariamente indisponível'), 'Corrupt artifact fallback.');
    }
    unlink($manifestFile);
} finally {
    rmdir($artifactFixture.'/chavenuarte-v2');
    rmdir($artifactFixture);
}
echo "View Blade/PHP: renderização isolada aprovada, CSRF, subdiretório, manifesto ausente/inválido e assets ausentes.\n";
echo "Helpers simulados; não executa o compilador Blade, o controller, a sessão SUAP ou o banco.\n";
