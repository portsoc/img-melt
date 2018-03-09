#include "Context.h"


// Shaders
std::string vertex_source = R"V0G0N(
    attribute vec4 position;
    attribute vec2 texCoord;
    varying vec2 v_texCoord;

    void main() {
       gl_Position = position;
       v_texCoord = texCoord;
    }
)V0G0N";


std::string imgMeltFragment = R"V0G0N(
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D texture;

    uniform float width;
    uniform float height;


    float shiftProbability = 1.0 / 8.0;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    float jiggle (float value, float w) {
        float r = rand(v_texCoord);
        if (r < shiftProbability && value > 0.0)        return value - w;
        if (r > 1.0 - shiftProbability && value < 1.0)  return value + w;
        return value;
    }

    void main() {

        // Normalized pixel size
        float w = 1.0 / width;
        float h = 1.0 / height;

        vec4 pixel = texture2D( texture, vec2( v_texCoord.x, 1.0 - v_texCoord.y));
        vec4 above = texture2D( texture, vec2( jiggle(v_texCoord.x, w), (1.0 - v_texCoord.y) + h ));
        vec4 below1 = texture2D( texture, vec2( v_texCoord.x, (1.0 - v_texCoord.y) - h ));


        if (pixel.a == 0.0) {
            gl_FragColor = above;
        } else {
            if (below1.a == 0.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            } else {
                gl_FragColor = pixel;
            }
        }
    }
)V0G0N";

std::string imgMeltFragmentWithBlend = R"V0G0N(
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D texture;

    uniform float width;
    uniform float height;

    float shiftProbability = 1.0 / 8.0;
    float transferred;
    float original;
    float finalAlpha;

    float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    float jiggle (float value, float w) {
        float r = rand(v_texCoord);
        if (r < shiftProbability && value > 0.0)        return value - w;
        if (r > 1.0 - shiftProbability && value < 1.0)  return value + w;
        return value;
    }

    // float round (float num) {
    //     return sign(num) * float(int(abs(num)+0.5));
    // }

    // weightedAverage
    float wa (float a, float b) {
        return (a * transferred + b * original) / finalAlpha;
        // return round((a * transferred + b * original) / finalAlpha);
        // return floor((a * transferred + b * original) / finalAlpha + 0.5);
    }

    void main() {

        // Normalized pixel size
        float w = 1.0 / width;
        float h = 1.0 / height;

        vec4 pixel = texture2D( texture, vec2( v_texCoord.x, 1.0 - v_texCoord.y));
        vec4 above = texture2D( texture, vec2( jiggle(v_texCoord.x, w), (1.0 - v_texCoord.y) + h ));
        vec4 below1 = texture2D( texture, vec2( v_texCoord.x, (1.0 - v_texCoord.y) - h ));


        if (pixel.a == 0.0) {
            gl_FragColor = above;

            // mergePixels
            finalAlpha = min(pixel.a + below1.a, 1.0);
            transferred = finalAlpha - below1.a;
            original = below1.a;
            gl_FragColor.a -= transferred;

        } else {
            if (below1.a == 0.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            } else {
                gl_FragColor = pixel;

                // mergePixels

                // For this pixel
                if (pixel.a == 0.0 || below1.a == 1.0) {
                } else {
                    finalAlpha = min(pixel.a + below1.a, 1.0);
                    transferred = finalAlpha - below1.a;
                    original = below1.a;
                    gl_FragColor.a -= transferred;
                }

                // For the pixel below
                if (above.a == 0.0 || pixel.a == 1.0) {
                    gl_FragColor = pixel;
                } else {
                    finalAlpha = min(pixel.a + below1.a, 1.0);
                    transferred = finalAlpha - below1.a;
                    original = below1.a;
                    gl_FragColor = vec4(wa(pixel.r, below1.r), wa(pixel.g, below1.g), wa(pixel.b, below1.b), finalAlpha);
                }
            }
        }
    }
)V0G0N";


// Vertex data of texture bounds
GLfloat vVertices[] = { -1.0,  1.0, 0.0, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0,
                         1.0, -1.0, 0.0, 1.0,  1.0, 1.0, 1.0, 0.0, 1.0,  0.0};
GLushort indices[] = { 0, 1, 2, 0, 2, 3 };

GLuint CompileShader (GLenum type, std::string *source) {

    // Create shader object
    const GLchar* sourceString[1];
    GLint sourceStringLengths[1];

    sourceString[0] = source->c_str();
    sourceStringLengths[0] = source->length();
    GLuint shader = glCreateShader(type);

    if (shader == 0) {
        return 0;
    }

    // Assign and compile the source to the shader object
    glShaderSource(shader, 1, sourceString, sourceStringLengths);
    glCompileShader(shader);

    // Check if there were errors
    int infoLen = 0;
    glGetShaderiv( shader, GL_INFO_LOG_LENGTH, &infoLen );

    if (infoLen > 1) {

        char infoLog[infoLen];

        // And print them out
        glGetShaderInfoLog( shader, infoLen, NULL, infoLog );
        printf("%s\n", infoLog);

        free ( infoLog );
    }

    return shader;
}


Context::Context (int w, int h, char * id, int blend) {

    width = w;
    height = h;

    // Context configurations
    EmscriptenWebGLContextAttributes attrs;
    attrs.explicitSwapControl = 0;
    attrs.depth = 1;
    attrs.stencil = 1;
    attrs.antialias = 1;
    attrs.majorVersion = 2;
    attrs.minorVersion = 0;

    context = emscripten_webgl_create_context(id, &attrs);
    emscripten_webgl_make_context_current(context);

    // Compile shaders
    if (blend) {
        fragmentShader = CompileShader(GL_FRAGMENT_SHADER, &imgMeltFragmentWithBlend);
    } else {
        fragmentShader = CompileShader(GL_FRAGMENT_SHADER, &imgMeltFragment);
    }
    vertexShader = CompileShader(GL_VERTEX_SHADER, &vertex_source);

    // Build program
    programObject = glCreateProgram();

    glAttachShader(programObject, vertexShader);
    glAttachShader(programObject, fragmentShader);

    glBindAttribLocation(programObject, 0, "position");

    glLinkProgram(programObject);
    glValidateProgram(programObject);

    // Make the context current and use the program
    emscripten_webgl_make_context_current(context);
    glUseProgram( programObject );

    glGenBuffers(1, &vertexObject);
    glBindBuffer(GL_ARRAY_BUFFER, vertexObject);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vVertices), vVertices, GL_STATIC_DRAW);

    glGenBuffers(1, &indexObject);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexObject);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

}

Context::~Context (void) {
    emscripten_webgl_destroy_context(context);
}

void Context::run (uint8_t* buffer) {

    // Make the context current and use the program
    emscripten_webgl_make_context_current(context);
    glUseProgram( programObject );


    // Get the attribute/sampler locations
    GLint positionLoc = glGetAttribLocation(programObject, "position");
    GLint texCoordLoc = glGetAttribLocation(programObject, "texCoord");

    // Bind it
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, texId);

    // Define the texture
    glGenTextures(1, &texId);
    glBindTexture(GL_TEXTURE_2D, texId);

    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

    // Load the texture from the image buffer
    glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);

    // Add uniforms
    // For "ERROR :GL_INVALID_OPERATION : glUniform1i: wrong uniform function for type"
    // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glUniform.xhtml
    GLint textureLoc = glGetUniformLocation(programObject, "texture");
    glUniform1i(textureLoc, 0);

    float widthUniform = glGetUniformLocation(programObject, "width");
    glUniform1f(widthUniform, (float) width);

    float heightUniform = glGetUniformLocation(programObject, "height");
    glUniform1f(heightUniform, (float) height);


    // Set the viewport
    glViewport(0, 0, width, height);
    glClear(GL_COLOR_BUFFER_BIT);

    // Load and enable the vertex position and texture coordinates
    glVertexAttribPointer(positionLoc, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(GLfloat), 0);
    glVertexAttribPointer(texCoordLoc, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(GLfloat), (GLvoid*) (3 * sizeof(GLfloat)));

    glEnableVertexAttribArray(positionLoc);
    glEnableVertexAttribArray(texCoordLoc);

    // Draw
    glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, 0);

    imgData = (uint8_t*) malloc(width * height * 4 * sizeof(uint8_t));
    glReadPixels(0, 0, width, height, GL_RGBA, GL_UNSIGNED_BYTE, imgData);
}


void Context::step (void) {

    // Make the context current and use the program
    emscripten_webgl_make_context_current(context);
    glUseProgram( programObject );

    // Update the texture
    glBindTexture(GL_TEXTURE_2D, texId);
    glTexImage2D( GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, imgData);

    // Draw
    glClear(GL_COLOR_BUFFER_BIT);
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, 0);

    glReadPixels(0, 0, width, height, GL_RGBA, GL_UNSIGNED_BYTE, imgData);
}