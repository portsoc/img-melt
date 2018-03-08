img-melt
========

A custom HTML element that melts images pixel by pixel.  Each pixel is compared with the pixel below it and if the supporting (lower) pixel is transparent the upper pixel will fall into its place (their positions are swapped).

* See [the intro page](https://portsoc.github.io/img-melt/) for details.
* See also [the logo examples page](https://portsoc.github.io/img-melt/test/logos.html).


----
For the WebAssembly + WebGL stuff, you need to `npm install` the dev dependencies, to be able to run `grunt` to listen to changes and run the C++ compilation. You need to install emscripten to compile. A guide can be found on their website [here](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).