import { loadAgentConfig } from "./config.js";
import { startFolderWatcher } from "./watcher.js";

const config = loadAgentConfig();
startFolderWatcher(config);

console.log(`GPBM Auto Sender agent watching ${config.incoming_folder}`);
