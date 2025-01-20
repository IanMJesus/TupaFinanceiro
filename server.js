// Configurações iniciais do servidor (usadas para importar módulos e inicializar uma aplicação Express no Node.js.):

    // Esse comando importa o módulo express, que é um framework web para Node.js. O Express facilita a criação de servidores web, rotas e APIs.
    const express = require('express');

    // Esse comando importa o módulo mysql, que permite que o Node.js interaja com um banco de dados MySQL. O módulo fornece funções para se conectar ao banco de dados, executar consultas SQL, manipular dados, etc.
    const mysql = require('mysql2');

    // Esse comando importa o módulo body-parser, que é usado para fazer o parse (análise) do corpo das requisições HTTP. Ele é útil para lidar com dados que são enviados em formulários ou via JSON.
    const bodyParser = require('body-parser');

    // Esse comando cria uma instância do Express e a armazena na constante app. A variável app agora representa a aplicação web Express, com a qual você pode configurar rotas, middlewares, e manipular requisições.
    const app = express();

    // Porta onde o servidor será executado:
    const port = 3000;


    // Permite que o front-end se comunique com o servidor sem bloqueios. Por padrão, navegadores aplicam restrições de segurança que impedem que uma aplicação web em um domínio envie solicitações para outro domínio. Isso é chamado de restrição de origem cruzada. O CORS é um mecanismo que permite que o servidor declare explicitamente quais origens (domínios) podem acessar seus recursos. Isso é feito enviando cabeçalhos HTTP apropriados.
    const cors = require('cors');

    // Processa o corpo das requisições HTTP, convertendo-o em JSON. Por padrão, o Express não sabe interpretar o corpo (body) de uma requisição HTTP. Se você enviar dados no formato JSON, eles não serão automaticamente convertidos em um objeto utilizável no servidor. A biblioteca body-parser ajuda a interpretar esses dados. O método .json() diz ao body-parser para processar apenas conteúdos no formato JSON e armazená-los no objeto req.body.
    app.use(bodyParser.json());

    // Iniciar o servidor:
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    });

    // Configuração do Bando de Dados utilizando as credenciais para acesso
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'ianbd',
        database: 'alunos_wizard',
        port: 3306
    });

    // Faz a conexão com o banco de dados e exibe uma mensagem de sucesso ou uma mensagem de error
    db.connect((err) => {
        if (err) {
            console.error('Erro ao conectar ao banco de dados:', err);
        } else {
            console.log('Conectado ao banco de dados!');
        }
    });


    // Não sei se vai dar certo---------------------------------------
    // Criação da rota 

    app.get('/add', function(req, res){
        res.send('FORMULÁRIO RECEBIDO!')
    })

