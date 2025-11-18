import express from "express";
import cors from "cors";

export const getServer = () => {
	const server = express();

	server.use(express.json());
	server.use(cors());
	server.use(({ res, next }) => {
		res?.header("Access-Control-Allow-Origin", "*");
		res?.header(
			"Access-Control-Allow-Methods",
			"GET, POST, OPTIONS, PUT, PATCH, DELETE"
		);
		res?.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		next?.();
	});

	return server;
};
