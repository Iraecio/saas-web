import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  OnDestroy,
  HostListener,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-magic-cube',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scene">
      <div class="container">
        <div class="rubiks-cube rubiks-cube-1" [style.transform]="cubeTransform()">
          @for (i of cubies; track $index) {
            <div class="detail">
              <div class="side front"></div>
              <div class="side back"></div>
              <div class="side top"></div>
              <div class="side bottom"></div>
              <div class="side left"></div>
              <div class="side right"></div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .scene {
      position: absolute;
      top: 50%;
      left: 25%;
      transform: translate(-50%, -50%);
      perspective: 2400px;
      perspective-origin: 50% 50%;
    }

    .container {
      position: relative;
    }

    .rubiks-cube {
      will-change: transform;
    }

    .rubiks-cube-1 {
      transform-style: preserve-3d;
      transform-origin: 50% 50% -270px;
      width: 810px;
      height: 810px;
    }

    .rubiks-cube-1 .detail {
      position: absolute;
      width: 270px;
      height: 270px;
      transform-style: preserve-3d;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: linear;
      will-change: transform;
    }

    .rubiks-cube-1 .detail .side {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      border: 2px solid rgba(255, 255, 255, 0.75);
      border-radius: 4px;
    }

    .rubiks-cube-1 .detail .side.front { transform: translateZ(135px); }
    .rubiks-cube-1 .detail .side.back { transform: translateZ(-135px) rotateY(180deg); }
    .rubiks-cube-1 .detail .side.top { transform: translateY(-50%) rotateX(90deg); }
    .rubiks-cube-1 .detail .side.bottom { transform: translateY(50%) rotateX(-90deg); }
    .rubiks-cube-1 .detail .side.left { transform: translateX(-50%) rotateY(-90deg); }
    .rubiks-cube-1 .detail .side.right { transform: translateX(50%) rotateY(90deg); }

    /* Posicionamento dos 27 cubies (3x3x3) */
    .rubiks-cube-1 .detail:nth-child(1) { margin-top: 0; margin-left: 0; transform-origin: 150% 150% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(2) { margin-top: 0; margin-left: 270px; transform-origin: 50% 150% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(3) { margin-top: 0; margin-left: 540px; transform-origin: -50% 150% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(4) { margin-top: 0; margin-left: 0; transform-origin: 150% 150% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(5) { margin-top: 0; margin-left: 270px; transform-origin: 50% 150% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(6) { margin-top: 0; margin-left: 540px; transform-origin: -50% 150% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(7) { margin-top: 0; margin-left: 0; transform-origin: 150% 150% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(8) { margin-top: 0; margin-left: 270px; transform-origin: 50% 150% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(9) { margin-top: 0; margin-left: 540px; transform-origin: -50% 150% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(10) { margin-top: 270px; margin-left: 0; transform-origin: 150% 50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(11) { margin-top: 270px; margin-left: 270px; transform-origin: 50% 50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(12) { margin-top: 270px; margin-left: 540px; transform-origin: -50% 50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(13) { margin-top: 270px; margin-left: 0; transform-origin: 150% 50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(14) { margin-top: 270px; margin-left: 270px; transform-origin: 50% 50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(15) { margin-top: 270px; margin-left: 540px; transform-origin: -50% 50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(16) { margin-top: 270px; margin-left: 0; transform-origin: 150% 50% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(17) { margin-top: 270px; margin-left: 270px; transform-origin: 50% 50% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(18) { margin-top: 270px; margin-left: 540px; transform-origin: -50% 50% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(19) { margin-top: 540px; margin-left: 0; transform-origin: 150% -50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(20) { margin-top: 540px; margin-left: 270px; transform-origin: 50% -50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(21) { margin-top: 540px; margin-left: 540px; transform-origin: -50% -50% -270px; transform: translateZ(0); }
    .rubiks-cube-1 .detail:nth-child(22) { margin-top: 540px; margin-left: 0; transform-origin: 150% -50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(23) { margin-top: 540px; margin-left: 270px; transform-origin: 50% -50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(24) { margin-top: 540px; margin-left: 540px; transform-origin: -50% -50% 0; transform: translateZ(-270px); }
    .rubiks-cube-1 .detail:nth-child(25) { margin-top: 540px; margin-left: 0; transform-origin: 150% -50% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(26) { margin-top: 540px; margin-left: 270px; transform-origin: 50% -50% 270px; transform: translateZ(-540px); }
    .rubiks-cube-1 .detail:nth-child(27) { margin-top: 540px; margin-left: 540px; transform-origin: -50% -50% 270px; transform: translateZ(-540px); }

    /* Animações de montagem/desmontagem por cubie */
    .rubiks-cube-1 .detail:nth-child(1) { animation-name: rc1-d1; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(2) { animation-name: rc1-d2; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(3) { animation-name: rc1-d3; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(4) { animation-name: rc1-d4; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(5) { animation-name: rc1-d5; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(6) { animation-name: rc1-d6; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(7) { animation-name: rc1-d7; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(8) { animation-name: rc1-d8; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(9) { animation-name: rc1-d9; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(10) { animation-name: rc1-d10; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(11) { animation-name: rc1-d11; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(12) { animation-name: rc1-d12; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(13) { animation-name: rc1-d13; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(14) { animation-name: rc1-d14; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(15) { animation-name: rc1-d15; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(16) { animation-name: rc1-d16; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(17) { animation-name: rc1-d17; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(18) { animation-name: rc1-d18; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(19) { animation-name: rc1-d19; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(20) { animation-name: rc1-d20; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(21) { animation-name: rc1-d21; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(22) { animation-name: rc1-d22; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(23) { animation-name: rc1-d23; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(24) { animation-name: rc1-d24; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(25) { animation-name: rc1-d25; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(26) { animation-name: rc1-d26; animation-duration: 16s; }
    .rubiks-cube-1 .detail:nth-child(27) { animation-name: rc1-d27; animation-duration: 16s; }

    @keyframes rc1-d1 {
      5% { transform: translateZ(0); }
      10% { transform: translateZ(0) rotateY(-90deg); }
      15%, 45% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg); }
      50%, 55% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      60% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg); }
      65%, 80% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg); }
      85%, 100% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg); }
    }

    @keyframes rc1-d2 {
      5% { transform: translateZ(0); }
      10%, 15% { transform: translateZ(0) rotateY(-90deg); }
      20% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg); }
      25%, 45% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg); }
      50%, 70% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateY(-90deg); }
      75%, 80% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(-90deg); }
      85%, 100% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(-90deg) rotateY(90deg); }
    }

    @keyframes rc1-d3 {
      5% { transform: translateZ(0); }
      10%, 15% { transform: translateZ(0) rotateY(-90deg); }
      20%, 50% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg); }
      55% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg); }
      60%, 80% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg); }
      85% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg) rotateY(90deg); }
      90%, 100% { transform: translateZ(0) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg) rotateY(90deg) rotateX(90deg); }
    }

    @keyframes rc1-d4 {
      5% { transform: translateZ(-270px); }
      10% { transform: translateZ(-270px) rotateY(-90deg); }
      15%, 20% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg); }
      25%, 40% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
      45%, 75% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg); }
      80%, 85% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      90% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      95%, 100% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d5 {
      5% { transform: translateZ(-270px); }
      10%, 25% { transform: translateZ(-270px) rotateY(-90deg); }
      30%, 45% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg); }
      50%, 65% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      70%, 75% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg); }
      80%, 100% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
    }

    @keyframes rc1-d6 {
      5% { transform: translateZ(-270px); }
      10%, 30% { transform: translateZ(-270px) rotateY(-90deg); }
      35%, 50% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg); }
      55%, 70% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg); }
      75%, 80% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg); }
      85% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg) rotateY(90deg); }
      90%, 100% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg) rotateY(90deg) rotateX(90deg); }
    }

    @keyframes rc1-d7 {
      5% { transform: translateZ(-540px); }
      10% { transform: translateZ(-540px) rotateY(-90deg); }
      15%, 35% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg); }
      40% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
      45%, 60% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg); }
      65%, 85% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      90% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      95%, 100% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d8 {
      5% { transform: translateZ(-540px); }
      10%, 25% { transform: translateZ(-540px) rotateY(-90deg); }
      30%, 35% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg); }
      40% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
      45%, 60% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg); }
      65%, 70% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      75%, 90% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      95%, 100% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d9 {
      5% { transform: translateZ(-540px); }
      10%, 40% { transform: translateZ(-540px) rotateY(-90deg); }
      45% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg); }
      50% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      55%, 60% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg); }
      65%, 100% { transform: translateZ(-540px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
    }

    @keyframes rc1-d10 {
      5%, 15% { transform: translateZ(0); }
      20%, 25% { transform: translateZ(0) rotateX(90deg); }
      30%, 45% { transform: translateZ(0) rotateX(90deg) rotateY(90deg); }
      50%, 55% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
      60%, 75% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateX(90deg); }
      80% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateX(90deg) rotateY(90deg); }
      85%, 100% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateX(90deg) rotateY(90deg) rotateX(90deg); }
    }

    @keyframes rc1-d11 {
      5%, 20% { transform: translateZ(0); }
      25% { transform: translateZ(0) rotateY(-90deg); }
      30% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg); }
      35%, 55% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      60%, 65% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg); }
      70% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateY(90deg); }
      75% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateY(90deg) rotateX(90deg); }
      80%, 85% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateY(90deg) rotateX(90deg) rotateY(90deg); }
      90%, 100% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateZ(-90deg) rotateY(90deg) rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
    }

    @keyframes rc1-d12 {
      5%, 20% { transform: translateZ(0); }
      25%, 40% { transform: translateZ(0) rotateY(-90deg); }
      45%, 50% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg); }
      55%, 60% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
      65% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateX(-90deg); }
      70%, 90% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
      95%, 100% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateZ(90deg); }
    }

    @keyframes rc1-d13 {
      5%, 15% { transform: translateZ(-270px); }
      20% { transform: translateZ(-270px) rotateX(90deg); }
      25%, 30% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg); }
      35% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateY(-90deg); }
      40%, 70% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateX(90deg); }
      75%, 100% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d14 {
      5%, 20% { transform: translateZ(-270px); }
      25% { transform: translateZ(-270px) rotateY(-90deg); }
      30% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg); }
      35%, 65% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      70% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg); }
      75% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg) rotateY(-90deg); }
      80%, 100% { transform: translateZ(-270px) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg); }
    }

    @keyframes rc1-d15 {
      5%, 20% { transform: translateZ(-270px); }
      25%, 30% { transform: translateZ(-270px) rotateY(-90deg); }
      35%, 50% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg); }
      55%, 70% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg); }
      75%, 90% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg); }
      95%, 100% { transform: translateZ(-270px) rotateY(-90deg) rotateZ(-90deg) rotateX(90deg) rotateZ(-90deg) rotateX(90deg); }
    }

    @keyframes rc1-d16 {
      5%, 10% { transform: translateZ(-540px); }
      15%, 30% { transform: translateZ(-540px) rotateZ(90deg); }
      35% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg); }
      40%, 45% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      50%, 65% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      70%, 85% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
      90%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg); }
    }

    @keyframes rc1-d17 {
      5%, 10% { transform: translateZ(-540px); }
      15%, 20% { transform: translateZ(-540px) rotateZ(90deg); }
      25% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg); }
      30% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
      35%, 40% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg); }
      45%, 65% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg) rotateZ(-90deg); }
      70% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg) rotateZ(-90deg) rotateX(90deg); }
      75% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg) rotateZ(-90deg) rotateX(90deg) rotateY(-90deg); }
      80%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg) rotateZ(-90deg) rotateX(90deg) rotateY(-90deg) rotateX(90deg); }
    }

    @keyframes rc1-d18 {
      5%, 10% { transform: translateZ(-540px); }
      15%, 30% { transform: translateZ(-540px) rotateZ(90deg); }
      35% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg); }
      40%, 60% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      65% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      70%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d19 {
      5%, 15% { transform: translateZ(0); }
      20%, 40% { transform: translateZ(0) rotateX(90deg); }
      45% { transform: translateZ(0) rotateX(90deg) rotateY(90deg); }
      50% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
      55%, 85% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg); }
      90% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg) rotateZ(90deg); }
      95%, 100% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg); }
    }

    @keyframes rc1-d20 {
      5%, 30% { transform: translateZ(0); }
      35%, 40% { transform: translateZ(0) rotateX(90deg); }
      45% { transform: translateZ(0) rotateX(90deg) rotateY(90deg); }
      50% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
      55%, 75% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg); }
      80%, 100% { transform: translateZ(0) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateY(90deg) rotateX(-90deg); }
    }

    @keyframes rc1-d21 {
      5%, 35% { transform: translateZ(0); }
      40% { transform: translateZ(0) rotateY(-90deg); }
      45%, 50% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg); }
      55% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg); }
      60%, 90% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg); }
      95%, 100% { transform: translateZ(0) rotateY(-90deg) rotateX(90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
    }

    @keyframes rc1-d22 {
      5%, 15% { transform: translateZ(-270px); }
      20% { transform: translateZ(-270px) rotateX(90deg); }
      25%, 55% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg); }
      60%, 75% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateX(90deg); }
      80%, 90% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateX(90deg) rotateZ(90deg); }
      95%, 100% { transform: translateZ(-270px) rotateX(90deg) rotateZ(90deg) rotateX(90deg) rotateZ(90deg) rotateX(90deg) rotateY(90deg); }
    }

    @keyframes rc1-d23 {
      5%, 25% { transform: translateZ(-270px); }
      30%, 60% { transform: translateZ(-270px) rotateZ(90deg); }
      65% { transform: translateZ(-270px) rotateZ(90deg) rotateY(-90deg); }
      70%, 75% { transform: translateZ(-270px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      80% { transform: translateZ(-270px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      85%, 100% { transform: translateZ(-270px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
    }

    @keyframes rc1-d24 {
      5%, 25% { transform: translateZ(-270px); }
      30%, 35% { transform: translateZ(-270px) rotateZ(90deg); }
      40%, 55% { transform: translateZ(-270px) rotateZ(90deg) rotateX(-90deg); }
      60% { transform: translateZ(-270px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
      65%, 70% { transform: translateZ(-270px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg); }
      75%, 100% { transform: translateZ(-270px) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg) rotateZ(-90deg); }
    }

    @keyframes rc1-d25 {
      5%, 10% { transform: translateZ(-540px); }
      15% { transform: translateZ(-540px) rotateZ(90deg); }
      20%, 35% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg); }
      40%, 45% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      50%, 80% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg); }
      85% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg); }
      90%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateX(-90deg) rotateY(-90deg) rotateX(-90deg); }
    }

    @keyframes rc1-d26 {
      5%, 10% { transform: translateZ(-540px); }
      15% { transform: translateZ(-540px) rotateZ(90deg); }
      20%, 25% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg); }
      30%, 50% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateX(90deg); }
      55% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateX(90deg) rotateY(90deg); }
      60%, 65% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateX(90deg) rotateY(90deg) rotateZ(90deg); }
      70%, 85% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateX(90deg); }
      90%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateX(90deg) rotateY(90deg) rotateZ(90deg) rotateX(90deg) rotateY(90deg); }
    }

    @keyframes rc1-d27 {
      5%, 10% { transform: translateZ(-540px); }
      15% { transform: translateZ(-540px) rotateZ(90deg); }
      20%, 35% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg); }
      40%, 55% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      60% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg); }
      65%, 80% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg); }
      85%, 90% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg); }
      95%, 100% { transform: translateZ(-540px) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg) rotateZ(90deg) rotateY(-90deg) rotateX(90deg); }
    }
  `],
})
export class MagicCubeComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private mouseX = 0;
  private mouseY = 0;
  private rotationX = -25;
  private rotationY = -30;
  private rafId = 0;

  cubies = Array.from({ length: 27 });
  cubeTransform = signal('rotateX(-25deg) rotateY(-30deg)');

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  }

  private animate = (): void => {
    if (!isPlatformBrowser(this.platformId)) return;

    const targetX = -25 + this.mouseY * 40;
    const targetY = -30 + this.mouseX * 60;

    this.rotationX += (targetX - this.rotationX) * 0.08;
    this.rotationY += (targetY - this.rotationY) * 0.08;

    this.cubeTransform.set(
      `rotateX(${this.rotationX.toFixed(2)}deg) rotateY(${this.rotationY.toFixed(2)}deg)`
    );

    this.rafId = requestAnimationFrame(this.animate);
  };
}
