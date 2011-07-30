
/* The Library */

var sys = require('sys'),
    tty = require('tty'),
    trim = require('snippets').trim,
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
		process.stderr.write('Unknown key pressed:\n' );
		process.stderr.write(' - line: "' + line + '"\n' );
		process.stderr.write(' - code: ' + sys.inspect(code) + "\n" );
		process.stderr.write(' - char: ' + sys.inspect(char) + "\n" );
		process.stderr.write(' - key: ' + sys.inspect(key) + "\n" );
		prompt.emit('draw');
		
	});
	
	prompt.emit('draw');
	return prompt;
}

/* Simple context aware prompt */

function simple_shell(context, prefix) {
	var prefix = prefix || '> ',
	    prompt = get_prompt(prefix);
	prompt.on('line', function(line) {
		var args = trim(line).split(/ +/),
		    cmd = args.shift();
		
		if(context[cmd] && (typeof context[cmd] === 'function')) {
			context[cmd].apply(context, args);
		}
		
		// Let's draw the prompt again once we are finished using the terminal
		prompt.emit('draw');
	});
}

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

simple_shell(context);

/* EOF */
