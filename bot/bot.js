import { Telegraf, Markup, session } from "telegraf";
import {message} from "telegraf/filters";
import 'dotenv/config';
import * as app from "../app/app.js"
import {config} from 'dotenv'

config({path : '../.env'})

export const bot = new Telegraf(process.env.BOT_TOKEN)

const replyKeyboard = Markup.keyboard([ //create the keyboard layout
    Markup.button.text("Add User"),
    Markup.button.text("Delete User"),
    Markup.button.text("View All Users")
    ]).oneTime().resize();

bot.use(session())
bot.on(message('text'), async (ctx)=> { 
    ctx.session ??= { readingStatus : false};
    if (ctx.message.text == "/menu"){
    ctx.reply('Choose an option', replyKeyboard)
    }

    else if(ctx.update.message.text == "Add User" || ctx.session.addUser ){  //adduser section [checks the user input or the session status]
        if(ctx.session.readingStatus){
            ctx.session.readingStatus=false; // it will not pass into else section of every code section
            ctx.session.addUser=false; //so it will not pass to this section creating a loop
            let email = ctx.update.message.text
            let res = await app.addUser(email)
            // console.log(res)
            if(typeof res == 'string') 
            {
                ctx.reply(res);
            }
            if (typeof res == 'object' && 'email' in res && 'id' in res) 
            {
                ctx.replyWithHTML(`<code> ${res.email} </code>\n\n<code>${res.id}</code>`);
            }
            // console.log(email);
            
        }
        else { 
            ctx.session.addUser = true; //updates the session status
            ctx.session.readingStatus = true;
            await ctx.reply('Send a valid email')
        }
    }
    else if (ctx.update.message.text == "Delete User" || ctx.session.deleteUser){  //deleteuser section
        if(ctx.session.readingStatus){
            ctx.session.readingStatus=false;
            ctx.session.deleteUser=false;
            let email = ctx.update.message.text
            // console.log(email);
            let res = await app.delUser(email);
            ctx.reply(res)
            
        }
        else { 
            ctx.session.deleteUser = true;
            ctx.session.readingStatus = true;
            await ctx.reply('send email')
        }
    }
    else if(ctx.update.message.text == "View All Users"){ //viewallusersection
        let res = await app.viewAllUsers();
      let viewObjectToString = " ";
      if (typeof res == 'string') {
        ctx.reply(res)
      }
      else {
            for (let i in res)  { 
                viewObjectToString +="<code>" + i  + "</code>"+ " \n" + "<code>"+ res[i] + "</code>" + "\n\n"
            }
            ctx.replyWithHTML(viewObjectToString);
        }
    }
        
    
})

   //bot.launch();

//enable gracefull stop
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));
// process.once('SIGKILL', () => bot.stop('SIGKILL'));
