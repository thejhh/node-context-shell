
/* The Library */

var shell = require('./simple-shell.js'),
    foreach = require('snippets').foreach,
    sys = require('sys');

/* The Example */

var context = {
	'users': [
		{'name':'foo'},
		{'name':'bar'}],
	'echo': function(a, b, c) {
		console.log(a + ", " + b + ", " + c);
	}
};

var prompt = shell.start(context);

prompt.on('error', function(msg) {
	console.error(msg);
});

prompt.on('debug', function(msg) {
	process.stderr.write(msg + "\n");
});

/* EOF */
