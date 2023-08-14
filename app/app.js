import 'dotenv/config';
import * as fs from 'node:fs';
import { v4 as uuidv4} from 'uuid'
import  {ChildProcess, execFile, execSync, spawn, exec}  from 'node:child_process';
import 'email-validator'
import { validate } from 'email-validator';
import {config} from 'dotenv'

config({path : '../.env'})

let xrayJson = JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH));
let bakJson = xrayJson;


//add users to the xray config

async function addUser (email, filePath=process.env.XRAY_JSON_PATH) {
    let newXrayConfig = xrayJson
    //check if the email is valid
    if(!validate(email)) return 'The email is not valid.'

    //check if the current email is already present
    if(email == findUser(email, xrayJson).email)
        return 'The email is already present. Enter another email';

    newXrayConfig["inbounds"][0]["settings"]["clients"].push({id : uuidv4(), flow : "xtls-rprx-vision", level : 2, email : email}) 
    try{ 
        await writeToFile(filePath, newXrayConfig);
        await serviceControl('restart');
        return Promise.resolve(findUser(email, xrayJson, undefined));
        
    }
    catch(e) { 
        return Promise.reject(e)
    }
    //logic to restart the xray (to be written)
    
}

//functiont to find user

 function findUser(email,fileVariable, newdatavariable) { 
    //find a user in the newvarible
    if (newdatavariable) {
        for (let i of newdatavariable["inbounds"][0]["settings"]["clients"])  {
            for (let j in i) { 
                if (j == 'email'){
                    if (i[j] == email) {return i}
                }
            }

            
        }
        return " user not found"
     }
    //find a user in the file
    if (fileVariable) {
        for (let i of fileVariable["inbounds"][0]["settings"]["clients"])  {
            for (let j in i) { 
                if (j == 'email'){
                    if (i[j] == email) {return i}
                }
            }

            
        }
        return " user not found"
     }
}

//function to delete users 

async function delUser(email, fileVariable=xrayJson, filePath=process.env.XRAY_JSON_PATH) { 
    if (fileVariable) { 
        let indexOfI = 0;
        for (let i of fileVariable["inbounds"][0]["settings"]["clients"])  {
            for (let j in i) { 
                if (j == 'email') { 
                    if (i[j]==email) {
                        fileVariable["inbounds"][0]["settings"]["clients"].splice(indexOfI, 1);
                        try{ 
                             writeToFile(filePath, fileVariable );
                             await serviceControl('restart')
                        }
                        catch(err) { 
                            return Promise.reject(err)
                        }

                        //logic to restar xray(to be written)
                        // serviceControl('restart');
                        return Promise.resolve('"successfully deleted"')
                    }
                }
            }
            indexOfI++
        }
        return 'not found'
    }
    
}

//function to view all users
async function viewAllUsers(fileVariable=JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH))) { 
    if (fileVariable) { 
        let allUsers = {};
        for (let i of fileVariable["inbounds"][0]["settings"]["clients"])  {
            if (i['email']) { 
                // allUsers.push(i['email'])
                Object.defineProperty(allUsers, i['email'], {
                    value : i['id'],
                    enumerable : true, 
                    configuarable : true, 
                    writable : true
                })
            }
        }
        if (Object.keys(allUsers) == 0) return "No users found"
        return allUsers
    }
}

//a function to write to the file. 

async function writeToFile(filePath, variableToSave) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(variableToSave, null, 2))
        return Promise.resolve('completed');
    }
    catch(e){
        return Promise.reject(`Error in writeToFile() ${e}`)
    }
    
    
}

//function to control the service status of xray.service
async function serviceControl(command) { 
    if (command == 'restart') {
        // let cmd = spawn('sudo systemctl restart xray.service');
        exec('sudo systemctl restart xray.service', (error, stderr, stdout) => {
            if (error || stderr) console.log(error || stderr);
            console.log(stdout);
        })
        return 'Xray-core restarted'
    } else if (command == 'stop') { 
        exec('sudo systemctl stop xray.service', (error, stderr, stdout) => {
            if (error || stderr) console.log(error || stderr);
            console.log(stdout);
        })
        return 'Xray-core Stopped'
    }
    else if(command == 'start') { 
        exec('sudo systemctl start xray.service', (error, stderr, stdout) => {
            if (error || stderr) console.log(error || stderr);
            console.log(stdout);
        })
        return 'Xray-core Started'
    }
    
}
export {delUser, viewAllUsers, addUser, writeToFile, serviceControl, findUser,}

//console.log(await serviceControl('start'))
//console.log(addUser('sdsssssddfdf@jgsdfmail.com'))
//  console.log(delUser('g@gmail.com'))
// console.log(viewAllUsers())
//console.log(findUser('maliniqrub@gmail.com', JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH))))
