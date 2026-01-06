import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * COMPONENTE BUTTON - EXEMPLO DE COMPONENTE REUTILIZÁVEL
 * =======================================================
 *
 * Este é um exemplo de componente que segue a arquitetura orientada a componentes.
 *
 * CARACTERÍSTICAS DE REUTILIZAÇÃO:
 *
 * 1. @Input: Propriedades que recebem dados do componente pai
 *    - Permite customização do componente
 *    - Torna o componente flexível e reutilizável
 *
 * 2. @Output: Eventos que o componente emite para o pai
 *    - Permite comunicação bidirecional
 *    - Desacopla o componente da lógica do pai
 *
 * 3. Estilos Encapsulados (ViewEncapsulation)
 *    - CSS não vaza para outros componentes
 *    - Evita conflitos de estilos
 *
 * BENEFÍCIOS:
 * ✅ Reutilizável em múltiplos lugares
 * ✅ Fácil de manter e testar
 * ✅ Responsável por uma única coisa (Button)
 * ✅ Design System consistente
 */

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {

  /**
   * INPUTS - Propriedades que o componente pai pode passar
   * ======================================================
   */

  // Texto que aparecerá no botão
  @Input() label: string = 'Clique aqui';

  // Tipo do botão: 'primary', 'secondary', 'danger', 'success', etc
  @Input() type: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';

  // Tamanho do botão: 'small', 'medium', 'large'
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  // Se o botão está desabilitado
  @Input() disabled: boolean = false;

  // Se o botão está em estado de carregamento
  @Input() loading: boolean = false;

  // Ícone antes do texto (emoji ou classe de ícone)
  @Input() icon: string = '';

  /**
   * OUTPUTS - Eventos que o componente emite para o pai
   * ===================================================
   */

  // Evento emitido quando o botão é clicado
  // O componente pai pode escutar com (click)="meuMetodo()"
  @Output() buttonClick = new EventEmitter<void>();

  /**
   * Método chamado quando o botão é clicado
   * Emite um evento que o componente pai pode escutar
   */
  onClick(): void {
    // Se desabilitado ou carregando, não faz nada
    if (this.disabled || this.loading) {
      return;
    }

    // Emite o evento para o componente pai
    this.buttonClick.emit();
  }

  /**
   * Getter para a classe CSS do botão
   * Retorna classes dinâmicas baseadas nos @Input
   */
  get buttonClass(): string {
    const classes = [
      `btn-${this.type}`,     // Classe do tipo
      `btn-${this.size}`,     // Classe do tamanho
      this.loading ? 'btn-loading' : '',
      this.disabled ? 'btn-disabled' : ''
    ];

    return classes.filter(c => c).join(' ');
  }
}

