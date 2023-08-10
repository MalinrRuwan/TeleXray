import {bot} from './bot/bot.js'
import 'dotenv/config'
import * as fs from 'node:fs';

let errorLogFile = process.env.ERR_LOG
while (true) {
    try {
        await bot.launch();
    }
    catch(e) { 
        console.log(e)
        fs.writeFileSync(errorLogFile, e)
    }
}

