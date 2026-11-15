<?php
// Active V2 presentation for the existing SUAP-protected /painel-chaves entry.
$panelDirectory = 'chavenuarte-v2';
$panelScripts = [];
$panelStyles = [];
$panelIcon = null;
$panelAssetsReady = false;
try {
    $manifestPath = public_path($panelDirectory.'/manifest.json');
    if (! is_file($manifestPath)) {
        throw new \RuntimeException('Missing panel manifest.');
    }
    $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
    if (! is_array($manifest) || ! ($manifest['src/laravel.tsx']['isEntry'] ?? false)) {
        throw new \RuntimeException('Invalid panel entry.');
    }
    $visited = [];
    $collect = function ($key) use (&$collect, &$visited, &$panelStyles, $manifest, $panelDirectory) {
        if (isset($visited[$key])) {
            return;
        }
        $visited[$key] = true;
        $entry = $manifest[$key] ?? null;
        if (! is_array($entry) || ! isset($entry['file'])) {
            throw new \RuntimeException('Missing panel chunk.');
        }
        foreach (array_merge([$entry['file']], $entry['css'] ?? [], $entry['assets'] ?? []) as $file) {
            if (! is_string($file) || ! preg_match('~\Aassets/[a-zA-Z0-9_.-]+\.(?:js|css|svg)\z~', $file) ||
                ! is_file(public_path($panelDirectory.'/'.$file))) {
                throw new \RuntimeException('Missing or invalid panel asset.');
            }
        }
        foreach ($entry['css'] ?? [] as $css) {
            $panelStyles[$css] = $css;
        }
        foreach (array_merge($entry['imports'] ?? [], $entry['dynamicImports'] ?? []) as $import) {
            $collect($import);
        }
    };
    // Validate the full graph before emitting any CSS/JS, including lazy screens.
    $collect('src/laravel.tsx');
    $icon = $manifest['public/chavenuarte-key.svg']['file'] ?? null;
    if (! is_string($icon) || ! preg_match('~\Aassets/chavenuarte-key-[a-zA-Z0-9_-]+\.svg\z~', $icon) ||
        ! is_file(public_path($panelDirectory.'/'.$icon))) {
        throw new \RuntimeException('Missing panel icon.');
    }
    $panelIcon = asset($panelDirectory.'/'.$icon);
    $panelScripts[] = asset($panelDirectory.'/'.$manifest['src/laravel.tsx']['file']);
    $panelStyles = array_map(fn ($file) => asset($panelDirectory.'/'.$file), array_values($panelStyles));
    if ($panelStyles === []) {
        throw new \RuntimeException('Missing panel stylesheet.');
    }
    $panelAssetsReady = true;
} catch (\Throwable $exception) {
    // Fail visibly without exposing paths, manifest contents, session or exception details.
    $panelScripts = [];
    $panelStyles = [];
    $panelIcon = null;
}
?>
<!doctype html>
<html lang="pt-BR" class="chavenuarte-v2">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>">
    <meta name="theme-color" content="#ffffff">
    <meta name="description" content="Gestão de chaves e espaços do NUARTE.">
    <title>ChaveNUARTE · Visão geral</title>
    <?php if ($panelIcon): ?>
        <link rel="icon" type="image/svg+xml" href="<?= e($panelIcon) ?>">
    <?php endif; ?>
    <style>
        .chavenuarte-v2 .asset-state { box-sizing: border-box; max-width: 42rem; margin: 10vh auto; padding: 1.5rem; font: 1rem/1.6 system-ui, sans-serif; color: #263a32; background: #fff; border: 1px solid #dfe7df; border-radius: 1rem; }
        .chavenuarte-v2 .asset-state a { color: #205b3b; }
    </style>
    <?php foreach ($panelStyles as $css): ?>
        <link rel="stylesheet" href="<?= e($css) ?>" data-panel-asset onerror="document.documentElement.dataset.panelAssetsFailed = 'true'">
    <?php endforeach; ?>
</head>
<body>
    <div id="chavenuarte-v2-root" data-panel-url="<?= e(route('key-panel')) ?>" data-suap-identifier="<?= e(session('suap.key_panel_identifier')) ?>">
        <main class="asset-state" aria-live="polite">
            <h1><?= $panelAssetsReady ? 'Abrindo ChaveNUARTE' : 'Interface temporariamente indisponível' ?></h1>
            <p><?= $panelAssetsReady ? 'Aguarde o carregamento da interface.' : 'Os arquivos da interface não estão disponíveis. Informe a equipe responsável.' ?></p>
            <p><a href="<?= e(route('key-panel')) ?>">Recarregar painel</a> · <a href="<?= e(route('home')) ?>">Voltar ao site</a></p>
        </main>
    </div>
    <noscript><p class="asset-state">Ative o JavaScript para abrir o ChaveNUARTE.</p></noscript>
    <?php if ($panelAssetsReady): ?>
        <script>
            (() => {
                const root = document.getElementById('chavenuarte-v2-root');
                const fallback = root.firstElementChild.cloneNode(true);
                function unavailable() {
                    document.documentElement.dataset.panelAssetsFailed = 'true';
                    fallback.querySelector('h1').textContent = 'Interface temporariamente indisponível';
                    fallback.querySelector('p').textContent = 'Não foi possível carregar os arquivos da interface. Recarregue o painel.';
                    root.replaceChildren(fallback);
                }
                if (document.documentElement.dataset.panelAssetsFailed === 'true') unavailable();
                window.addEventListener('error', (event) => {
                    if (event.target instanceof Element && event.target.hasAttribute('data-panel-asset')) unavailable();
                }, true);
                window.setTimeout(() => { if (!root.dataset.mounted) unavailable(); }, 20000);
            })();
        </script>
        <?php foreach ($panelScripts as $js): ?>
            <script type="module" src="<?= e($js) ?>" data-panel-asset></script>
        <?php endforeach; ?>
    <?php endif; ?>
</body>
</html>
