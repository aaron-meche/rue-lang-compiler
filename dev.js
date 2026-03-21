//
// dev.js
//
// Rue Programming Language
// Development Test Script
//

import { RueFile } from "./src/compiler.js"

function main() {
    console.time("prog")
    // create instance
    let file = new RueFile('./dev.rue', true)
    console.timeLog("prog")
    // parse + compile
    file.run()
    console.timeLog("prog")
    // output
    file.output('./style.css')
    console.timeEnd("prog")
}

main()