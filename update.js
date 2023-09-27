import {db} from './db/db.js'
import * as fs from 'node:fs';
import 'dotenv/config';
import {config} from 'dotenv'
//read all vless inbound clients from xray.config
config({path : '../.env'})
let file = JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH));
setTimeout(()=> {
    (function vless2db(){
        let clients = file["inbounds"][0]["settings"]["clients"]
        for (let i of clients) { 
            let email = i['email'], uuid = i['id'];
            let flow=null;
            if(i['flow']) { 
                flow = i['flow']
            }
            db.run(`INSERT INTO users VALUES ('${email}', '${uuid}', 'vless', '${flow}')`)
        }
    })();
    (function trojan2db(){
        let clients = file["inbounds"][1]["settings"]["clients"]
        for (let i of clients) { 
            let email = i['email'], uuid = i['id'];
            let flow=null;
            if(i['flow']) { 
                flow = i['flow']
            }
            db.run(`INSERT INTO users VALUES ('${email}', '${uuid}', 'trojan', '${flow}')`)
        }
    })();
    (function vless_ws2db(){
        let clients = file["inbounds"][2]["settings"]["clients"]
        for (let i of clients) { 
            let email = i['email'], uuid = i['id'];
            let flow=null;
            if(i['flow']) { 
                flow = i['flow']
            }
            db.run(`INSERT INTO users VALUES ('${email}', '${uuid}', 'vless-ws', '${flow}')`)
        }
    })();
    (function vmess2db(){
        let clients = file["inbounds"][3]["settings"]["clients"]
        for (let i of clients) { 
            let email = i['email'], uuid = i['id'];
            let flow=null;
            if(i['flow']) { 
                flow = i['flow']
            }
            db.run(`INSERT INTO users VALUES ('${email}', '${uuid}', 'vmess', '${flow}')`)
        }
    })();
    (async function() { 
        console.log(await db.all('SELECT * FROM users'))
    })()
}, 2000);



