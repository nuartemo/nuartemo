@extends('layouts.institutional')

@section('symbols')
    @include('institutional.partials.symbols-collective')
@endsection

@section('content')
<div class="image-banner">
    <img src="{{ asset('images/banner.png') }}" alt="Banner" class="banner-image" >
    <div id="locator" class="locator">
      <a href="{{ route('home') }}" class="first">Início</a>
      <span class="separator"> » </span>
      <span class="last">Andaluz</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/andaluz-logo.png') }}" alt="img" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O Grupo Andaluz de Teatro surgiu em 2013, por iniciativa da professora Ana Luiza Palhano, integrando as atividades do IFRN - Campus Mossoró a partir de 2016. 
            Desde sua fundação, o grupo sempre busca trazer temáticas de importância política e social em suas montagens. Atualmente o grupo é orientado pela Professora Maria Luiza Lopes.
            "Andaluz significa deixar a sua arte se conectar e brilhar, criar luz, uma luz brilhante de tão feliz."
            </p>
            <div class="d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-size text-secondary">
                  <use href="#tick-circle"/>
                </svg>
                <p class="ps-4">
                    "Andaluz significa deixar a sua arte se conectar e brilhar, criar luz, uma luz brilhante de tão feliz."
                </p>
              </div>
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
      <img src="{{ asset('images/carousel/and-01.JPG') }}" alt="Apresentação do espetáculo 'Triste Otelo'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/and-02.JPG') }}" alt="Apresentação do espetáculo 'Triste Otelo'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/and-03.JPG') }}" alt="Apresentação do espetáculo 'A Justiça Não É Cega'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/and-04.JPG') }}" alt="Apresentação do espetáculo 'A Justiça Não É Cega'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/and-05.JPG') }}" alt="Apresentação do espetáculo 'A Justiça Não É Cega'" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/a5399f7d19c05d20ad5e6f85aef4cf0e.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
