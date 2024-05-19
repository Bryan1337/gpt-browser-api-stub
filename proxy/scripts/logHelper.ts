import chalk from 'chalk';

export enum LogLevel {
	INFO = 'INFO',
	WARNING = 'WARNING',
	ERROR = 'ERROR',
}

export const log = (...messages: String[]) => {
	logInfo(...messages);
}

export const logInfo = (...messages: String[]) => {
	logMessage(chalk.blue(LogLevel.INFO), ...messages);
}

export const logWarning = (...messages: String[]) => {
	logMessage(chalk.yellow(LogLevel.WARNING), ...messages);
}

export const logError = (...messages: String[]) => {
	logMessage(chalk.red(LogLevel.ERROR), ...messages);
}

const logMessage = (logLevel: string, ...messages: String[]) => {
	const currentDate = new Date();
	console.log(`[${currentDate.toLocaleString()}]`, `[${logLevel}]`, ...messages);
}
