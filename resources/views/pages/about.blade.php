@extends('layouts.institutional', ['mobileCapability' => 'mobile-web-app-capable'])

@section('symbols')
    @include('institutional.partials.symbols')
@endsection

@section('content')
<div class="image-banner">
    <img src="{{ asset('images/banner.png') }}" alt="Banner" class="banner-image" >
    <div id="locator" class="locator">
      <a href="{{ route('home') }}" class="first">Início</a>
      <span class="separator"> » </span>
      <span class="last">Sobre Nós</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/about-img1.JPG') }}" alt="img" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O Núcleo de Arte do IFRN - Campus Mossoró (NUARTE/MO) faz parte da política de extensão do IFRN e visa contribuir para a formação crítica, artística, cultural e cidadã de estudantes, servidores e da comunidade mossoroense, além de estabelecer um espaço de formação continuada e fomento ao surgimento e manutenção de novos coletivos artísticos no âmbito do campus. 
            Com o lema que "Nuarte não para não", o NUARTE/MO construiu uma história de arte e resistência que esteve presente nos títulos de seus projetos, mas também em sua trajetória.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Segundo bloco com parágrafo corrido -->
  <div class="container">
    <div class="row mt-xl-5">
      <div class="col-12">
        <h2 class="display-6 fw-semibold">Quem faz acontecer?</h2>
        <p>
            Os eventos organizados pelo NUARTE/MO são desenvolvidos por orientadores, coordenadores, bolsistas e integrantes do Núcleo no geral. 
            A atual orientadora do NUARTE/MO é a Professora Mestra Maria Luiza Lopes, que também orienta o grupo Andaluz de Teatro. 
            Já a coordenação do Núcleo de Artes e de cada grupo é exercida pelos próprios estudantes do campus, o NuArte é coordenado pelos bolsistas selecionados, que também são parte do corpo estudantil do IFRN/MO.
        </p>
      </div>
    </div>
  </div>
</section>

<div class="image-wrapper">
  <img src="{{ asset('images/about-img2.JPG') }}" alt="img" style="border-radius: 20px;">
</div>

<div class="center-container">
  <section id="contact">
    <h2 class="display-6 fw-semibold">Fale Conosco</h2>
    <form action="https://api.staticforms.xyz/submit" method="post">
      <label for="name">Nome</label>
      <input type="text" id="name" name="name" placeholder="Digite seu nome" autocomplete="off" required>
      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" placeholder="Digite seu e-mail" autocomplete="off" required>
      <label for="message">Mensagem</label>
      <textarea id="message" name="message" cols="30" rows="10" placeholder="Digite sua mensagem" required></textarea>
      <button class="btn btn-primary px-5 py-3 mt-4" type="submit">Enviar</button>
      <input type="hidden" name="accessKey" value="6828b976-cf21-466e-a7cf-d9291f261b9f">
      <input type="hidden" name="redirectTo" value="{{ route('thank_you') }}">
    </form>
  </section>
</div>
@endsection
