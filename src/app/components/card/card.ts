import { Component, Input, ContentChild, TemplateRef } from '@angular/core';

/**
 * COMPONENTE CARD - COMPOSIÇÃO E CONTENT PROJECTION
 * ==================================================
 *
 * Este componente demonstra um padrão importante:
 * "Content Projection" - permitir que o pai injete conteúdo
 *
 * BENEFÍCIO:
 * ✅ Flexibilidade extrema
 * ✅ Componente adaptável a qualquer conteúdo
 * ✅ Separação de responsabilidades
 */

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class CardComponent {

  /**
   * INPUTS - Propriedades customizáveis
   */

  // Título do card
  @Input() title: string = '';

  // Subtítulo do card
  @Input() subtitle: string = '';

  // Nivel de elevação (sombra)
  @Input() elevation: 1 | 2 | 3 = 1;

  /**
   * Content Projection
   * ==================
   * Permite que o componente pai injete conteúdo customizado
   *
   * Exemplo de uso:
   * <app-card title="Meu Card">
   *   <p>Conteúdo customizado aqui!</p>
   * </app-card>
   */

  get cardClass(): string {
    return `card-elevation-${this.elevation}`;
  }
}

