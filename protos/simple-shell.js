/* Simple context aware prompt */

var foreach = require('snippets').foreach,
    sys = require('sys'),
    trim = require('snippets').trim;

function command_exit() {
	process.exit();
}

function command_ls() {
	var prompt = this;
	
	var commands = [], props = {}, isprops=false, contexts=[];
	foreach(prompt.context, prompt.buildin_context).do(function(value, key) {
		if(!key) return;
		if(value && (typeof value === 'function')) {
			commands.push(key);
		} else if(value && (typeof value === 'object')) {
			contexts.push(key);
		} else {
			props[key] = value;
			isprops = true;
		}
	});
	
	if(contexts.length !== 0) {
		console.log("List of contexts:");
		foreach(contexts).do(function(key) {
			console.log("  "+key);
		});
	}
	
	if(commands.length !== 0) {
		console.log("List of commands:");
		foreach(commands).do(function(key) {
			console.log("  "+key);
		});
	}
	
	if(isprops) {
		console.log("List of properties:");
		foreach(props).do(function(value, key) {
			console.log("  "+key+ " = " + sys.inspect(value));
		});
	}
}

function command_set(key, value) {
	var prompt = this,
	    context = prompt.context;
	if(!context.hasOwnProperty(key)) prompt.emit('error', 'No such keyword: ' + key);
	else context[key] = value;
}

function command_inspect(key) {
	var prompt = this,
	    context = prompt.context,
		what;
	if(!key) what = context;
	else if(key === '.') what = context;
	else what = context[key];
	console.log(sys.inspect(what));
}

function command_cd(key) {
	var prompt = this,
	    context = prompt.context,
	    new_context;
	
	if(key === '..') {
		if(prompt.context_stack.length <= 1) {
			prompt.emit('error', 'Cannot change to parent context: Already at the root context.');
			return;
		}
		prompt.context_stack.pop();
		prompt.context_keys.pop();
		prompt.context = prompt.context_stack[prompt.context_stack.length-1];
		prompt.emit('setPromptString', prompt.context_keys.join('/') + "> ");
		return;
	}
	
	if(!context.hasOwnProperty(key)) {
		prompt.emit('error', 'No such keyword: ' + key);
		return;
	}
	
	if(typeof context[key] != 'object') {
		prompt.emit('error', 'Illegal context: ' + key);
		return;
	}
	
	new_context = context[key];
	prompt.context_keys.push(key);
	prompt.context_stack.push(new_context);
	prompt.context = new_context;
	prompt.emit('setPromptString', prompt.context_keys.join('/') + "> ");
}

var default_buildin_context = {
	'ls': command_ls,
	'cd': command_cd,
	'exit': command_exit,
	'quit': command_exit,
	'set':command_set,
	'inspect':command_inspect
}

function simple_shell(context, buildin_context) {
	var prefix = '> ',
	    prompt = require('./prompt.js').create(prefix);
	prompt.context_keys = [''];
	prompt.context_stack = [context];
	prompt.context = context;
	prompt.buildin_context = buildin_context || default_buildin_context;
	prompt.on('line', function(line) {
		var args = trim(line).split(/ +/),
		    cmd = args.shift();
		
		if(prompt.buildin_context[cmd] && (typeof prompt.buildin_context[cmd] === 'function')) {
			prompt.buildin_context[cmd].apply(prompt, args);
		} else if(prompt.context[cmd] && (typeof prompt.context[cmd] === 'function')) {
			prompt.context[cmd].apply(prompt, args);
		} else {
			prompt.emit('error', 'Unknown command: ' + cmd);
		}
		
		// Let's draw the prompt again once we are finished using the terminal
		prompt.emit('draw');
	});
	return prompt;
}

/* The Example */

exports.start = simple_shell;

/* EOF */
