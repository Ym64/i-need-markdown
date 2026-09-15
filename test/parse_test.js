import {parse} from "../src/index.js";

console.log(parse("### hello\n1. test\n2. test\n3. test\n\nrandom paragraph\nwith some text- test\n- nummer 1\n* nummer 2"))

console.log("[test1](test2)".match(/^\[(.*)]\((.*)\)/)[2])