import {bot} from './bot/bot.js'
import 'dotenv/config'
import * as fs from 'node:fs';

let errorLogFile = process.env.ERR_LOG
let count = 0;
const date = new Date()
const slTime = date.toLocaleString("en-US", {timeZone: "Asia/Colombo"});
while (count < 10) { //terminate the app after 10 error trys
    try {
        await bot.launch();
    }
    catch(e) { 
        console.log(e)
        fs.appendFileSync(errorLogFile, String(e + " " + slTime))
        count++
    }
}

