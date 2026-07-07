require('dotenv').config();
const { Telegraf } = require('telegraf');
const { responderCliente } = require('./agent'); 

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Olá! Eu sou o seu assistente virtual integrado ao Gemini. Como posso te ajudar hoje?');
});

bot.on('text', async (ctx) => {
    const textoDoCliente = ctx.message.text;
    const nomeCliente = ctx.from.first_name || 'Cliente';

    console.log(`[Telegram] Mensagem de ${nomeCliente}: ${textoDoCliente}`);

    await ctx.sendChatAction('typing');

    const respostaIA = await responderCliente(textoDoCliente);

    await ctx.reply(respostaIA);
    console.log(`[Telegram] Resposta enviada para ${nomeCliente}`);
});

bot.launch().then(() => {
    console.log('🤖 Bot do Telegram rodando e pronto para receber mensagens!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));