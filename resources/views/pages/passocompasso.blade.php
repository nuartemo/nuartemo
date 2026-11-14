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
      <span class="last">PassoComPasso</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/passo-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O grupo foi idealizado em 2014 por uma estudante, inicialmente com o nome de "Freedom". 
            Posteriormente, outro aluno assumiu a coordenação, tornando o grupo mais ativo, e a identidade foi renovada com o nome "PassoComPasso". 
            Com a chegada de um novo coordenador, o grupo foi expandido para um Projeto de Extensão, orientado pela professora Karisa, que se afastou no mesmo ano. 
            Em 2022, o grupo segue sendo coordenado por alunos e continua produzindo espetáculos, como O Legado de Rita (2023) e Alice no País das Maravilhas (2025).
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
      <img src="{{ asset('images/carousel/pcp-01.JPG') }}" alt="Apresentação do espetáculo 'Os Gigantes que abrasaram a minha terra'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/pcp-02.JPG') }}" alt="Apresentação do espetáculo 'Os Gigantes que abrasaram a minha terra'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/pcp-03.JPG') }}" alt="Apresentação do espetáculo 'O Leegado de Rita'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/pcp-04.JPG') }}" alt="Apresentação do espetáculo 'O Leegado de Rita'" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/pcp-05.JPG') }}" alt="Apresentação do espetáculo 'O Leegado de Rita'" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/45cd73eac48b5b058b5eeb0c7a3b0b82.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
