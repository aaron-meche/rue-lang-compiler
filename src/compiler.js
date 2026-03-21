// 
// Rue Programming Language
// Compiler
//
// by Aaron Meche
//
import fs, { read } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __sysDir = path.dirname(__filename);

// Read File Text Content
function readFileText(filePath) { 
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        return ""
    }
}

// Write File Text Content
function writeFileText(filePath, fileContent) {
    fs.writeFileSync(filePath, fileContent)
}

export class RueFile {
    txt = null
    txtLine = null
    layers = []
    map = { ":root": [] }
    func = {}
    css = []

    inFunc = false
    funcName = null
    funcParams = []
    funcBody = []
    funcDepth = 0

    // Read from filepath, parse and compile
    constructor(filepath, doNotCompile = false) {
        if (!filepath) return
        this.feed(readFileText(filepath), doNotCompile)
    }

    // Force feed text instead of filepath
    feed(text, doNotCompile) {
        this.txt = text

        if (doNotCompile) return
        this.run()
    }

    // Parse and Compile stored text
    run() {
        this.#parse()
        this.#compile()
    }

    // Iterate and process all lines
    #parse() {
        let lineSplitText = this.txt?.split("\n")
        for (let i = 0; i < lineSplitText.length; i++) {
            this.#processLine(lineSplitText[i].trim())
        }
    }

    // Build CSS file from map
    #compile() {
        for (let i = 0; i < Object.keys(this.map).length; i++) {
            this.css.push(Object.keys(this.map)[i] + "{")
            this.css.push("\t" + Object.values(this.map)[i].join("\n\t"))
            this.css.push("}")
        }
    }

    // Call Function from saved func map
    #callFunction(name, args) {
        if (!this.func[name]) this.css.push("/* Error! Function " + name + " undefined */")
        const result = this.func[name](...args)
        return String(result)
    }

    // Resolve variable / function calls
    #resolveValue(val) {
        if (val.split(" ")[0] == "def") {
            val = val?.replace("def ", "--")
        }
        return val
    }

    // Interpret each line, building map
    #processLine(line) {
        let lastChar = line.split("")[line.length - 1]
        let firstWord = line.split(" ")[0]
        let mapID = () => { return this.layers.join(" ")?.replaceAll(" :", ":") }
        
        // Function Capture Mode
        if (this.inFunc) {
            // Nested function
            if (lastChar == "{") {
                this.funcDepth++
                this.funcBody.push(line)
            }
            // Close function
            else if (line == "}") {
                // If closing nested function
                if (this.funcDepth > 0) {
                    this.funcDepth--
                    this.funcBody.push(line)
                }
                // If closing main function
                else {
                    const body = this.funcBody.join("\n")
                    const params = this.funcParams
                    const name = this.funcName
                    try {
                        this.func[name] = new Function(...params, body)
                    }
                    catch (error) {
                        this.css.push("/* Error creating function: " + name + " */")
                        throw new Error(error)
                    }
                    this.inFunc = false
                    this.funcName = null
                    this.funcParams = []
                    this.funcBody = []
                    this.funcDepth = 0
                }
            }
            // Add new line to function
            else {
                this.funcBody.push(line)
            }
        }
        // Style Capture Mode
        else {
            if (firstWord == "//") return
            if (firstWord == "func") {
                this.inFunc = true
                this.funcName = line.replace("func ", "").split("(")[0]
                this.funcParams = [line.split("(")[1].split(")")[0]]
            } // New Layer
            else if (lastChar == "{") {
                this.layers.push(line.replace("{", ""))
                this.map[mapID()] = []
            } // Close Layer
            else if (line == "}") {
                this.layers.pop()
            } // Variable Definition
            else if (firstWord == "def") {
                this.map[":root"].push(this.#resolveValue(line))
            } // Key: Value
            else if (line.includes(":")) {
                this.map[mapID()].push(this.#resolveValue(line))
            }
        }
    }

    print() { console.log(this.css.join("\n")) }
    getCSS() { return this.css.join("\n") }
    output(path) { writeFileText(path, this.css.join("\n")) }
}