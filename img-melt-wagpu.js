"use strict"

class Melt extends HTMLElement {

    constructor() {
        super()
    }

    connectedCallback() {

        this.totalMoved = 0
        this.isMoving = false

        if (!this.hasAttribute("jiggle")) {
            this.jiggle = this.noJiggle
        }

        this.blend = this.hasAttribute("blend")
        this.src = this.getAttribute("src") || false
        this.await = this.getAttribute("await") || false

        // create shadow dom and a canvas and attach the two together
        this.shadow = this.attachShadow({mode: "open"})
        this.canvas = document.createElement("canvas")
        // Append it NOT in the shadow root, at first, because emscripten needs to query it
        // in the context creation stage, from within WASM, via ID, and it needs to be visible
        this.appendChild(this.canvas)


        if (this.src) {
            let img = new Image()
            img.crossOrigin = "Anonymous"

            // drawing of the test image - img1
            img.onload = () => {
                this.canvas.id = `${this.getAttribute("id")}-canvas`
                this.canvas.width = img.width
                this.canvas.height = img.height

                // Create the WebAssembly context
                const idBuffer = Module._malloc(this.canvas.id.length+1)
                Module.stringToUTF8(this.canvas.id, idBuffer, this.canvas.id.length+1)
                Module.ccall("createContext", null, ["number", "number", "number", "number", "number"], [img.width, img.height, idBuffer, this.blend?1:0])
                Module._free(idBuffer)

                // NOW, it is moved into the shadow dom
                this.shadow.appendChild(this.canvas)

                // Load and flip the image, then extract it as ImageData
                const loadingCanvas = document.createElement("canvas")
                loadingCanvas.width = img.width
                loadingCanvas.height = img.height
                const loadingContext = loadingCanvas.getContext("2d")
                loadingContext.translate(0, img.height)
                loadingContext.scale(1, -1)

                loadingContext.drawImage(img, 0, 0)
                const imageData = loadingContext.getImageData(0, 0, img.width, img.height).data

                // Pass the imageData to the C++ code
                ccallArrays("loadTexture", null, ["array"], [imageData], {heapIn: "HEAPU8"})


                this.w = img.width
                this.h = img.height

                if (this.await) {
                    this.addEventListener(this.await, () => {
                        if (!this.isMoving) {
                            this.isMoving = true
                            this.step()
                        }
                    })
                } else {
                    this.step()
                }
            }
            img.src = this.src
        } else {
            this.w = this.getAttribute("width") || 300
            this.h = this.getAttribute("height") || 300
            this.drawBalls()
            this.step()
        }
    }

    drawBalls() {
        // this.ctx.globalAlpha = 1
        this.canvas.setAttribute("width", this.w)
        this.canvas.setAttribute("height", this.h)

        console.log("TODO")

        for (let i = 0; i < 100; i++) {
            this.circle(
                Math.random() * this.w,
                Math.random() * this.h,
                Math.random() * this.w / 10,
                this.randomColour()
            )
        }
    }

    randomByte() {
        return Math.floor(255 * Math.random())
    }

    randomColour() {
        return `rgb(${this.randomByte()},${this.randomByte()},${this.randomByte()})`
    }

    circle(x, y, r, col) {
        x += 0.5
        y += 0.5
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.arc(x, y, r, 0, 2 * Math.PI)
        this.ctx.closePath
        this.ctx.fillStyle = col
        this.ctx.fill()
    }

    step() {
        Module.ccall("step", null, null, null)
        requestAnimationFrame(this.step.bind(this))
    }
}

customElements.define("img-melt", Melt)
console.log("[img-melt] Loaded")