
/* The Library */

var shell = require('./simple-shell.js');

/* The Example */

function exit() {
	console.log('Bye!');
	process.exit();
}

var context = {
	'echo': function(a, b, c) {
		console.log(a + ", " + b + ", " + c);
	},
	'help': function() {
		console.log('User wrote help');
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
