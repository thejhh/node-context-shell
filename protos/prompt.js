
/* The Library */

var sys = require('sys'),
    tty = require('tty'),
    EventEmitter = require('events').EventEmitter;

/* Simple line-based prompt */

function get_prompt(prefix) {
	var line = '',
	    prefix = prefix || '> ',
	    prompt = new EventEmitter();
	
	prompt.on('draw', function() {
		process.stdout.write('\r' + prefix + line );
	});
	
	prompt.on('undraw', function() {
		process.stdout.write('\r');
	});
	
	tty.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('keypress', function (char, key) {
		var undefined,
		    code = char ? char.charCodeAt(0) : undefined,
		    tmp_line;
		
		// ctrl-c
		if (key && key.ctrl && key.name == 'c') process.exit();
		
		// backspace
		if (key && key.name == 'backspace') {
			if(!line) return; 
			line = line.substr(0, line.length-1);
			process.stdout.write('\r' + prefix + line + " " );
			prompt.emit('draw');
			return;
		}
		
		// enter
		if (key && key.name == 'enter') {
			prompt.emit('draw');
			process.stdout.write('\n');
			tmp_line = line;
			line = '';
			prompt.emit('line', tmp_line);
			return;
		}
		
		// 
		if(char && (code >= 32)) {
			line += char;
			prompt.emit('draw');
			return;
		}
		
		prompt.emit('undraw');
		prompt.emit('debug', 'Unknown key pressed:\n'+
			' - line: "' + line + '"\n'+
			' - code: ' + sys.inspect(code) + "\n"+
			' - char: ' + sys.inspect(char) + "\n"+
			' - key: ' + sys.inspect(key) );
		prompt.emit('draw');
		
	});
	
	prompt.emit('draw');
	return prompt;
}

/* Exports */

exports.create = get_prompt;

/* EOF */
