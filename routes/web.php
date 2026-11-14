<?php

use App\Http\Controllers\AuthenticatedSessionController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PublicEventController;
use App\Http\Controllers\SuapLoginController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'pages.home')->name('home');

Route::get('/eventos', [PublicEventController::class, 'index'])->name('events.public');
Route::get('/eventos/feed', [PublicEventController::class, 'feed'])->name('events.feed');
Route::get('/painel-chaves', [SuapLoginController::class, 'keyPanel'])->name('key-panel');
Route::get('/auth/suap/callback', [SuapLoginController::class, 'callback'])->name('suap.callback');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [SuapLoginController::class, 'redirect'])->name('login');
    Route::get('/auth/suap', [SuapLoginController::class, 'redirect'])->name('suap.redirect');
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function (): void {
    Route::resource('eventos', EventController::class)
        ->parameters(['eventos' => 'event'])
        ->only(['index', 'store', 'update', 'destroy'])
        ->names('events');
});

$institutionalPages = [
    'about' => '/sobre',
    'artevivencias' => '/artevivencias',
    'a_cicuta' => '/projetos/a-cicuta',
    'andaluz' => '/projetos/andaluz',
    'banda_descendentes' => '/projetos/banda-descendentes',
    'banda_sn' => '/projetos/banda-sn',
    'clube_de_escrita' => '/projetos/clube-de-escrita',
    'clube_do_livro' => '/projetos/clube-do-livro',
    'flauteando' => '/projetos/flauteando',
    'nuav' => '/projetos/nuav',
    'passocompasso' => '/projetos/passocompasso',
    'rabisco' => '/projetos/rabisco',
    'thank_you' => '/mensagem-enviada',
];

foreach ($institutionalPages as $name => $path) {
    Route::view($path, "pages.{$name}")->name($name);
    Route::redirect("/{$name}.html", $path, 302);
}

Route::redirect('/index.html', '/', 302);
Route::redirect('/eventos.php', '/eventos', 302);
Route::redirect('/eventos2.php', '/admin/eventos', 302);
Route::redirect('/login.php', '/login', 302);
Route::redirect('/listar_evento.php', '/eventos/feed', 302);
