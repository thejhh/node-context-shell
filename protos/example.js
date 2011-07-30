
/* The Library */

var shell = require('./simple-shell.js'),
	merge = require('snippets').merge,
    foreach = require('snippets').foreach,
    sys = require('sys');

/* The Example */

function exit() {
	console.log('Bye!');
	process.exit();
}

function ls() {
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
		foreach(commands).do(function(value, key) {
			console.log("  "+key+ " = " + sys.inspect(value));
		});
	}
}

function set_prop(key, value) {
	var prompt = this,
	    context = prompt.context;
	if(!context.hasOwnProperty(key)) prompt.emit('error', 'No such keyword: ' + key);
	else context[key] = value;
}

function cd(key) {
	var prompt = this,
	    context = prompt.context;
	
	if(key === '..') {
		if(prompt.context_stack.length <= 1) {
			prompt.emit('error', 'Cannot change to parent context: Already at the root context.');
			return;
		}
		var context = prompt.context_stack.pop();
		prompt.context = context;
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
	var new_context = context[key];
	prompt.context_stack.push(new_context);
	prompt.context = new_context;
}

var buildin_context = {
	'ls': ls,
	'cd': cd,
	'exit': exit,
	'quit': exit,
	'set':set_prop
}

var context = {
	'users': [
		{'name':'foo'},
		{'name':'bar'}
	],
	'echo': function(a, b, c) {
		console.log(a + ", " + b + ", " + c);
	}
};

var prompt = shell.start(context, buildin_context);

prompt.on('error', function(msg) {
	console.error(msg);
});

prompt.on('debug', function(msg) {
	process.stderr.write(msg + "\n");
});

/* EOF */
