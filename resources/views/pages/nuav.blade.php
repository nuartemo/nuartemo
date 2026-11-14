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
      <span class="last">NUAV</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/nuav-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>Em 2016, calouros do curso de Informática produziram um curta-metragem para a disciplina de Artes Visuais, ministrada pela professora Maria Luiza Lopes. 
            A partir dessa experiência, o interesse pelo audiovisual cresceu entre os estudantes, resultando na criação do Núcleo de Audiovisual (NUAV) do IFRN - Campus Mossoró em 2018.
          </p>
          <p>
            Inicialmente informal, o núcleo ofereceu a oficina "Como produzir um curta-metragem: primeiros passos", despertando o interesse de novos alunos pela produção audiovisual. 
            Em 2019, o NUAV foi oficialmente lançado como grupo.
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
      <img src="{{ asset('images/carousel/nua-01.JPG') }}" alt="Exposição Cores do Coração" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/nua-02.jpg') }}" alt="Exposição Preto e Branco" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/nua-03.jpg') }}" alt="Cinebate temático Abril Indígena" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/nua-04.jpg') }}" alt="Cinebate temático Setembro Amarelo" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/c52bda9ee76d51a29478e8cfef3c5225.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
