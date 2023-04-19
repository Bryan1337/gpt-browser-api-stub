import { createFileIfNotExists } from "./fileHelper.js";
import { logInfo } from "./logHelper.js";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const loopMapPath = `${process.cwd()}${process.env.LOOP_PATH}`;

createFileIfNotExists(loopMapPath);

export const isLooping = (id) => {

	const loops = fs.readFileSync(loopMapPath);

	const loopMap = JSON.parse(loops);

	return loopMap.includes(id);
}

export const startLoop = (id) => {

	const loops = fs.readFileSync(loopMapPath);

	const loopMap = JSON.parse(loops);

	if (!loopMap.includes(id)) {

		loopMap.push(id);

		fs.writeFileSync(loopMapPath, JSON.stringify(loopMap, null, 2));

		return true;
	}

	return false;
}

export const stopLoop = (id) => {

	const loops = fs.readFileSync(loopMapPath);

	const loopMap = JSON.parse(loops);

	let newLoopMap = [...loopMap];

	if (loopMap.includes(id)) {

		const loopIndex = loopMap.findIndex(loop => loop === id);

		newLoopMap.splice(loopIndex, 1);

		fs.writeFileSync(loopMapPath, JSON.stringify(newLoopMap, null, 2));

		return true;
	}


	return false;
}