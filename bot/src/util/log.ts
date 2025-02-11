import chalk from "chalk";

enum LogLevel {
	Info = "INFO",
	Warning = "Warning",
	Error = "Error",
}

export const logInfo = (...messages: unknown[]) => {
	log(chalk.blue(LogLevel.Info), ...messages);
};

export const logWarning = (...messages: unknown[]) => {
	log(chalk.yellow(LogLevel.Warning), ...messages);
};

export const logError = (...messages: unknown[]) => {
	log(chalk.red(LogLevel.Error), ...messages);
};

const log = (logLevel: string, ...messages: unknown[]) => {
	const currentDate = new Date();

	console.log(
		`[${currentDate.toLocaleString()}]`,
		`[${logLevel}]`,
		...messages
	);
};
