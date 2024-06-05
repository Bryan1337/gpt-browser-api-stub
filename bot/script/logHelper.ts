import chalk from "chalk";

enum LogLevel {
	Info = "INFO",
	Warning = "Warning",
	Error = "Error",
}

export const logInfo = (...messages: string[]) => {
	log(chalk.blue(LogLevel.Info), ...messages);
};

export const logWarning = (...messages: string[]) => {
	log(chalk.yellow(LogLevel.Warning), ...messages);
};

export const logError = (...messages: string[]) => {
	log(chalk.red(LogLevel.Error), ...messages);
};

const log = (logLevel: string, ...messages: string[]) => {
	const currentDate = new Date();

	console.log(
		`[${currentDate.toLocaleString()}]`,
		`[${logLevel}]`,
		...messages
	);
};
