class Melt extends HTMLElement {
  connectedCallback() {
    this.totalMoved = 0;
    if (!this.hasAttribute('jiggle')) this.jiggle = this.noJiggle;
    this.blend = this.hasAttribute('blend');
    this.src = this.getAttribute('src') || false;
    this.await = this.getAttribute('await') || false;

    this.stepBound = this.step.bind(this);
    this.jiggleBound = this.jiggle.bind(this);

    // create shadow dom and a canvas and attach the two together
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.shadow.appendChild(this.canvas);

    if (this.src) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        this.canvas.setAttribute('width', img.width);
        this.canvas.setAttribute('height', img.height);
        this.ctx.drawImage(img, 0, 0, img.width, img.height);
        this.w = img.width;
        this.h = img.height;
        if (this.await) {
          this.addEventListener(this.await, () => requestAnimationFrame(this.stepBound));
        } else {
          requestAnimationFrame(this.stepBound);
        }
      };
      img.src = this.src;
    } else {
      this.w = Number(this.getAttribute('width')) || 300;
      this.h = Number(this.getAttribute('height')) || 300;
      this.drawBalls();
      requestAnimationFrame(this.stepBound);
    }
  }

  drawBalls() {
    this.ctx.globalAlpha = 1;
    this.canvas.setAttribute("width", this.w);
    this.canvas.setAttribute("height", this.h);

    for (let i = 0; i < 100; i++) {
      this.circle(
        Math.random() * this.w,
        Math.random() * this.h,
        Math.random() * this.w / 10,
        this.randomColour()
      );
    }
  }

  jiggle(x) {
    const shiftProbability = 1 / 8;
    const r = Math.random();
    if (r < shiftProbability && x > 0) x -= 1;
    if (r >= 1 - shiftProbability && x < this.w - 1) x += 1;
    return x;
  }

  noJiggle(x) {
    return x;
  }

  randomByte() {
    return Math.floor(255 * Math.random());
  }

  randomColour() {
    return `rgb(${this.randomByte()},${this.randomByte()},${this.randomByte()})`;
  }

  circle(x, y, r, col) {
    x += 0.5;
    y += 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fillStyle = col;
    this.ctx.fill();
  }

  /*
   * merge pixels to move colours down and transparency up:
   * if the pixel below has some transparency, and the above has some opacity,
   * shift as much opacity from above to below as you can,
   * and do a weighted average of the two colours based on how much opacity
   * below had and how much was transferred
   */
  mergePixels(data, a, b) {
    const alphaA = data[a + 3];
    const alphaB = data[b + 3];
    if (alphaA === 0 || alphaB === 255) return false;

    const finalAlpha = Math.min(alphaA + alphaB, 255);
    const transferred = finalAlpha - alphaB;
    const original = alphaB;
    const inv = 1 / finalAlpha;
    data[b]     = ((data[a]     * transferred + data[b]     * original) * inv + 0.5) | 0;
    data[b + 1] = ((data[a + 1] * transferred + data[b + 1] * original) * inv + 0.5) | 0;
    data[b + 2] = ((data[a + 2] * transferred + data[b + 2] * original) * inv + 0.5) | 0;
    data[b + 3] = finalAlpha;
    data[a + 3] = alphaA - transferred;
    return true;
  }


  step() {
    const w = this.w;
    const h = this.h;
    const blend = this.blend;
    const jiggle = this.jiggleBound;
    const img = this.ctx.getImageData(0, 0, w, h);
    const data = img.data;
    const pixels = new Uint32Array(data.buffer);
    let moved = 0;

    // loop from the bottom to the top
    // moving the upper pixel down if it is
    // non transparent and the pixel below is transparent.
    for (let y = h - 2; y >= 0; y--) {
      const rowAbove = y * w;
      const rowBelow = rowAbove + w;
      for (let x = w - 1; x >= 0; x--) {
        const above = rowAbove + x;
        const below = rowBelow + jiggle(x);
        const aboveByte = above * 4;
        const belowByte = below * 4;
        if (data[belowByte + 3] === 0 && data[aboveByte + 3] !== 0) {
          const tmp = pixels[below];
          pixels[below] = pixels[above];
          pixels[above] = tmp;
          moved++;
        } else if (blend) {
          if (this.mergePixels(data, aboveByte, belowByte)) moved++;
        }
      }
    }
    if (moved > 0) {
      this.ctx.putImageData(img, 0, 0);
      this.totalMoved += moved;
      requestAnimationFrame(this.stepBound);
    }
  }
}

customElements.define('img-melt', Melt);
