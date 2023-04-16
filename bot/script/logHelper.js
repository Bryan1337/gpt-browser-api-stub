import chalk from 'chalk';


export const logInfo = (...messages) => {

	log(chalk.blue('INFO'), ...messages);
}

export const logWarning = (...messages) => {

	log(chalk.yellow('WARNING'), ...messages);
}

export const logError = (...messages) => {

	log(chalk.red('ERROR'), ...messages);
}

const log = (logLevel, ...messages) => {

	const currentDate = new Date();

	console.log(`[${currentDate.toLocaleString()}]`, `[${logLevel}]`, ...messages);
}
