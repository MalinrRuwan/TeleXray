import { Telegraf, session, Markup, Scenes } from "telegraf";
import "dotenv/config";
import { config } from "dotenv";
import * as app from "../app/app.js";
config({ path: "../.env" });
export const bot = new Telegraf(process.env.BOT_TOKEN);
let t; //timer variable

//menu scene
const menuScene = new Scenes.BaseScene("MENU_SCENE");

//define scenarios
const protocolSelectionScenario = new Scenes.BaseScene("PROTOCOL_SELECTION_SCENE") 
const flowSelectionScenario = new Scenes.BaseScene("FLOW_SELECTION_SCENE"); // create a scenario
const emailReadingScene = new Scenes.BaseScene("EMAIL_READING_SCENE"); // email reading scenario
const executeScene = new Scenes.BaseScene("EXECUTE_SCENE"); // execute scenario
const emailDelReadingScene = new Scenes.BaseScene("EMAIL_DEL_READING_SCENE"); // reading an email when deleting an email
const delExecuteScene = new Scenes.BaseScene("DEL_EXECUTE_SCENE"); //deleting executing scene
const viewAllUserScene = new Scenes.BaseScene("VIEW_ALL_USER_SCENE"); //view all user

//define keyboards
const protocolKeyboard  = Markup.keyboard([
  Markup.button.text("VLESS"),
  Markup.button.text("VLESS-WS"),
  Markup.button.text("Trojan"),
  Markup.button.text("VMESS"),
  Markup.button.text("Back"),
])
  .resize();
const tlsKeyboard = Markup.keyboard([
  Markup.button.text("TLS"),
  Markup.button.text("XTLS-VISION"),
  Markup.button.text("Back"),
])
  .oneTime()
  .resize();
const replyMainKeyboard = Markup.keyboard([
  Markup.button.text("Add User"),
  Markup.button.text("Delete User"),
  Markup.button.text("View All Users"),
])
  .oneTime()
  .resize();

//menu scenario
menuScene.enter((ctx) => {
  ctx.session.data = {};
  ctx.reply("Choose an Option", replyMainKeyboard);
});

menuScene.hears("Add User", (ctx) => {
  ctx.scene.enter("PROTOCOL_SELECTION_SCENE");
});
menuScene.hears("Delete User", (ctx) => {
  ctx.scene.enter("EMAIL_DEL_READING_SCENE");
});
menuScene.hears("View All Users", (ctx) => {
  ctx.scene.enter("VIEW_ALL_USER_SCENE");
});

//add user scenario
emailReadingScene.enter((ctx) => {
  ctx.reply("Enter your email");
  t = setTimeout(() => {
    ctx.reply("Time out");
    ctx.scene.enter("MENU_SCENE");
  }, 30000);
});
emailReadingScene.on("text", (ctx) => {
  ctx.session.data.email = ctx.update.message.text;
  clearTimeout(t);
  ctx.scene.enter("EXECUTE_SCENE");
});

executeScene.enter(async (ctx) => {
  let res = await app
    .addUser(ctx.session.data.email, ctx.session.data.protocol, ctx.session.data.flow)
    .catch((e) => {
      ctx.replyWithHTML(`<b>Error</b> \n\n ${e}`);
    });
    console.log(res)
    console.log(ctx.session.data.email, ctx.session.data.protocol, ctx.session.data.flow)
  if (typeof res == "object" && "email" in res && "uuid" in res) {
    await ctx.replyWithHTML(
      `<b>Email :</b> <code> ${res.email} </code>\n\n<b>UUID :</b> <code>${res.uuid}</code>\n\n<b>Protocol : ${res.protocol}</b>\n\n<b>Flow : ${res.flow}</b>`,
      replyMainKeyboard
    );
  }
  ctx.scene.enter("MENU_SCENE");
});
//protocol selection scenario
protocolSelectionScenario.enter((ctx)=> { 
  ctx.reply("Choose the Protocol", protocolKeyboard);
})
protocolSelectionScenario.hears("VLESS", (ctx)=> { 
  ctx.session.data.protocol = 'vless'
  ctx.scene.enter("FLOW_SELECTION_SCENE")
})
protocolSelectionScenario.hears("Trojan", (ctx)=>  { 
  ctx.session.data.protocol = "trojan";
  ctx.session.data.flow = null;
  ctx.scene.enter("EMAIL_READING_SCENE")
})
protocolSelectionScenario.hears("VLESS-WS", (ctx)=>  { 
  ctx.session.data.protocol = "vless-ws";
  ctx.session.data.flow = null;
  ctx.scene.enter("EMAIL_READING_SCENE")
})
protocolSelectionScenario.hears("VMESS", (ctx)=>  { 
  ctx.session.data.protocol = "vmess";
  ctx.session.data.flow = null;
  ctx.scene.enter("EMAIL_READING_SCENE")
})
protocolSelectionScenario.hears("Back", (ctx)=> { 
  ctx.scene.enter("MENU_SCENE")
})


//flow selection scenario

flowSelectionScenario.enter((ctx) => {
  ctx.reply("Choose the flow", tlsKeyboard);
});
flowSelectionScenario.hears("TLS", (ctx) => {
  ctx.session.data.flow = "tls";
  ctx.scene.enter("EMAIL_READING_SCENE");
});
flowSelectionScenario.hears("XTLS-VISION", (ctx) => {
  ctx.session.data.flow = "xtls-rprx-vision";
  ctx.scene.enter("EMAIL_READING_SCENE");
});
flowSelectionScenario.hears("Back", (ctx) => {
  ctx.scene.enter("MENU_SCENE");
});

//delete account scenario

delExecuteScene.enter(async (ctx) => {
  let res;
  try {
    res = await app.delUser(ctx.session.data.email);
    await ctx.reply(res);
  } catch (e) {
    await ctx.replyWithHTML(`<b>Error</b> \n\n ${e}`);
  }
  ctx.scene.enter("MENU_SCENE");
});
emailDelReadingScene.enter((ctx) => {
  ctx.reply("Enter an email");
  t = setTimeout(() => {
    ctx.reply("Time out");
    ctx.scene.enter("MENU_SCENE");
  }, 30000);
});
emailDelReadingScene.on("text", (ctx) => {
  ctx.session.data.email = ctx.update.message.text;
  clearTimeout(t);
  ctx.scene.enter("DEL_EXECUTE_SCENE");
});
//view all user scenario
viewAllUserScene.enter(async (ctx) => {
  let res = await app.viewAllUsers();
  let viewObjectToString = " ";
  if (typeof res == "string") {
    await ctx.reply(res);
  } else {
    for (let index of res) { 
      viewObjectToString+= `<b>Email</b> : ${index['email']} \n<b>UUID</b> : <code>${index['uuid']}</code> \n<b>Protocol</b> : ${index['protocol']} \n<b>Flow</b> : ${index['flow']} \n\n`
    }
    await ctx.replyWithHTML(viewObjectToString);
  }
  ctx.scene.enter("MENU_SCENE");
});
//=================================================//

const addUserStage = new Scenes.Stage([
  protocolSelectionScenario,
  flowSelectionScenario,
  emailReadingScene,
  executeScene,
  delExecuteScene,
  emailDelReadingScene,
  menuScene,
  viewAllUserScene,
]);
bot.use(session());
bot.use(addUserStage.middleware());
bot.hears("/menu", (ctx) => {
  ctx.scene.enter("MENU_SCENE");
});