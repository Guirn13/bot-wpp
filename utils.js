function initDB(db) {
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

function filtrarGastosSemanal(gastos) {
    const agora = new Date();
    const inicioSemana = new Date(agora);

    inicioSemana.setHours(0, 0, 0, 0);

    const diaDaSemana = inicioSemana.getDay();
    inicioSemana.setDate(inicioSemana.getDate() - diaDaSemana);

    const fimSemana = new Date(inicioSemana);

    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    return gastos.filter(gasto => {
        const data = new Date(gasto.data);
        return data >= inicioSemana && data <= fimSemana;
    });
}


module.exports = {
    initDB,
    filtrarGastosDoMes,
    filtrarGastosSemanal
};
