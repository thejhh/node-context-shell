
/* The Library */

var shell = require('./simple-shell.js'),
    foreach = require('snippets').foreach,
    sys = require('sys');

/* The Example */

function exit() {
	console.log('Bye!');
	process.exit();
}

function help() {
	var commands = [], props = {}, isprops=false;
	foreach(this).do(function(value, key) {
		if(value && (typeof value === 'function')) {
			props[key] = value;
			isprops = true;
		} else {
			commands.push(key);
		}
	});
	
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

var context = {
	'help': help,
	'echo': function(a, b, c) {
		console.log(a + ", " + b + ", " + c);
	},
	'exit': exit,
	'quit': exit
};

var prompt = shell.start(context);

prompt.on('error', function(msg) {
	console.error(msg);
});

prompt.on('debug', function(msg) {
	process.stderr.write(msg + "\n");
});

/* EOF */
