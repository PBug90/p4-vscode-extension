import { P4Listener } from "../antlr_autogenerated/P4Listener";
import { logDebug, logInfo, logError } from "../utils/logger";
import Stack from "../utils/stack";
import { P4IR, Attribute } from "./P4IR";
import { P4IRTypes } from "./P4IR";
import {
  TextDocumentPositionParams,
  CompletionItem,
  CompletionItemKind,
} from "vscode-languageserver";
import IntervalDS from "../utils/interval_ds";

export class SymbolTable {
  SYMBOL_STACK: Stack<P4IR>;
  SYMBOL_ARR: IntervalDS;

  constructor() {
    this.SYMBOL_STACK = new Stack();
    this.SYMBOL_ARR = new IntervalDS();
  }

  getAutoCompletion(
    keyword: string | null,
    pos: TextDocumentPositionParams
  ): CompletionItem[] {
    logDebug("keyword: " + keyword);
    const lineNumber: number = pos.position.line;
    const p4Ir: P4IR = this.SYMBOL_ARR.get(lineNumber);
    return p4Ir.getAutoCompletion(keyword);
  }

  add_attr(attr: Attribute): void {
    const topTable: P4IR = this.SYMBOL_STACK.peek();
    if (topTable) this.SYMBOL_STACK.peek().add(attr);
    else logError("Error: Symbole table is null!");
  }

  push(ctx, type: P4IRTypes, attr: Attribute | null): P4IR {
    const parent: P4IR = this.SYMBOL_STACK.peek();
    const newP: P4IR = new P4IR(type, parent, ctx);
    if (attr != null) {
      parent.add(attr);
      attr.setP4Ir(newP);
    }

    this.SYMBOL_STACK.push(newP);
    this.SYMBOL_ARR.add(newP);
    return newP;
  }

  pop(): P4IR {
    return this.SYMBOL_STACK.pop();
  }
}
