import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DrawingLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  duration: number;
  delay: number;
  totalLength?: number;
}

@Component({
  selector: 'app-geometric-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 overflow-hidden">
      <svg
        class="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: rgb(249, 250, 251); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgb(243, 244, 246); stop-opacity: 1" />
          </linearGradient>

          <linearGradient id="darkBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: rgb(3, 7, 18); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: rgb(15, 23, 42); stop-opacity: 1" />
          </linearGradient>

          <style>
            @keyframes drawStroke {
              0% {
                stroke-dashoffset: var(--length, 500);
              }
              100% {
                stroke-dashoffset: 0;
              }
            }

            @keyframes fadeOut {
              0%, 90% {
                opacity: 1;
              }
              100% {
                opacity: 0;
              }
            }

            .drawing-line {
              animation:
                drawStroke linear forwards,
                fadeOut ease-in forwards;
              fill: none;
              stroke-linecap: round;
              stroke-linejoin: round;
              stroke-width: 2;
            }

            .glow-effect {
              filter: drop-shadow(0 0 2px currentColor);
            }
          </style>
        </defs>

        <!-- Background Gradient -->
        <rect width="1200" height="800" fill="url(#bgGradient)" class="dark:fill-[url(#darkBgGradient)]" />

        <!-- Drawing Container -->
        <g class="drawing-group glow-effect">
          @for (line of lines(); let i = $index; track i) {
            <line
              [attr.x1]="line.x1"
              [attr.y1]="line.y1"
              [attr.x2]="line.x2"
              [attr.y2]="line.y2"
              stroke="currentColor"
              [attr.stroke-dasharray]="line.totalLength"
              class="drawing-line text-neutral-400 dark:text-neutral-600"
              [style.--length]="line.totalLength + 'px'"
              [style.animation-duration]="line.duration + 'ms, ' + (line.duration + 500) + 'ms'"
              [style.animation-delay]="line.delay + 'ms, ' + line.delay + 'ms'"
            />
          }
        </g>
      </svg>
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
  `],
})
export class GeometricBackgroundComponent implements OnInit {
  lines = signal<DrawingLine[]>([]);

  ngOnInit(): void {
    this.generateNewDrawing();
    // Gerar novo desenho a cada 12 segundos
    setInterval(() => this.generateNewDrawing(), 12000);
  }

  private generateNewDrawing(): void {
    const drawingType = this.randomInt(0, 3);
    let newLines: DrawingLine[] = [];

    switch (drawingType) {
      case 0:
        newLines = this.generateCube();
        break;
      case 1:
        newLines = this.generateTetrahedron();
        break;
      case 2:
        newLines = this.generatePyramid();
        break;
      case 3:
        newLines = this.generateOctahedron();
        break;
    }

    this.lines.set(newLines);
  }

  private generateCube(): DrawingLine[] {
    const lines: DrawingLine[] = [];
    const offsetX = this.randomInt(200, 1000);
    const offsetY = this.randomInt(150, 650);
    const scale = this.randomInt(80, 150);

    // Perspectiva 3D
    const perspectiveX = 0.3;
    const perspectiveY = 0.2;

    // Vértices do cubo com perspectiva
    const vertices = [
      // Face frontal
      [offsetX, offsetY],
      [offsetX + scale, offsetY],
      [offsetX + scale, offsetY + scale],
      [offsetX, offsetY + scale],
      // Face traseira (com perspectiva)
      [offsetX + scale * perspectiveX, offsetY + scale * perspectiveY],
      [offsetX + scale + scale * perspectiveX, offsetY + scale * perspectiveY],
      [offsetX + scale + scale * perspectiveX, offsetY + scale + scale * perspectiveY],
      [offsetX + scale * perspectiveX, offsetY + scale + scale * perspectiveY],
    ];

    const edgesOrder = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Face frontal
      [4, 5], [5, 6], [6, 7], [7, 4], // Face traseira
      [0, 4], [1, 5], [2, 6], [3, 7], // Arestas de profundidade
    ];

    const lineDuration = 400;
    edgesOrder.forEach((edge, index) => {
      const [v1, v2] = edge;
      const [x1, y1] = vertices[v1];
      const [x2, y2] = vertices[v2];
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      lines.push({
        x1,
        y1,
        x2,
        y2,
        duration: lineDuration,
        delay: index * 150,
        totalLength: length,
      });
    });

    return lines;
  }

  private generateTetrahedron(): DrawingLine[] {
    const lines: DrawingLine[] = [];
    const offsetX = this.randomInt(250, 1000);
    const offsetY = this.randomInt(200, 650);
    const scale = this.randomInt(100, 180);

    const vertices = [
      [offsetX + scale, offsetY + scale * 1.2], // Topo
      [offsetX, offsetY + scale * 2.2], // Base esquerda
      [offsetX + scale * 2, offsetY + scale * 2.2], // Base direita
      [offsetX + scale, offsetY + scale * 0.4], // Traseiro superior
    ];

    const edges = [
      [0, 1], [0, 2], [0, 3], // Do topo
      [1, 2], [1, 3], [2, 3], // Base e profundidade
    ];

    const lineDuration = 350;
    edges.forEach((edge, index) => {
      const [v1, v2] = edge;
      const [x1, y1] = vertices[v1];
      const [x2, y2] = vertices[v2];
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      lines.push({
        x1,
        y1,
        x2,
        y2,
        duration: lineDuration,
        delay: index * 120,
        totalLength: length,
      });
    });

    return lines;
  }

  private generatePyramid(): DrawingLine[] {
    const lines: DrawingLine[] = [];
    const offsetX = this.randomInt(200, 950);
    const offsetY = this.randomInt(150, 600);
    const scale = this.randomInt(100, 170);
    const perspective = 0.25;

    const vertices = [
      [offsetX + scale, offsetY], // Topo
      [offsetX, offsetY + scale * 1.8], // Base esquerda
      [offsetX + scale * 2, offsetY + scale * 1.8], // Base direita
      [offsetX + scale * 2, offsetY + scale * 1.8], // Base direita traseira
      [offsetX + scale * (2 + perspective), offsetY + scale * 1.8 + scale * perspective], // Base direita 3D
      [offsetX + scale * perspective, offsetY + scale * 1.8 + scale * perspective], // Base esquerda 3D
    ];

    const edges = [
      [0, 1], [0, 2], // Arestas do topo
      [1, 2], // Base frontal
      [0, 4], [0, 5], // Arestas traseiras
      [4, 5], // Base traseira
      [1, 5], [2, 4], // Arestas laterais 3D
    ];

    const lineDuration = 400;
    edges.forEach((edge, index) => {
      const [v1, v2] = edge;
      const [x1, y1] = vertices[v1];
      const [x2, y2] = vertices[v2];
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      lines.push({
        x1,
        y1,
        x2,
        y2,
        duration: lineDuration,
        delay: index * 130,
        totalLength: length,
      });
    });

    return lines;
  }

  private generateOctahedron(): DrawingLine[] {
    const lines: DrawingLine[] = [];
    const offsetX = this.randomInt(250, 950);
    const offsetY = this.randomInt(200, 650);
    const scale = this.randomInt(80, 140);

    const vertices = [
      [offsetX + scale, offsetY], // Topo
      [offsetX + scale, offsetY + scale * 2], // Fundo
      [offsetX, offsetY + scale], // Esquerda
      [offsetX + scale * 2, offsetY + scale], // Direita
      [offsetX + scale * 0.7, offsetY + scale * 0.7], // Traseiro esquerdo
      [offsetX + scale * 1.3, offsetY + scale * 1.3], // Traseiro direito
    ];

    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5], // Do topo
      [1, 2], [1, 3], [1, 4], [1, 5], // Do fundo
      [2, 4], [3, 5], [2, 5], [3, 4], // Arestas laterais
    ];

    const lineDuration = 400;
    edges.forEach((edge, index) => {
      const [v1, v2] = edge;
      const [x1, y1] = vertices[v1];
      const [x2, y2] = vertices[v2];
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

      lines.push({
        x1,
        y1,
        x2,
        y2,
        duration: lineDuration,
        delay: index * 110,
        totalLength: length,
      });
    });

    return lines;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
