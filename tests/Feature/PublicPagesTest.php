<?php

namespace Tests\Feature;

use DOMDocument;
use DOMXPath;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_and_calendar_are_public(): void
    {
        $this->get('/')->assertOk();
        $this->get('/eventos')->assertOk()->assertSee('Agenda');
    }

    #[DataProvider('institutionalPages')]
    public function test_canonical_institutional_pages_are_public_and_named(string $path, string $name, string $content): void
    {
        $response = $this->get($path);

        $response->assertOk()->assertViewIs('pages.'.$name)->assertSeeText($content);
        $this->assertSame($path, route($name, [], false));
    }

    #[DataProvider('legacyPages')]
    public function test_legacy_page_urls_redirect_temporarily_to_the_canonical_url(string $legacy, string $canonical): void
    {
        $this->get($legacy)->assertStatus(302)->assertRedirect($canonical);
    }

    #[DataProvider('pagesWithNavigation')]
    public function test_navigation_and_footer_link_to_canonical_pages(string $path): void
    {
        $response = $this->get($path)->assertOk();
        $xpath = $this->xpath($response->getContent());
        $destinations = [
            '/', '/sobre', '/artevivencias', '/eventos',
            '/projetos/a-cicuta', '/projetos/andaluz', '/projetos/banda-descendentes',
            '/projetos/banda-sn', '/projetos/clube-de-escrita', '/projetos/clube-do-livro',
            '/projetos/flauteando', '/projetos/nuav', '/projetos/passocompasso', '/projetos/rabisco',
        ];

        foreach (['//nav//a[@href]', '//footer//a[@href]'] as $query) {
            $links = [];

            foreach ($xpath->query($query) as $link) {
                $links[] = parse_url($link->getAttribute('href'), PHP_URL_PATH) ?: '/';
            }

            foreach ($destinations as $destination) {
                $this->assertContains($destination, $links, "Missing {$destination} in {$query} on {$path}");
            }
        }

        $this->assertSame(1, $xpath->query('//*[@id="offcanvasNavbar"]')->length);
        $this->assertSame(1, $xpath->query('//button[@data-bs-target="#offcanvasNavbar"]')->length);
    }

    #[DataProvider('pagePaths')]
    public function test_local_assets_are_absolute_and_exist_with_the_exact_filename_case(string $path): void
    {
        $response = $this->get($path)->assertOk();
        $html = $response->getContent();
        $xpath = $this->xpath($html);
        $assets = [];

        foreach ($xpath->query('//img[@src] | //script[@src] | //link[@href]') as $element) {
            $url = $element->getAttribute($element->hasAttribute('src') ? 'src' : 'href');

            if (parse_url($url, PHP_URL_HOST) === parse_url(url('/'), PHP_URL_HOST)) {
                $assets[] = $url;
            } else {
                $this->assertMatchesRegularExpression('~^(?:https?:)?//~', $url, "Relative asset on {$path}: {$url}");
            }
        }

        preg_match_all('~url\([\'"]?([^\'"()]+)[\'"]?\)~', $html, $backgrounds);
        $assets = array_merge($assets, $backgrounds[1]);
        $this->assertNotEmpty($assets);

        foreach ($assets as $asset) {
            $this->assertStringStartsWith(asset('/'), $asset);
            $this->assertFileExists(public_path(ltrim(parse_url($asset, PHP_URL_PATH), '/')));
        }
    }

    public function test_home_keeps_collective_cards_scroll_anchor_and_animated_key_panel_entry(): void
    {
        $response = $this->get('/')->assertOk();
        $xpath = $this->xpath($response->getContent());

        $this->assertSame(10, $xpath->query('//*[@id="category"]//a[@href]')->length);
        $this->assertSame(1, $xpath->query('//a[@href="#scroll"]')->length);
        $this->assertSame(1, $xpath->query('//*[@id="secao-destino"]')->length);
        $response->assertSee('href="'.route('key-panel').'"', false)
            ->assertSee('class="key-panel-label-inner"', false)
            ->assertSee('class="key-panel-icon"', false)
            ->assertSee(asset('css/key-panel-entry.css'), false);
    }

    public function test_nested_collective_page_keeps_its_banner_breadcrumb_gallery_and_integrations(): void
    {
        $response = $this->get('/projetos/andaluz')->assertOk();
        $xpath = $this->xpath($response->getContent());

        $this->assertSame(5, $xpath->query('//main[@id="carousel"]//img')->length);
        $this->assertSame(5, $xpath->query('//input[@name="position"]')->length);
        $response->assertSee(asset('images/banner.png'), false)
            ->assertSee(asset('images/carousel/and-01.JPG'), false)
            ->assertSee('href="'.route('home').'" class="first"', false)
            ->assertSee('//lightwidget.com/widgets/a5399f7d19c05d20ad5e6f85aef4cf0e.html', false)
            ->assertSee('https://vlibras.gov.br/app/vlibras-plugin.js', false)
            ->assertDontSee('class="key-panel-entry"', false);
    }

    public function test_thank_you_keeps_its_original_standalone_presentation(): void
    {
        $response = $this->get('/mensagem-enviada')->assertOk();
        $xpath = $this->xpath($response->getContent());

        $response->assertSee('class="main-tx"', false)
            ->assertSeeText('Agradecemos pelo contato. Em breve retornaremos ;)')
            ->assertSee('href="'.route('home').'"', false);
        $this->assertSame(0, $xpath->query('//nav | //footer | //script | //svg')->length);
    }

    public function test_contact_form_keeps_its_external_endpoint_and_returns_to_the_named_thank_you_page(): void
    {
        $response = $this->get('/sobre')->assertOk();
        $xpath = $this->xpath($response->getContent());

        $this->assertSame('https://api.staticforms.xyz/submit', $xpath->query('//form')->item(0)->getAttribute('action'));
        $this->assertSame(route('thank_you'), $xpath->query('//input[@name="redirectTo"]')->item(0)->getAttribute('value'));
    }

    public function test_migrated_views_have_no_internal_html_or_php_links(): void
    {
        $views = array_merge(
            glob(resource_path('views/pages/*.blade.php')),
            glob(resource_path('views/institutional/partials/*.blade.php')),
            [resource_path('views/layouts/institutional.blade.php')],
        );

        foreach ($views as $view) {
            $this->assertDoesNotMatchRegularExpression(
                '~(?:href|action|src|value)\s*=\s*[\'"](?!https?://|//|mailto:|\#)[^\'"\r\n]*\.(?:html|php)(?:[?\#][^\'"]*)?[\'"]~i',
                file_get_contents($view),
                $view,
            );
        }
    }

    public function test_admin_calendar_requires_authentication(): void
    {
        $this->get('/admin/eventos')->assertRedirect('/login');
    }

    /** @return array<string, array{string, string, string}> */
    public static function institutionalPages(): array
    {
        return [
            'home' => ['/', 'home', 'Nossos coletivos'],
            'about' => ['/sobre', 'about', 'Sobre Nós'],
            'artevivencias' => ['/artevivencias', 'artevivencias', 'ArteVivências'],
            'a_cicuta' => ['/projetos/a-cicuta', 'a_cicuta', 'A Cicuta'],
            'andaluz' => ['/projetos/andaluz', 'andaluz', 'Andaluz'],
            'banda_descendentes' => ['/projetos/banda-descendentes', 'banda_descendentes', 'Banda Descendentes'],
            'banda_sn' => ['/projetos/banda-sn', 'banda_sn', 'Banda SN'],
            'clube_de_escrita' => ['/projetos/clube-de-escrita', 'clube_de_escrita', 'Clube de Escrita'],
            'clube_do_livro' => ['/projetos/clube-do-livro', 'clube_do_livro', 'Clube do Livro'],
            'flauteando' => ['/projetos/flauteando', 'flauteando', 'Flauteando'],
            'nuav' => ['/projetos/nuav', 'nuav', 'NUAV'],
            'passocompasso' => ['/projetos/passocompasso', 'passocompasso', 'PassoComPasso'],
            'rabisco' => ['/projetos/rabisco', 'rabisco', 'Rabisco'],
            'thank_you' => ['/mensagem-enviada', 'thank_you', 'Mensagem enviada!'],
        ];
    }

    /** @return array<string, array{string}> */
    public static function pagePaths(): array
    {
        return array_map(fn (array $page): array => [$page[0]], self::institutionalPages());
    }

    /** @return array<string, array{string}> */
    public static function pagesWithNavigation(): array
    {
        $pages = self::pagePaths();
        unset($pages['thank_you']);

        return $pages;
    }

    /** @return array<string, array{string, string}> */
    public static function legacyPages(): array
    {
        return [
            'index' => ['/index.html', '/'],
            'about' => ['/about.html', '/sobre'],
            'artevivencias' => ['/artevivencias.html', '/artevivencias'],
            'a_cicuta' => ['/a_cicuta.html', '/projetos/a-cicuta'],
            'andaluz' => ['/andaluz.html', '/projetos/andaluz'],
            'banda_descendentes' => ['/banda_descendentes.html', '/projetos/banda-descendentes'],
            'banda_sn' => ['/banda_sn.html', '/projetos/banda-sn'],
            'clube_de_escrita' => ['/clube_de_escrita.html', '/projetos/clube-de-escrita'],
            'clube_do_livro' => ['/clube_do_livro.html', '/projetos/clube-do-livro'],
            'flauteando' => ['/flauteando.html', '/projetos/flauteando'],
            'nuav' => ['/nuav.html', '/projetos/nuav'],
            'passocompasso' => ['/passocompasso.html', '/projetos/passocompasso'],
            'rabisco' => ['/rabisco.html', '/projetos/rabisco'],
            'thank_you' => ['/thank_you.html', '/mensagem-enviada'],
            'events' => ['/eventos.php', '/eventos'],
            'admin_events' => ['/eventos2.php', '/admin/eventos'],
            'login' => ['/login.php', '/login'],
            'feed' => ['/listar_evento.php', '/eventos/feed'],
        ];
    }

    private function xpath(string $html): DOMXPath
    {
        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);

        try {
            $document->loadHTML('<?xml encoding="UTF-8">'.$html);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }

        return new DOMXPath($document);
    }
}
