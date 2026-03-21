//
// test.js
// 
// Testing script for
// multiple Rue instances
//

import { RueFile } from "./src/compiler.js";

function main() {
    let tests = [
        "empty", 
        "normal", 
        "one-line",
        "syntax-error",
        "wrong-lang"
    ]
    let passed = 0

    for (let i = 0; i < tests.length; i++) {
        let test = tests[i]
        let rueInstance = new RueFile(`./test/${test}.rue`)
        rueInstance.output(`./test-output/${test}.css`)
        if (rueInstance.getCSS) passed++
    }

    console.log(passed, "out of", tests.length, "tests passed", Math.round(passed * 100 / tests.length), "%")
}

main()