/* Simple context aware prompt */

var trim = require('snippets').trim;

function simple_shell(context, prefix) {
	var prefix = prefix || '> ',
	    prompt = require('./prompt.js').create(prefix);
	prompt.on('line', function(line) {
		var args = trim(line).split(/ +/),
		    cmd = args.shift();
		
		if(context[cmd] && (typeof context[cmd] === 'function')) {
			context[cmd].apply(context, args);
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
