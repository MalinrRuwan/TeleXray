import 'dotenv/config';
import * as fs from 'node:fs';
import { v4 as uuidv4} from 'uuid'
import  {exec}  from 'node:child_process';
import 'email-validator'
import { validate } from 'email-validator';
import {config} from 'dotenv'
import {db} from '../db/db.js'

config({path : '../.env'})

 function openXrayConfig() {
    try { 
        let xrayJson = JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH));
        return xrayJson
    }
    catch(e) { 
        throw e
    } 
    
}
class user { 
    
}

//add users to the xray config

async function addUser (email, protocol, flow=null, filePath=process.env.XRAY_JSON_PATH) {
    let xrayJson = openXrayConfig()
    let newXrayConfig = xrayJson
    let res;
    //check if the email is valid
    try{
        if(!validate(email)){throw 'Invalid email'}
        await db.run(`INSERT INTO users VALUES ('${email}', '${uuidv4()}', '${protocol}', '${flow}')`)
        res = await db.get(`SELECT * FROM users WHERE email LIKE '${email}';`)
        // return Promise.resolve(res)
    }catch(e) {
        if(e.errno == 19) { 
            return Promise.resolve('User already exists')
        } 
        return Promise.reject(e)
    }
    if (res.protocol =='trojan'){
        newXrayConfig["inbounds"][1]["settings"]["clients"].push({passsword : res.uuid, level : 2, email : res.email})
    }
    else if (res.protocol == 'vless') { 
        if (flow == "tls") { 
            newXrayConfig["inbounds"][0]["settings"]["clients"].push({id : res.uuid, level : 2, email : res.email}) ;
        }
        else if (flow == "xtls-rprx-vision") { 
            newXrayConfig["inbounds"][0]["settings"]["clients"].push({id : res.uuid, level : 2, email : res.email, flow: "xtls-rprx-vision"}) ;
        }
        else {
            //implement a delete from database
            return Promise.reject("invalid flow method")
        }
    }
    else if (res.protocol == 'vless-ws'){
        newXrayConfig["inbounds"][2]["settings"]["clients"].push({passsword : res.uuid, level : 2, email : res.email})
    }
    else if (res.protocol == 'vmess') {
        newXrayConfig["inbounds"][3]["settings"]["clients"].push({passsword : res.uuid, level : 2, email : res.email})
    }
    else{ 
        return Promise.reject("Invalid protocol")
    }
    try {
    await writeToFile(filePath, newXrayConfig)
    await serviceControl('restart')
    return res
    }
    catch(e) { 
    return Promise.reject(e)
    }
}

//functiont to find user

 function findUser(email,fileVariable, newdatavariable) { 
    
}

//function to delete users 

 async function delUser(email, fileVariable=JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH))) { 
    //delete from the database
    let res1 = await db.get(`SELECT * FROM users WHERE email LIKE '${email}';`)
    let res2 = await db.run(`DELETE FROM users WHERE email='${email}'`)
    if(res2.changes == 0) { 
        return Promise.resolve("No user found")
    }
    else{ 
        //function delete from the file
        function fileDelete(inbound, email) { 
            if (fileVariable) { 
                let indexOfI = 0;
                for (let i of fileVariable["inbounds"][inbound]["settings"]["clients"])  {
                    for (let j in i) { 
                        if (j == 'email') { 
                            if (i[j]==email) {
                                fileVariable["inbounds"][inbound]["settings"]["clients"].splice(indexOfI, 1);
                                try{ 
                                     writeToFile(process.env.XRAY_JSON_PATH, fileVariable );
                                      serviceControl('restart')
                                     return Promise.resolve(`Successfully Deleted User - ${email}`);
                                }
                                catch(err) { 
                                    return Promise.reject(err)
                                }
                                
                            }
                        }
                    }
                    indexOfI++
                }
            }
        }
        if (res1.protocol =='trojan'){
            return await fileDelete(1,email)
        }
        else if (res1.protocol == 'vless') { 
         return await fileDelete(0, email)
        }
        else if (res1.protocol == 'vless-ws'){
            return await fileDelete(2, email)
        }
        else if (res1.protocol == 'vmess') {
            return await fileDelete(3, email)
        }
        
    }
    
}

//function to view all users
async function viewAllUsers() { 
    //returns an array of objects [{},{},{}]
    try{
        let res =await db.all(`select * from users`)
        return Promise.resolve(res)
    }
    catch(e) { 
        return Promise.reject(e)
    }
}

//a function to write to the file. 

function writeToFile(filePath, variableToSave) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(variableToSave, null, 2))
        return Promise.resolve('completed');
    }
    catch(e){
        return Promise.reject(`Error in writeToFile() ${e}`)
    }
    
}

//function to control the service status of xray.service
function serviceControl(command) { 
    if (command == 'restart') {
        // let cmd = spawn('sudo systemctl restart xray.service');
        exec('sudo systemctl restart xray.service', (error, stderr, stdout) => {

        })
        return Promise.resolve('Xray-core restarted')
    } else if (command == 'stop') { 
        exec('sudo systemctl stop xray.service', (error, stderr, stdout) => {
        })
        return Promise.resolve('Xray-core Stopped')
    }
    else if(command == 'start') { 
        exec('sudo systemctl start xray.service', (error, stderr, stdout) => {
            
        })
        return Promise.resolve('Xray-core Started')
    }
    
}
export {delUser, viewAllUsers, addUser, writeToFile, serviceControl, findUser,}

    //console.log(await addUser('trojan@gmail.com', 'trojan'))
// let res =await db.all(`select * from users`)
// console.log(res)
// console.log(await delUser('trojan@gmail.com'))
// console.log(await viewAllUsers())