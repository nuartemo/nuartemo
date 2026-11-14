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
      <span class="last">ArteVivências</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/artevivencias-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O projeto ArteVivências visa, através de experiências, apresentações e exposições artísticas em regiões com baixo investimento, fomentar a inclusão cultural, incentivar a criatividade e o pensamento crítico, estabelecendo-se como uma potente ferramenta de mobilização e transformação social. 
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
      <img src="{{ asset('images/carousel/atv-01.jpg') }}" alt="Oficina de flautas na E.E. Sólon Moura" />
    </div>
    <div class="item">
      <img src="{{ asset('images//carousel/atv-02.jpg') }}" alt="Oficina de aquarela na E.E. Padre Alfredo" />
    </div>
    <div class="item">
      <img src="{{ asset('images//carousel/atv-03.jpg') }}" alt="Oficina de música na E.E. Governador Dix-Sept Rosado" />
    </div>
    <div class="item">
      <img src="{{ asset('images//carousel/atv-04.jpg') }}" alt="Oficina de fotografia na E.E. Cunha da Mota" />
    </div>
    <div class="item">
      <img src="{{ asset('images//carousel/atv-05.jpg') }}" alt="Oficina de desenho na E.E. Aida Ramalho" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/e36b54f374005d2b8052b19ed6d7ca9f.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
