"use strict"

const http = require("http")
const fs = require("fs")
const url = require("url")
const PORT = 1337

http.createServer((request, response) => {

    let path = url.parse(request.url).pathname
    let data

    path = decodeURIComponent(path=="/"?"/index.html":path)

    console.log(path)

    if (path=="/appWASM.wasm") {
        path = "/dist"+path
    }

    try {
        data = fs.readFileSync(__dirname+path)
    } catch (e){
        if (path != "/favicon.ico") {
            console.log(e)
        }
    }

    response.end(data)

}).listen(PORT, () => console.log(`Server Listening on port ${PORT}`))

