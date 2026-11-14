          <ul class="navbar-nav menu-list list-unstyled align-items-lg-center d-flex gap-md-3 mb-0 w-100 justify-content-center">
              <a href="{{ route('home') }}" class="nav-link mx-4 active">Início</a>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link mx-4 dropdown-toggle align-items-center" role="button" id="groups"
                data-bs-toggle="dropdown" aria-expanded="false">Grupos</a>
              <ul class="dropdown-menu" aria-labelledby="groups">
                <li><a href="{{ route('a_cicuta') }}" class="dropdown-item">A Cicuta<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('andaluz') }}" class="dropdown-item">Andaluz<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('banda_descendentes') }}" class="dropdown-item">Banda Descendentes<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('banda_sn') }}" class="dropdown-item">Banda SN<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('clube_de_escrita') }}" class="dropdown-item">Clube de Escrita Davi Tintino<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('clube_do_livro') }}" class="dropdown-item">Clube do Livro<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('flauteando') }}" class="dropdown-item">Flauteando<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('nuav') }}" class="dropdown-item">NUAV<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('passocompasso') }}" class="dropdown-item">PassoComPasso<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
                <li><a href="{{ route('rabisco') }}" class="dropdown-item">Rabisco<span
                      class="badge bg-secondary text-white ms-2"></span></a></li>
              </ul>
            </li>

            <li class="nav-item">
              <a href="{{ route('artevivencias') }}" class="nav-link mx-4">ArteVivências</a>
            </li>

            <li class="nav-item">
              <a href="{{ route('events.public') }}" class="nav-link mx-4" id="eventos">Eventos</a>
            </li>

            <li class="nav-item">
              <a href="{{ route('about') }}" class="nav-link mx-4" id="about">Sobre Nós</a>
            </li>

          </ul>
