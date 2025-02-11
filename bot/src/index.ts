import dotenv from "dotenv";
dotenv.config();
/** Handle dotenv configs before importing any other modules */

import whatsapp from "whatsapp-web.js";

import { getWhatsappClient } from "@/util/whatsappWeb";
import { readyHandler } from "@/event_handlers/readyHandler";
import { authenticatedHandler } from "@/event_handlers/authenticatedHandler";
import { qrHandler } from "@/event_handlers/qrHandler";
import { messageHandler } from "@/event_handlers/messageHandler";

const { Events } = whatsapp;

const client = getWhatsappClient();

client.on(Events.READY, readyHandler);
client.on(Events.AUTHENTICATED, authenticatedHandler);
client.on(Events.QR_RECEIVED, qrHandler);
client.on(Events.MESSAGE_RECEIVED, messageHandler);

client.initialize();
