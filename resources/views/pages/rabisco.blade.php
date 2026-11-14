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
      <span class="last">Rabisco</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/rabisco-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O Rabisco surgiu através do NuArte, inicialmente formado por um grupo esporádico de alunos orientados pelo professor Marcelo Coelho. 
            Com o retorno à normalidade pós-pandemia, o professor Jerônimo Mailson foi convidado pela professora Euza Raquel para integrar o clube de desenho do Campus Mossoró, assumindo a função de coordenador.
          </p>
          <p>
            Sob sua coordenação, o Laboratório de Desenho II, que estava em desuso, foi transformado na sede do Rabisco, com o apoio de outros docentes do Campus. 
            Após uma grande campanha de doações, o núcleo se consolidou e segue ativo até os dias atuais, participando de festivais, eventos e projetos de extensão, como o "Rabiscos do Amanhã".
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
      <img src="{{ asset('images/carousel/rab-01.jpg') }}" alt="Oficina de Desenho Artístico Básico" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/rab-02.jpg') }}" alt="Oficina de Desenho Artístico Básico" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/rab-03.jpg') }}" alt="Arte de Oficina de Desenho Artístico Básico" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/rab-04.jpg') }}" alt="Arte do professor Jera" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/rab-05.jpg') }}" alt="Arte do aluno Herculano" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/c7e8944f13ba5cfa8e2d488f268d7000.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
