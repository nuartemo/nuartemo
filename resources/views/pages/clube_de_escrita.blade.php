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
      <span class="last">Clube de Escrita</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/clube_de_escrita-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O Clube de Escrita foi criado em junho de 2022, com o objetivo de oferecer um espaço dedicado à escrita no IFRN - Campus Mossoró. 
            Em 2024, o clube passou a se chamar Clube de Escrita Davi Tintino, em homenagem ao professor que, por vários anos, contribuiu significativamente para a instituição e para o desenvolvimento do clube, mas que infelizmente nos deixou no início daquele ano.
          </p>
          <p>
            Criado por um grupo de alunos com o apoio do professor Demóstenes Vieira, o clube visa explorar e compartilhar a escrita de forma criativa. 
            Inicialmente participando dos “Culturas de Quinta”, expondo textos dos membros e se expandiu com oficinas, concursos literários, atividades no Instagram e projetos de extensão vinculados a ele, como o Alvorecer Literário.
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

  <main id="carousel">
    <div class="item">
      <img src="{{ asset('images/carousel/ces-01.jpeg') }}" alt="Prêmios do I Concurso de Poesias e Contos Natalinos" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/ces-02.jpg') }}" alt="Premiação II Concurso de Contos de Terror" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/ces-03.jpg') }}" alt="Sala de leitura com livros temáticos de Halloween" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 80px; margin-bottom: 30px;">
  <div style="width: 80%; background-color: #fff; border-radius: 15px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); overflow: hidden; padding: 20px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/a6d9652563935b479c853db554427dfe.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; border:0; overflow:hidden;">
    </iframe>
  </div>
</div>
@endsection
