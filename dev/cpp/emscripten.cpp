#include <emscripten.h>
#include <string>
#include <vector>
#include <GLES2/gl2.h>
#include <EGL/egl.h>
extern "C" {
    #include "html5.h"
}
#include "Context.cpp"

std::vector<Context*> contexts;

int main(int argc, char const *argv[]) {
    printf("[WASM] Loaded\n");

    EM_ASM(
        if (typeof window!="undefined") {
            window.dispatchEvent(new CustomEvent("wasmLoaded"))
        } else {
            global.onWASMLoaded && global.onWASMLoaded()
        }
    );

    return 0;
}


extern "C" {

    EMSCRIPTEN_KEEPALIVE
    void clearContexts (void) {
        for (int c=0; c<contexts.size(); c++) {
            delete contexts[c];
        }
        contexts.clear();
    }

    EMSCRIPTEN_KEEPALIVE
    int createContext (int width, int height, char * id, int blend) {
        contexts.push_back(new Context(width, height, id, blend));
        free(id);
        return contexts.size() - 1;
    }

    EMSCRIPTEN_KEEPALIVE
    void loadTexture (uint8_t *buf, int bufSize, int contextIndex) {
        contexts[contextIndex]->run(buf);
        free(buf);
    }

    EMSCRIPTEN_KEEPALIVE
    void step (int contextIndex) {
        contexts[contextIndex]->step();
    }
}