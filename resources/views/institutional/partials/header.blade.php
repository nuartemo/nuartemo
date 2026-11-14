<nav class="main-menu d-flex navbar navbar-expand-lg p-2 py-3 p-lg-4 py-lg-4 ">
    <div class="container-fluid">
      <div class="main-logo d-lg-none">
        <a href="{{ route('home') }}">
          <img src="{{ asset('images/logo.png') }}" alt="logo" class="img-fluid">
        </a>
      </div>

      <button class="navbar-toggler shadow-none" type="button" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">

        <div class="offcanvas-header mt-3">
          <button type="button" class="btn-close shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body justify-content-between">
          <div class="main-logo">
            <a href="{{ route('home') }}">
              <img src="{{ asset('images/logo.png') }}" alt="logo" class="img-fluid">
            </a>
          </div>

          @include('institutional.partials.navigation')

          @if($showKeyPanel ?? false)
              @include('institutional.partials.key-panel-entry')
          @endif

        </div>
      </div>

    </div>
  </nav>
