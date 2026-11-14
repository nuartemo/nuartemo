@extends('layouts.institutional')

@section('symbols')
    @include('institutional.partials.symbols')
@endsection

@section('content')
<div class="image-banner">
    <img src="{{ asset('images/banner.png') }}" alt="Banner" class="banner-image" >
    <div id="locator" class="locator">
      <a href="{{ route('home') }}" class="first">Início</a>
      <span class="separator"> » </span>
      <span class="last">Banda SN</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/sn-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>A Banda SN surgiu após a edição de 2023 da SEMADEC (Semana Artística, Desportiva e Cultural) do IFRN - Campus Mossoró, na qual a maioria de seus membros participou. 
            Com o apoio do ex-monitor de música Clayton e do professor Magnaldo, do IFRN - Campus Apodi, que realizava uma pesquisa no campus Mossoró, as quatro bandas formadas durante a SEMADEC se uniram para refletir sobre a experiência e discutir possíveis novos projetos.
          </p>
          <p>
            Inicialmente composta por 12 membros e sem um nome oficial, a banda passou por diversas alterações e reorganizações até realizar sua primeira apresentação no campus.
          </p>
        </div>
      </div>
    </div>
  </section>
</section>

<div id="carousel" class="carousel-style">
  <input type="radio" name="position" checked />
  <input type="radio" name="position" />
  <input type="radio" name="position" />
  <input type="radio" name="position" />
  <input type="radio" name="position" />
  <main id="carousel">
    <div class="item">
      <img src="{{ asset('images/carousel/sn-01.JPG') }}" alt="Apresentação da Banda SN no 13º Fesival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/sn-02.JPG') }}" alt="Apresentação da Banda SN no 13º Fesival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/sn-03.JPG') }}" alt="Apresentação da Banda SN no 13º Fesival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/sn-04.JPG') }}" alt="Apresentação da Banda SN no 13º Fesival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/sn-05.JPG') }}" alt="Apresentação da Banda SN no 13º Fesival de Artes" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/918d7efc2d1756cf99fcb4b3dfca1126.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
