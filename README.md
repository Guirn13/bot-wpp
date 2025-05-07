
# Bot Controle de Gastos WPP

Um bot para WhatsApp desenvolvido em JavaScript utilizando a biblioteca `whatsapp-web.js`. Este bot permite automatizar interações com o WhatsApp Web, facilitando o envio de mensagens e outras funcionalidades.

## 🧠 O que o bot faz

Este bot atua como um assistente pessoal de **registro e controle de gastos** diretamente pelo WhatsApp. Comandos disponíveis:

- `gasto: categoria valor` — Registra um novo gasto. Exemplo: `gasto: mercado 120.50`
- `!dia` — Mostra o resumo dos gastos de hoje
- `!semana` — Mostra o resumo dos gastos da semana
- `!mes` — Mostra o resumo dos gastos do mês
- `!ajuda` — Exibe os comandos disponíveis

## 🚀 Tecnologias

- JavaScript
- [whatsapp-web.js](https://github.com/mukulhase/WebWhatsapp-Wrapper)
- Node.js

## 📦 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Guirn13/bot-wpp.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd bot-wpp
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

## 🔧 Como Usar

1. Inicie o bot:

   ```bash
   node start
   ```

2. O bot irá exibir um QrCode no terminal. Escaneie o QR code com o seu aplicativo do WhatsApp para autenticar.

3. Após a autenticação, o bot estará pronto para automatizar as interações com o WhatsApp.

## 📄 Documentação

Para mais informações sobre a biblioteca `whatsapp-web.js`, consulte a [documentação oficial](https://docs.wwebjs.dev/).
