////////////////////////////////////////////////////////////////////////////////
// Copyright © 2022 xx foundation                                             //
//                                                                            //
// Use of this source code is governed by a license that can be found in the  //
// LICENSE file.                                                              //
////////////////////////////////////////////////////////////////////////////////

// Encodes Uint8Array to a string.
let enc = new TextEncoder();

// Decodes a string to a Uint8Array.
let dec = new TextDecoder();

// goJsonToObj converts JSON returned by Go WebAssembly (of type Uint8Array) and
// converts it to a Javascript object.
function jsonToObj(goJson) {
    return JSON.parse(dec.decode(goJson))
}

// Function to download data to a text file.
function download(filename, data) {
    const file = new Blob([data], {type: 'text/plain'});
    let a = document.createElement("a"),
        url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// sleepUntil waits until the condition f is met or until the timeout is
// reached.
async function sleepUntil(f, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeWas = new Date();
        const wait = setInterval(function() {
            if (f()) {
                console.log("resolved after", new Date() - timeWas, "ms");
                clearInterval(wait);
                resolve();
            } else if (new Date() - timeWas > timeoutMs) { // Timeout
                console.log("rejected after", new Date() - timeWas, "ms");
                clearInterval(wait);
                reject();
            }
        }, 20);
    });
}

// newHtmlConsole returns an object that allows for printing log messages or
// error messages to an element.
function newHtmlConsole(elem) {
    return {
        overwrite: function (message) {
            console.log(message)
            elem.innerHTML = message
        },
        log: function (message) {
            console.log(message)
            elem.innerHTML += "<p>" + message + "</p>"
        },
        error: function (message) {
            console.error(message)
            elem.innerHTML += "<p class='error'>" + message + "</p>"
        },
        clear: function () {
            elem.innerHTML = ""
        }
    };
}