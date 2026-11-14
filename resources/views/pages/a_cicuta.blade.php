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
      <span class="last">A Cicuta</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/cicuta-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>Voltado para os apaixonados pela Filosofia, o grupo A Cicuta surgiu em 2023 como um espaço de discussão e articulação de ideias filosóficas, além de promover eventos e debates sobre temas relevantes da área.
          </p>
          <p>
            Além de suas atividades internas, o grupo também desenvolve parcerias e colaborações com o NEABI (Núcleo de Estudos Afrobrasileiros e Indígenas) do IFRN - Campus Mossoró, realizando exposições e atividades que buscam integrar diferentes saberes e perspectivas.
          </p>
        </div>
      </div>
    </div>
  </section>
</section>

<div id="carousel" class="carousel-style">
  <input type="radio" name="position" checked />
  <input type="radio" name="position" />
  <main id="carousel">
    <div class="item">
      <img src="{{ asset('images/carousel/cic-01.jpg') }}" alt="Sarau Filosófico" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/cic-02.jpg') }}" alt="Árvores de Escrevivências Setembro Amarelo" />
    </div>
  </main>
</div>
@endsection
