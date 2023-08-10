import { Telegraf, Format } from "telegraf";
import {message} from "telegraf/filters";
import 'dotenv/config';
import * as app from "../app/app.js"


export const bot = new Telegraf(process.env.BOT_TOKEN)

bot.command('quit', async (ctx) => {
    await ctx.telegram.leaveChat(ctx.message.chat.id);
});

bot.on(message('text'), async (ctx) => {
    if(ctx.message.text.substring(0,7) == 'adduser') {
      let strinarr = ctx.message.text.split(" ")
      let res = await app.addUser(strinarr[1])
      if(typeof res == 'string') return ctx.reply(res) 
      if ('email' in res && 'id' in res) ctx.replyWithHTML('<code>' + res.email +'</code>' + '\n\n' + '<code>' + res.id + '</code>')
      }
    else if (ctx.message.text.substring(0,7) == 'deluser'){
      let stringarr = ctx.message.text.split(" ");
      let res = await app.delUser(stringarr[1]);
      ctx.reply(res)
    }
    else if (ctx.message.text.substring(0,8) == 'viewuser'){
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
    // Using context shortcut
    // await ctx.reply(`Hello ${ctx.chat.first_name}`);
  });
  
  bot.on('callback_query', async (ctx) => {
    // Explicit usage
    await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
  
    // Using context shortcut
    await ctx.answerCbQuery();
  });
  
  bot.on('inline_query', async (ctx) => {
    const result = [];
    // Explicit usage
    await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);
  
    // Using context shortcut
    await ctx.answerInlineQuery(result);
  });

  
  // bot.launch();

  // Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));