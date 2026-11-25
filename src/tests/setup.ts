import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof globalThis.ResizeObserver !== 'function') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
  const rawGetComputedStyle = window.getComputedStyle.bind(window);
  window.getComputedStyle = ((elt: Element, _pseudoElt?: string | null) =>
    rawGetComputedStyle(elt)) as typeof window.getComputedStyle;
}

if (typeof HTMLCanvasElement !== 'undefined') {
  const createGradientMock = () => ({
    addColorStop: () => {},
  });

  const create2dContextMock = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
    const ctx = {
      canvas,
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      font: '12px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      shadowBlur: 0,
      shadowColor: 'rgba(0,0,0,0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      save: () => {},
      restore: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      transform: () => {},
      setTransform: () => {},
      resetTransform: () => {},
      createLinearGradient: createGradientMock,
      createRadialGradient: createGradientMock,
      createConicGradient: createGradientMock,
      createPattern: () => null,
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      fill: () => {},
      stroke: () => {},
      drawFocusIfNeeded: () => {},
      clip: () => {},
      isPointInPath: () => false,
      isPointInStroke: () => false,
      fillText: () => {},
      strokeText: () => {},
      measureText: (text: string) => {
        const width = String(text ?? '').length * 7;
        return {
          width,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 2,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: width,
          fontBoundingBoxAscent: 10,
          fontBoundingBoxDescent: 2,
          alphabeticBaseline: 0,
          emHeightAscent: 10,
          emHeightDescent: 2,
          hangingBaseline: 8,
          ideographicBaseline: -2,
        } as TextMetrics;
      },
      drawImage: () => {},
      createImageData: (w = 1, h = 1) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4),
        colorSpace: 'srgb' as PredefinedColorSpace,
      }),
      getImageData: (_sx = 0, _sy = 0, sw = 1, sh = 1) => ({
        width: sw,
        height: sh,
        data: new Uint8ClampedArray(Math.max(1, sw) * Math.max(1, sh) * 4),
        colorSpace: 'srgb' as PredefinedColorSpace,
      }),
      putImageData: () => {},
      setLineDash: () => {},
      getLineDash: () => [],
      lineDashOffset: 0,
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arcTo: () => {},
      rect: () => {},
      roundRect: () => {},
      arc: () => {},
      ellipse: () => {},
    };
    return ctx as unknown as CanvasRenderingContext2D;
  };

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value: function getContext(contextId: string) {
      if (contextId === '2d') {
        return create2dContextMock(this as HTMLCanvasElement);
      }
      return null;
    },
  });
}
