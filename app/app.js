import 'dotenv/config';
import * as fs from 'node:fs';
import { v4 as uuidv4} from 'uuid'
import  {ChildProcess, execFile, execSync, spawn}  from 'node:child_process';
import 'email-validator'
import { validate } from 'email-validator';
import {config} from 'dotenv'

config({path : '../.env'})

let xrayJson = JSON.parse(fs.readFileSync(process.env.XRAY_JSON_PATH));
let bakJson = xrayJson;

writeToFile(process.env.XRAY_JSON_BACKUP_PATH,bakJson)


//add users to the xray config

async function addUser (email, filePath=process.env.XRAY_JSON_PATH) {
    let newXrayConfig = xrayJson
    //check if the email is valid
    if(!validate(email)) return 'The email is not valid.'

    //check if the current email is already present
    if(email == findUser(email, xrayJson).email)
        return 'The email is already present. Enter another email';

    newXrayConfig["inbounds"][0]["settings"]["clients"].push({id : uuidv4(), flow : "xtls-rprx-vision", level : 2, email : email}) 
    // fs.writeFileSync('tempxray.json', JSON.stringify(newXrayConfig, null, 2))
    try{ 
        writeToFile(filePath, newXrayConfig );
        return findUser(email,undefined, newXrayConfig);
    }
    catch(err) { 
        return err
    }
    //logic to restart the xray (to be written)
    // serviceControl('restart');
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
                        }
                        catch(err) { 
                            return err
                        }

                        //logic to restar xray(to be written)
                        // serviceControl('restart');
                        return "successfully deleted"
                    }
                }
            }
            indexOfI++
        }
        return 'not found'
    }
    
}

//function to view all users
async function viewAllUsers(fileVariable=xrayJson) { 
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
    fs.writeFileSync(filePath, JSON.stringify(variableToSave, null, 2))
    return 'completed';
}

//function to control the service status of xray.service
async function serviceControl(command, backupFile = undefined) { 
    if (command == 'restart') {
        let cmd = spawn('sudo systemctl restart xray.service');
        return 'xray restarted'
    } else if (command == 'stop') { 
        let cmd = spawn('sudo systemctl stop xray.service');
        return 'xray stopped'
    }
    else if(command == 'start') { 
        let cmd = spawn('sudo systemctl start xray.service');
        return 'xray started'
    }
    
}


// console.log(addUser('kjldf@jgsdfmail.com'))
//  console.log(delUser('g@gmail.com'))
// console.log(viewAllUsers())



// module.exports.functions = {delUser : delUser(), viewAllUsers : viewAllUsers(), addUser : addUser(), writeToFile : writeToFile(), serviceControl : serviceControl(), findUser : findUser() }
export {delUser, viewAllUsers, addUser, writeToFile, serviceControl, findUser,}