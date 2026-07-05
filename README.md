Gemini Multi-Platform Bot (WhatsApp & Telegram)

Este é um assistente virtual inteligente e multi-plataforma integrado à API do Google Gemini (`gemini-2.5-flash`). O bot foi projetado para atuar no atendimento automatizado ao cliente, respondendo mensagens de forma rápida, objetiva e educada tanto no **WhatsApp** quanto no **Telegram**.


Funcionalidades

* **Inteligência Artificial:** Respostas dinâmicas geradas pelo modelo Gemini 2.5 Flash.
* **Multi-plataforma:** Suporte em paralelo para Webhook (WhatsApp Cloud API) e Long Polling (Telegram Telegraf).
* **Resiliência a Falhas (Anti-503):** Mecanismo de até 3 tentativas automáticas (*retries*) com pausa caso a API do Google apresente alta demanda.
* **Tratamento do Nono Dígito:** Correção automática no formato de entrada dos números brasileiros para garantir a entrega no Sandbox da Meta.


Estrutura do Projeto

* `agent.js`: Core do projeto. Contém a inicialização do Gemini, a lógica de inteligência artificial com tratamento de erros e a função de disparo do WhatsApp via Axios.
* `server.js`: Servidor Express que gerencia os Webhooks de entrada e verificação da API do WhatsApp.
* `telegram.js`: Script independente que roda o bot do Telegram via Long Polling, dispensando o uso de portas locais ou Ngrok.
* `.env`: Arquivo de configuração de credenciais e variáveis de ambiente (protegido e fora do controle de versão).


Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 18 ou superior)
* [Ngrok](https://ngrok.com/) (Apenas se for rodar o módulo do WhatsApp localmente)

### Instalação de Dependências

No terminal do projeto, execute o comando abaixo para instalar os módulos necessários:

```bash
npm install express dotenv axios telegraf @google/genai
