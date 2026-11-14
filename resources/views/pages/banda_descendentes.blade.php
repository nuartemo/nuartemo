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
      <span class="last">Banda Descendentes</span>
    </div>
  </div>

  <section id="about">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/descendentes-logo.png') }}" alt="logo" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>A Banda Descendentes foi formada em junho de 2022 e fez sua estreia no Festival de Artes de agosto do mesmo ano, promovido pelo NuArte. 
            Composta por discentes, a própria banda organiza suas apresentações e parcerias. A banda se manteve autônoma, coordenada pelos próprios alunos, e realizou diversas apresentações dentro e fora do IFRN.
        </p>
        <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-size text-secondary">
              <use href="#tick-circle"/>
            </svg>
            <p class="ps-4">
                O nome do grupo faz alusão à sua origem na antiga formação da banda "Sem Retorno", além de fazer referência à escala descendente no contexto musical.
            </p>
          </div>
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
      <img src="{{ asset('images/carousel/des-01.JPG') }}" alt="Apresentação da Banda Descendentes no 13º Fesival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/des-02.JPG') }}" alt="Apresentação da Banda Descendentes no 13º Festival de Artes" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/des-03.JPG') }}" alt="Apresentação da Banda Descendentes no Anima Chuva 2024" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/des-04.JPG') }}" alt="Apresentação da Banda Descendentes no Anima Chuva 2024" />
    </div>
    <div class="item">
      <img src="{{ asset('images/carousel/des-05.JPG') }}" alt="Apresentação da Banda Descendentes na VI SECITEX" />
    </div>
  </main>
</div>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/85b9dba777335196af27a90bbf20f32f.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
