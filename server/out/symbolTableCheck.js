"use strict";
//anywhere I push and pop in the first, i push and pop here
// difference is that I have to check not at the declaration, but the use. 
//there is a use in the names of the actions in the symbol table, but i've never defined these actions in the code pass, but there's undefined variable
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
exports.antlrP4HeaderDec = new Map();
exports.antlrP4StructHeaders = new Map();
const P4Listener_1 = require("./antlr_autogenerated/P4Listener");
function undefVarAlert(value) {
    utils_1.logloglog("Error: undefined variable \"" + value + "\"");
}
var MyP4Listner = function (table) {
    P4Listener_1.P4Listener.call(this); // inherit default listener
    P4Listener_1.P4Listener.symTableStack = table;
    return this;
};
// continue inheriting default listener
MyP4Listner.prototype = Object.create(P4Listener_1.P4Listener.prototype);
MyP4Listner.prototype.constructor = MyP4Listner;
MyP4Listner.prototype.enterActionRef = function (ctx) {
    if (this.symTableStack.getItsHeight(ctx.getText()) == undefined) {
        undefVarAlert(ctx.getText());
        utils_1.logloglog("has it been declared?");
    }
};
exports.SymbolTableCheck = MyP4Listner;
//# sourceMappingURL=symbolTableCheck.js.map