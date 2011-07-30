/* Simple context aware prompt */

var trim = require('snippets').trim;

function simple_shell(context, buildin_context, prefix) {
	var prefix = prefix || '> ',
	    prompt = require('./prompt.js').create(prefix);
	prompt.context_stack = [context];
	prompt.context = context;
	prompt.buildin_context = buildin_context;
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
