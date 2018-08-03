const { exec } = require('child_process');
const noop = () => {};

class ShellSession {
	constructor () {
		/**
		 *
		 * @type {ChildProcess |null}
		 * @private
		 */
		this._shell     = null;
		this._callError = noop;
		this._callOut   = noop;
		this._callEnd   = noop;

		return this;
	}

	/**
	 * Run shell session with shell command.
	 *
	 * @param {string} cmd
	 *
	 * @return {ShellSession}
	 */
	up(cmd) {
		this._shell =  exec(cmd);

		this._shell.stdout.on('data', this._callOut);
		this._shell.stdout.on('end',  this._callEnd);
		this._shell.stderr.on('data', this._callError);

		return this;
	}

	/**
	 * Execute new command in shell.
	 *
	 * @param {string} cmd
	 */
	exec (cmd) {
		this._shell.stdin.write(`${cmd}\n`);
	}

	_setListen (to, handler) {
		this['_' + to] = typeof handler === 'function' ? handler : noop;

		return this;
	}

	/**
	 * Call when shell end work.
	 *
	 * @param {function} handler
	 *
	 * @return {ShellSession}
	 */
	listenEnd (handler) {
		return this._setListen('callEnd', handler);
	}

	/**
	 * Listen shell out
	 *
	 * @param {function} handler
	 *
	 * @return {ShellSession}
	 */
	listenOut (handler) {
		return this._setListen('callOut', handler);
	}

	/**
	 * Listen error in shell.
	 *
	 * @param {function} handler
	 *
	 * @return {ShellSession}
	 */
	listenError (handler) {
		return this._setListen('callError', handler);
	}

	/**
	 * Stop shell session
	 */
	down () {
		if(this._shell) this._shell.kill();
	}

	execWithOut (cmd) {
		return new Promise((ok,bad)=> {
			this._shell.stdout.once('data', data => ok(`${cmd}\n${data}`));
			this._shell.stderr.once('data', bad);
			this.exec(cmd)
		});
	}
	static instance ({cmd, callErr, callOut, callEnd}) {
		return (new ShellSession())
			.listenEnd(callEnd)
			.listenError(callErr)
			.listenOut(callOut)
			.up(cmd);
	}
 }

 module.exports = ShellSession;
