@extends('layouts.institutional', ['standalone' => true, 'bodyClass' => 'main-tx'])

@section('content')
<div class="message-box">
    <h1 class="text-tx">Mensagem enviada!</h1>
    <p class="p-tx">Agradecemos pelo contato. Em breve retornaremos ;)</p>
    <a href="{{ route('home') }}" class="btn btn-primary btn-xl mt-5">Início</a>
  </div>
@endsection
