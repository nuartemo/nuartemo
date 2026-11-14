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
      <span class="last">Clube do Livro</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/clube_do_livro-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>No campus Mossoró, o Clube do Livro existe desde 2016 se formando institucionalmente em 2017 e com atuações quer difusas junto ao Núcleo De Artes Do Campus Mossoró e/ou clube filosófico-literários, quer articulados em projetos de extensão ou ensino: ele tem em sua trajetória uma pluralidade de (sobre)vivência e resistência.
          </p>
          <p>
            O clube se caracteriza por encontros literários nos quais seus participantes trocam experiências e debatem ludicamente sobre obras literárias. 
            Tais obras podem ou não ser consideradas cânones desde que despertem a participação da comunidade para as linguagens e artes discutidas no IFRN e promova um novo olhar sobre a literatura a partir da apreciação literária de diversos tipos narrativa.
          </p>
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
      <img src="{{ asset('images/carousel/cll-01.jpeg') }}" alt="Encontro especial Halloween" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/cll-02.jpeg') }}" alt="Visita externa" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/cll-03.jpeg') }}" alt="Encontro online" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/cll-04.jpeg') }}" alt="Encontro online" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/c8cacee1dbef57d994ae3d037d569cf9.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
