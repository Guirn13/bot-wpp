const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

function initDB() {
    db.defaults({ usuarios: {} }).write();
}

function filtrarGastosDoMes(gastos) {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    return gastos.filter(gasto => {
        const data = new Date(gasto.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });
}

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.once('ready', () => {
    console.log('Bot ativo!');
});

client.on('message_create', async msg => {
    const body = msg.body.toLowerCase().trim();
    const userId = msg.from;
    const nome = msg._data.notifyName || msg._data.pushname || "Desconhecido";

    if (body.startsWith('gasto:')) {
        const texto = body.slice(6).trim();
        const [categoria, valorStr] = texto.split(' ');
        const valor = parseFloat(valorStr);

        if (!categoria || isNaN(valor)) {
            msg.reply('⚠️ Formato inválido. Use: gasto: categoria valor\nEx: gasto: mercado 120.50');
            return;
        }

        const gasto = {
            categoria,
            valor,
            data: new Date().toISOString()
        };

        const usuarios = db.get('usuarios');

        if (!usuarios.has(userId).value()) {
            usuarios.set(userId, { nome, gastos: [] }).write();
        }

        usuarios.get(userId).get('gastos').push(gasto).write();

        msg.reply(`✅ Gasto registrado: *${categoria}* - R$${valor.toFixed(2)}`);
        return;
    }

    if (body === '!resumo') {
        const userData = db.get('usuarios').get(userId).value();

        if (!userData || !userData.gastos.length) {
            msg.reply('📭 Nenhum gasto registrado ainda.');
            return;
        }

        const gastosMes = filtrarGastosDoMes(userData.gastos);

        if (gastosMes.length === 0) {
            msg.reply('📭 Nenhum gasto neste mês.');
            return;
        }

        const resumo = {};
        let total = 0;

        for (const gasto of gastosMes) {
            resumo[gasto.categoria] = (resumo[gasto.categoria] || 0) + gasto.valor;
            total += gasto.valor;
        }

        let resposta = `📅 *Resumo dos gastos deste mês*\n\n`;
        for (const [categoria, valor] of Object.entries(resumo)) {
            resposta += `- ${categoria}: R$${valor.toFixed(2)}\n`;
        }
        resposta += `\n💰 *Total:* R$${total.toFixed(2)}`;

        msg.reply(resposta);
    }
});

initDB();
client.initialize();
