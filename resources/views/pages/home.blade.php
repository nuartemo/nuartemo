@extends('layouts.institutional', ['showKeyPanel' => true])

@section('styles')
<link rel="stylesheet" type="text/css" href="{{ asset('css/key-panel-entry.css') }}">
@endsection

@section('symbols')
    @include('institutional.partials.symbols-home')
@endsection

@section('content')
<section id="hero" style="background-image:url('{{ asset('images/billboard-bg.png') }}'); background-repeat: no-repeat; background-size: cover; background-position: center;">
    <div class="container">
      <div class="row align-items-center">
        <!-- Coluna com o logo e botão -->
        <div class="col-md-6 pe-5 mt-5 mt-md-0">
          <img src="{{ asset('images/logo-resized.png') }}" alt="Logo" class="img-fluid" style="max-width: 100%; height: auto;"/>
          <a class="btn btn-primary btn-xl mt-5" href="#scroll" style="padding: 15px 50px; margin: 20px;" onclick="document.getElementById('secao-destino').scrollIntoView({behavior: 'smooth'});">Saiba mais</a>
        </div>
        <!-- Coluna com a imagem do billboard -->
        <div class="col-md-6 mt-5" >
          <img src="{{ asset('images/billboard-img.png') }}" alt="img" class="img-fluid" style="max-width: 100%; height: auto;">
        </div>
      </div>
    </div>
  </section>

  <section id="features">
    <div class="feature-box container">
      <div class="row ">
        <div class="col-md-3 col-sm-6 mb-5 mb-md-0">
          <div class="feature-item py-5  rounded-4">
            <div class="feature-detail text-center">
              <h2 class="feature-title">10</h2>
              <h6 class="feature-info text-uppercase">Grupos e coletivos artísticos</h6>

            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-5 mb-md-0">
          <div class="feature-item py-5  rounded-4">
            <div class="feature-detail text-center">
              <h2 class="feature-title">2</h2>
              <h6 class="feature-info text-uppercase">Festivais de Arte por ano</h6>

            </div>
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-5 mb-md-0">
          <div class="feature-item py-5  rounded-4">
            <div class="feature-detail text-center">
              <h2 class="feature-title">5</h2>
              <h6 class="feature-info text-uppercase">Culturas de Quinta por ano</h6>

            </div>
            
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-5 mb-md-0">
          <div class="feature-item py-5  rounded-4">
            <div class="feature-detail text-center">
              <h2 class="feature-title">5</h2>
              <h6 class="feature-info text-uppercase">Escolas estaduais contempladas com o projeto ArteVivências</h6>

            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <section id="about" class="padding-medium mt-xl-5">
    <div class="container">
      <div class="row align-items-center mt-xl-5">
        <div class="offset-md-1 col-md-5">
          <img src="{{ asset('images/ind-01.JPG') }}" alt="img" class="img-fluid rounded-circle" id="secao-destino">
        </div>
        <div class="col-md-5 mt-5 mt-md-0">
          <div class="mb-3">
            <p class="text-secondary">Descubra um pouco sobre nós</p>
            <h2 class="display-6 fw-semibold">Quem somos nós?</h2>
          </div>
          <p>
            O Núcleo de Artes do IFRN - Campus Mossoró (NUARTE/MO) integra a política de extensão do IFRN e tem como objetivo contribuir para a formação crítica, artística, cultural e cidadã de estudantes, servidores e da comunidade de Mossoró, promovendo também o surgimento de novos coletivos artísticos. 
            É subdividido em grupos que abordam diferentes formas de arte, incluindo A Cicuta e Rabisco, Banda Descendentes, Banda SN, Clube do Livro, Cia de Dança PassoComPasso, Flauteando Clube de Escrita, Grupo Andaluz de Teatro e NUAV (Núcleo de Audiovisual), todos coordenados pelos próprios estudantes.
          </p>
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-size text-secondary">
              <use href="#tick-circle"/>
            </svg>
            <p class="ps-4">
              Os eventos organizados pelo NUARTE/MO são desenvolvidos por 
              <span style="color:#ee0979; font-weight:bold;">orientadores, coordenadores, bolsistas e integrantes do núcleo no geral</span>.
            </p>
          </div>
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-size text-secondary">
              <use href="#tick-circle"/>
            </svg>
            <p class="ps-4">
              A atual orientadora do NuArte/MO é a professora 
              <span style="color:#ee0979; font-weight:bold;">Maria Luiza Lopes</span>.
            </p>
          </div>
          <a href="{{ route('about') }}" class="btn btn-primary px-5 py-3 mt-4">Saiba Mais</a>
        </div>
      </div>
    </div>
  </section>

<section id="category">
  <div class="container ">
    <div class="d-md-flex justify-content-between align-items-center">
      <div>
        <p class="text-secondary ">Conheça os nossos coletivos</p>
        <h2 class="display-6 fw-semibold">Nossos coletivos</h2>
      </div>
    </div>
    <div class="row g-md-3 mt-2">
      <!-- Primeira Coluna -->
      <div class="col-md-4">
        <div class="primary rounded-3 p-4 my-3">
          <a href="{{ route('a_cicuta') }}" class="text-decoration-none">
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px" >
                <use href="#quote" class="svg-primary" />
              </svg>
              <div class="ps-4">
                <p class="category-paragraph fw-bold text-uppercase mb-1">A Cicuta</p>
              </div>
            </div>
          </a>
        </div>
        <div class="primary rounded-3 p-4 my-3">
          <a href="{{ route('andaluz') }}" class="text-decoration-none">
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
                <use href="#emoji-grin-fill" class="svg-tertiary" />
              </svg>
              <div class="ps-4">
                <p class="category-paragraph fw-bold text-uppercase mb-1">Andaluz</p>
              </div>
            </div>
          </a>
        </div>
        <div class="primary rounded-3 p-4 my-3">
          <a href="{{ route('banda_descendentes') }}" class="text-decoration-none">
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
                <use href="#music-note-beamed" class="svg-secondary" />
              </svg>
              <div class="ps-4">
                <p class="category-paragraph fw-bold text-uppercase mb-1">Banda Descendentes</p>
              </div>
            </div>
          </a>
        </div>
        <div class="primary rounded-3 p-4 my-3">
          <a href="{{ route('banda_sn') }}" class="text-decoration-none">
            <div class="d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
                <use href="#music-note-beamed" class="svg-secondary" />
              </svg>
              <div class="ps-4">
                <p class="category-paragraph fw-bold text-uppercase mb-1">Banda SN</p>
              </div>
            </div>
          </a>
        </div>
      </div>
      <!-- Segunda Coluna -->
      <div class="col-md-4">
        <div class="secondary rounded-3 p-4 my-3">
          <a href="{{ route('clube_de_escrita') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#feather" class="svg-gray" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">Clube de Escrita Davi Tintino</p>
            </div>
          </div>
          </a>
        </div>
        <div class="secondary rounded-3 p-4 my-3">
          <a href="{{ route('clube_do_livro') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#book-half" class="svg-secondary" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">Clube do Livro</p>
            </div>
          </div>
          </a>
        </div>
        <div class="secondary rounded-3 p-4 my-3">
          <a href="{{ route('flauteando') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#music-note" class="svg-tertiary" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">Flauteando</p>
            </div>
          </div>
          </a>
        </div>
      </div>
      <!-- Terceira Coluna -->
      <div class="col-md-4">
        <div class="tertiary rounded-3 p-4 my-3">
          <a href="{{ route('nuav') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#film" class="svg-tertiary" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">NUAV</p>
            </div>
          </div>
          </a> 
        </div>
        <div class="tertiary rounded-3 p-4 my-3">
          <a href="{{ route('passocompasso') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#person-arms-up" class="svg-tertiary" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">PassoComPasso</p>
            </div>
          </div>
          </a>
        </div>
        <div class="tertiary rounded-3 p-4 my-3">
          <a href="{{ route('rabisco') }}" class="text-decoration-none">
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="60px" height="60px">
              <use href="#palette" class="svg-primary" />
            </svg>
            <div class="ps-4">
              <p class="category-paragraph fw-bold text-uppercase mb-1">Rabisco</p>
            </div>
          </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- LightWidget WIDGET -->
<div style="display: flex; justify-content: center; align-items: center; margin-top: 50px; margin-bottom: 50px;">
  <div style="width: 80%; max-width: 900px; padding: 20px; background-color: #ffffff; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); border-radius: 15px;">
    <script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
    <iframe src="//lightwidget.com/widgets/36c3c445111a5e01ae70497ef7bf5541.html" scrolling="no" allowtransparency="true" class="lightwidget-widget" style="width:100%; height: 400px; border: 0; overflow: hidden; border-radius: 15px;">
    </iframe>
  </div>
</div>
@endsection
