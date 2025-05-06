const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const { initDB, filtrarGastosDoMes, filtrarGastosSemanal } = require('./utils');

const adapter = new FileSync('db.json');
const db = low(adapter);

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

    if (body === '!mes') {
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

    if (body === '!semana') {
        const userData = db.get('usuarios').get(userId).value();

        if (!userData || !userData.gastos.length) {
            msg.reply('📭 Nenhum gasto registrado ainda.');
            return;
        }

        const gastosSemana = filtrarGastosSemanal(userData.gastos);

        if (gastosSemana.length === 0) {
            msg.reply('📭 Nenhum gasto nesta semana.');
            return;
        }

        const resumo = {};
        let total = 0;

        for (const gasto of gastosSemana) {
            resumo[gasto.categoria] = (resumo[gasto.categoria] || 0) + gasto.valor;
            total += gasto.valor;
        }

        let resposta = `📅 *Resumo dos gastos nesta semana*\n\n`;
        for (const [categoria, valor] of Object.entries(resumo)) {
            resposta += `- ${categoria}: R$${valor.toFixed(2)}\n`;
        }
        resposta += `\n💰 *Total:* R$${total.toFixed(2)}`;

        msg.reply(resposta);
    }

    if(body === '!dia') {
        const userData = db.get('usuarios').get(userId).value();

        if (!userData || !userData.gastos.length) {
            msg.reply('📭 Nenhum gasto registrado ainda.');
            return;
        }

        const hoje = new Date().toISOString().split('T')[0];
        const gastosHoje = userData.gastos.filter(gasto => gasto.data.startsWith(hoje));

        if (gastosHoje.length === 0) {
            msg.reply('📭 Nenhum gasto registrado hoje.');
            return;
        }

        let resposta = `📅 *Resumo dos gastos de hoje*\n\n`;
        for (const gasto of gastosHoje) {
            resposta += `- ${gasto.categoria}: R$${gasto.valor.toFixed(2)}\n`;
        }
        resposta += `\n💰 *Total:* R$${gastosHoje.reduce((acc, gasto) => acc + gasto.valor, 0).toFixed(2)}`;

        msg.reply(resposta);
    }

    if (body === '!ajuda') {
        const ajuda = `💡 *Comandos disponíveis:*\n\n` +
            `🔹 *gasto: categoria valor* - Registra um gasto.\n Exemplo: \`gasto: alimentação 50\`\n` +
            `🔹 *!dia* - Mostra o resumo dos gastos do dia 📅\n` +
            `🔹 *!semana* - Mostra o resumo dos gastos da semana 📅\n` +
            `🔹 *!mes* - Mostra o resumo dos gastos do mês 📅\n` +
            `🔹 *!ajuda* - Exibe esta mensagem de ajuda ⚙️\n\n` +
            `❓ Caso tenha alguma dúvida, não hesite em perguntar!`;
    
        msg.reply(ajuda);
    }    
});

initDB(db);
client.initialize();
