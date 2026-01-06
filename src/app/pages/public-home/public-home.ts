import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente da Home Pública
 *
 * Este componente é carregado imediatamente (eager loading)
 * pois faz parte da área pública sempre acessível
 */
@Component({
  selector: 'app-public-home',
  imports: [RouterLink], // Importa RouterLink para navegação
  templateUrl: './public-home.html',
  styleUrl: './public-home.css',
})
export class PublicHome {

}
