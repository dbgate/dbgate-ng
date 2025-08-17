import { ServerConnectionProcess } from "./ServerConnectionProcess";
import { createWorker } from "./ProcessWorker";

// Create and start the worker for ServerConnectionProcess
createWorker(ServerConnectionProcess);
