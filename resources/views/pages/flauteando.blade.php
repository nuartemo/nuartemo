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
      <span class="last">Flauteando</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/flauteando-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>O Flauteando surgiu a partir de uma ideia do aluno Luiz Emílio (Lowis), ao perceber que as flautas do IFRN - Campus Mossoró estavam se deteriorando sem serem utilizadas. 
            Embora já houvesse um grupo de flautas anteriormente, o laboratório oferecia poucas práticas musicais, e nenhuma delas incluía instrumentos de sopro ou possuía vagas ilimitadas, como as aulas de "bandão". 
            Isso fazia com que muitas pessoas ficassem de fora tanto das aulas práticas quanto teóricas.
        </p>
        <p>
            Diante disso, Lowis decidiu unir prática e teoria, reformando os instrumentos e incentivando a prática musical coletiva, começando do zero com todos os interessados. 
            Hoje, o grupo se apresenta em eventos musicais, contribuindo para a difusão da cultura musical tanto no campus quanto na comunidade externa.
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
      <img src="{{ asset('images/carousel/fla-01.JPG') }}" alt="Apresentação do Flauteando no 13º Festival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/fla-02.JPG') }}" alt="Apresentação do Flauteando no 13º Festival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/fla-03.JPG') }}" alt="Apresentação do Flauteando no 11º Festival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/fla-04.jpg') }}" alt="Apresentação do Flauteando no 12º Festival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/fla-05.jpg') }}" alt="Apresentação do Flauteando no 12º Festival de Artes" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/7c567eaaa5c85902a2746f9e0b95c757.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
