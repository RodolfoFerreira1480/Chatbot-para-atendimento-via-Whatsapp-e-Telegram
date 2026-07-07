const express = require('express');
require('dotenv').config();
const { responderCliente, enviarRespostaWhatsapp, enviarRespostaTelegram } = require('./agent');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// ──── WhatsApp ────────────────────────────────────────────
app.get('/webhook', (req, res) => {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (!body.object) return res.sendStatus(404);

    const value = body.entry?.[0]?.changes?.[0]?.value;

    // Ignora notificações de status (sent, delivered, failed...)
    if (value?.statuses) {
        const s = value.statuses[0];
        if (s.status === 'failed') {
            console.error('[WhatsApp] ❌ Falha na entrega:', JSON.stringify(s.errors));
        }
        return res.status(200).send('EVENT_RECEIVED');
    }

    if (value?.messages) {
        const msg = value.messages[0];

        // Ignora áudio, imagem, etc.
        if (!msg.text) {
            console.log(`[WhatsApp] Tipo não suportado: ${msg.type}`);
            return res.status(200).send('EVENT_RECEIVED');
        }

        let telefone = msg.from;
        const texto = msg.text.body;

        // Ajuste do nono dígito
        if (telefone.length === 12) {
            telefone = telefone.slice(0, 4) + '9' + telefone.slice(4);
        }

        console.log(`[WhatsApp] 📩 De ${telefone}: ${texto}`);
        const resposta = await responderCliente(texto);
        await enviarRespostaWhatsapp(telefone, resposta);
    }

    return res.status(200).send('EVENT_RECEIVED');
});

// ──── Telegram ────────────────────────────────────────────
app.post('/telegram', async (req, res) => {
    const body = req.body;

    // Ignora se não for mensagem de texto
    if (!body.message?.text) {
        return res.sendStatus(200);
    }

    const chatId = body.message.chat.id;
    const texto = body.message.text;

    console.log(`[Telegram] 📩 De ${chatId}: ${texto}`);
    const resposta = await responderCliente(texto);
    await enviarRespostaTelegram(chatId, resposta);

    return res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});