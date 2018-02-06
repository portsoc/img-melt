class Melt extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.totalMoved=0;
    if (!this.hasAttribute('jiggle')) this.jiggle = this.noJiggle;
    this.blend = this.hasAttribute('blend');
    this.src = this.getAttribute('src') || false;
    this.await = this.getAttribute('await') || false;

    this.stepBound = this.step.bind(this);

    // create shadow dom and a canvas and attach the two together
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext("2d");
    this.shadow = this.attachShadow({
      mode: 'closed'
    });
    this.shadow.appendChild(this.canvas);


    if (this.src) {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      let obj = this;

      //drawing of the test image - img1
      img.onload = function() {
        // nb 'this' here is the image, so we need obj bounf to this previously
        obj.canvas.setAttribute("width", this.width);
        obj.canvas.setAttribute("height", this.height);
        obj.ctx.drawImage(this, 0, 0, this.width, this.height);
        obj.w = this.width;
        obj.h = this.height;
        if (obj.await) {
          obj.addEventListener(obj.await, () => {
            window.requestAnimationFrame(obj.stepBound);
          });
        } else {
          window.requestAnimationFrame(obj.stepBound);
        }
      }
      img.src = this.src;
    } else {
      this.w = this.getAttribute('width') || 300;
      this.h = this.getAttribute('height') || 300;
      this.drawBalls();
      window.requestAnimationFrame(this.stepBound);
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

  xyToArr(x, y) {
    return (y * this.w + x) * 4;
  }

  jiggle(x) {
    const shiftProbability = 1/8;
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
    this.ctx.closePath;
    this.ctx.fillStyle = col;
    this.ctx.fill();
  }

  swapPixels(data, a, b) {
    const tmp0 = data[b];
    const tmp1 = data[b + 1];
    const tmp2 = data[b + 2];
    const tmp3 = data[b + 3];
    data[b] = data[a];
    data[b + 1] = data[a + 1];
    data[b + 2] = data[a + 2];
    data[b + 3] = data[a + 3];
    data[a] = tmp0;
    data[a + 1] = tmp1;
    data[a + 2] = tmp2;
    data[a + 3] = tmp3;
  }

  /*
   * merge pixels to move colours down and transparency up:
   * if the pixel below has some transparency, and the above has some opacity,
   * shift as much opacity from above to below as you can,
   * and do a weighted average of the two colours based on how much opacity
   * below had and how much was transferred
   */
  mergePixels(data, a, b) {
    if ((data[a+3] === 0) || (data[b+3] === 255)) return false;

    const finalAlpha = Math.min(data[a+3] + data[b+3], 255);
    const transferred = finalAlpha - data[b+3];
    const original = data[b+3];
    function weightedAvg(a,b) {
      return Math.round((a*transferred + b*original) / finalAlpha);
    }
    data[b] = weightedAvg(data[a], data[b]);
    data[b+1] = weightedAvg(data[a+1], data[b+1]);
    data[b+2] = weightedAvg(data[a+2], data[b+2]);
    data[b+3] = finalAlpha;
    data[a+3] -= transferred;
    return true;
  }


  step() {
    let img = this.ctx.getImageData(0, 0, this.w, this.h);
    let moved = 0;

    // loop from the bottom to the top
    // moving the upper pixel down if it is
    // non transparent and the pixel below is transparent.
    for (let y = this.h-2; y >= 0; y--) {
      for (let x = this.w-1; x >= 0; x--) {
        const above = this.xyToArr(x, y);
        const below = this.xyToArr(this.jiggle(x), y+1);
        if (img.data[below + 3] == 0 && img.data[above + 3] != 0) {
          moved++;
          this.swapPixels(img.data, above, below);
        } else if (this.blend) {
          if (this.mergePixels(img.data, above, below)) moved++;
        }
      }
    }
    if (moved > 0) {
      this.ctx.putImageData(img, 0, 0, 0, 0, this.w, this.h);
      window.requestAnimationFrame(this.stepBound);
      this.totalMoved += moved;
    }
  }
}

customElements.define('img-melt', Melt);
