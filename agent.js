const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const META_ACESS_TOKEN = process.env.META_ACESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function responderCliente(mensagemDoCliente) {
    const modelos = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    const maxTentativas = 3;

    for (const modelo of modelos) {
        for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
            try {
                console.log(`[Gemini] Tentativa ${tentativa}/${maxTentativas} com modelo: ${modelo}`);
                const response = await ai.models.generateContent({
                    model: modelo,
                    contents: `Você é um assistente virtual educado e prestativo.
                               Responda de forma curta e objetiva.
                               Mensagem do cliente: "${mensagemDoCliente}"`,
                });
                console.log(`[Gemini] ✅ Resposta gerada com ${modelo}`);
                return response.text;
            } catch (error) {
                const eh503 = error?.status === 503 || error?.message?.includes('503');
                if (eh503 && tentativa < maxTentativas) {
                    const espera = Math.pow(2, tentativa) * 1000;
                    console.warn(`[Gemini] Sobrecarga. Aguardando ${espera / 1000}s...`);
                    await esperar(espera);
                    continue;
                }
                console.error(`[Gemini] Erro com ${modelo}:`, error?.message);
                break;
            }
        }
    }
    return 'Desculpe, estou com instabilidade técnica. Tente novamente em instantes.';
}

// ✅ Envia pelo WhatsApp (Meta API)
async function enviarRespostaWhatsapp(telefoneDestinatario, resposta) {
    try {
        const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
        await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: telefoneDestinatario,
            type: "text",
            text: { preview_url: false, body: resposta }
        }, {
            headers: {
                'Authorization': `Bearer ${META_ACESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`[WhatsApp] ✅ Mensagem enviada para ${telefoneDestinatario}`);
        return true;
    } catch (error) {
        console.error('[WhatsApp] ❌ Erro:', error.response?.data || error.message);
        return false;
    }
}

// ✅ Envia pelo Telegram (Bot API)
async function enviarRespostaTelegram(chatId, resposta) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: resposta
        });
        console.log(`[Telegram] ✅ Mensagem enviada para chat ${chatId}`);
        return true;
    } catch (error) {
        console.error('[Telegram] ❌ Erro:', error.response?.data || error.message);
        return false;
    }
}

module.exports = {
    responderCliente,
    enviarRespostaWhatsapp,
    enviarRespostaTelegram
};