<!DOCTYPE html>
<html lang="pt-BR">

<head>
    @include('institutional.partials.head')
</head>

<body @isset($bodyClass)class="{{ $bodyClass }}"@endisset>
    @unless($standalone ?? false)
        @yield('symbols')
        @include('institutional.partials.preloader')
        @include('institutional.partials.header')
    @endunless

    @yield('content')

    @unless($standalone ?? false)
        @include('institutional.partials.footer')
        @include('institutional.partials.scripts')
    @endunless
</body>

</html>
