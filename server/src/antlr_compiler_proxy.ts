import {
	TextDocument,
	Diagnostic,
	DiagnosticSeverity,
	CompletionItemKind,
	Range,
} from 'vscode-languageserver';

import { logDebug, logDebugT, logInfo, logError} from './utils/logger';
import { CommonTokenStream, InputStream} from 'antlr4';
import { P4Lexer } from './antlr_autogenerated/P4Lexer';
import { P4Parser } from './antlr_autogenerated/P4Parser';
import { P4Listener } from './antlr_autogenerated/P4Listener';
import { ParseTreeWalker } from 'antlr4/tree';
import { p4ExtensionServer } from './server';
import { MyErrorListner } from './antlr_error_listner';
import { MyP4Listener } from './compiler/my_p4_listener';


export let MY_LISTENER: MyP4Listener = null;

export function sendToAntlrCompiler(textDocument: TextDocument){
	logDebugT("Compile request to ANTLR4 compiler.....");

	let errorListener: MyErrorListner = new MyErrorListner(textDocument);
	let tree = setupLexerAndParser(textDocument, errorListener);
	try{
		ParseTreeWalker.DEFAULT.walk(MY_LISTENER, tree);
	} catch(e){
		logError("Compile Error: " + e);
	}
	logDebugT("ANTLR compiler Finished!");

	let diagnostics: Diagnostic[] = errorListener.getDiagnostics();
	p4ExtensionServer.connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
	if(!errorListener.isEmpty()){
		logInfo("Syntax Errors are Found!");
	}
}

function setupLexerAndParser(textDocument: TextDocument, errorListener: MyErrorListner) {
	if(MY_LISTENER == null)
			MY_LISTENER = new MyP4Listener();
	let input: string = textDocument.getText();
	let chars = new InputStream(input);
	let lexer = new P4Lexer(chars);
	lexer.strictMode = false; // do not use js strictMode
	let tokens = new CommonTokenStream(lexer);
	let parser = new P4Parser(tokens);

	parser.removeErrorListeners(); // Remove default ConsoleErrorListener
	parser.addErrorListener(errorListener); // Add custom error listener

	parser.buildParseTrees = true;
	let tree = parser.program();
	return tree;
}

export function getName(ctx) {
	class NameListener  extends P4Listener{
		name: string|null;
		enterName(ctx){
			if(this.name == null)
				this.name = ctx.getText();
		}
		
		getName(){
			return this.name;
		}
	}
	let nameListener: NameListener = new NameListener();
	try{
		ParseTreeWalker.DEFAULT.walk(nameListener, ctx);
	} catch(e){
		logError("Compile Error: " + e);
	}
	return nameListener.getName();
}

