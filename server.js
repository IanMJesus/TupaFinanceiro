// Configurações iniciais do servidor (usadas para importar módulos e inicializar uma aplicação Express no Node.js.):

    // express: Framework para criar um servidor HTTP.
    const express = require("express");

    // mysql2: Biblioteca para conectar o Node.js ao MySQL.
    const mysql = require("mysql2");

    // cors: Middleware para permitir requisições de outras origens (Cross-Origin Resource Sharing).
    const cors = require("cors");

    // Cria uma aplicação Express (app). Configura o servidor para entender JSON nas requisições (express.json()). Usa cors() para permitir que o frontend (HTML/JavaScript) acesse esse servidor.
    const app = express();
    app.use(express.json());
    app.use(cors());

    // Configuração do Bando de Dados utilizando as credenciais para acesso
    const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'ianbd',
        database: 'alunos_wizard',
    });

    // Exibe mensagem no console de erro ou conexão bem sucedida
    db.connect(err => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados:", err);
        } else {
            console.log("Conectado ao banco de dados MySQL");
        }
    });

    // ----------------------------------------------------------------

    // Rota para cadastrar aluno

    // Cria a rota POST "/cadastrar", que recebe os dados do frontend. Obtém os valores nome, matricula, responsavele unidade do corpo da requisição (req.body). Insere os dados na tabela alunos_wizard do banco MySQL usando db.query(). Se ocorrer um erro, retorna status 500 (Internal Server Error). Se der certo, responde "Aluno cadastrado com sucesso!".
    app.post("/cadastrar", (req, res) => {
        const { nome_aluno, numero_matricula, responsavel_financeiro, unidade, material_didatico, valor_material_didatico, parcelas_material_didatico, forma_pagamento_material_didatico, data_inicio_pagamento_material_didatico, valor_do_modulo, parcelas_modulo, forma_pagamento_modulo, data_inicio_pagamento_modulo, taxa_matricula, forma_pagamento_taxa_matricula, data_pagamento_taxa_matricula, parcelas_taxa_matricula } = req.body;
        const sql = "INSERT INTO info_alunos (nome_aluno, numero_matricula, responsavel_financeiro, unidade, material_didatico, valor_material_didatico, parcelas_material_didatico, forma_pagamento_material_didatico, data_inicio_pagamento_material_didatico, valor_do_modulo, parcelas_modulo, forma_pagamento_modulo, data_inicio_pagamento_modulo, taxa_matricula, forma_pagamento_taxa_matricula, data_pagamento_taxa_matricula, parcelas_taxa_matricula) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.query(sql, [nome_aluno, numero_matricula, responsavel_financeiro, unidade, material_didatico, valor_material_didatico, parcelas_material_didatico, forma_pagamento_material_didatico, data_inicio_pagamento_material_didatico, valor_do_modulo, parcelas_modulo, forma_pagamento_modulo, data_inicio_pagamento_modulo, taxa_matricula, forma_pagamento_taxa_matricula, data_pagamento_taxa_matricula, parcelas_taxa_matricula], (err, result) => {
            if (err) {
                console.error("Erro MySQL:", err);
                res.status(500).json({ message: "Erro ao cadastrar aluno", error: err.sqlMessage });
            } else {
            res.json({ message: "Aluno cadastrado com sucesso!" });
            }
        });
    });

        // Iniciar o servidor
        app.listen(3000, () => {
            console.log("Servidor rodando na porta 3000");
            });

    // Exibindo os alunos ------------------------------------------------------------------------------

    // Rota para listar todos os alunos
    app.get("/alunos", (req, res) => {

        // Busca todos os alunos da tabela
    const sql = "SELECT * FROM info_alunos"; 

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro ao buscar alunos:", err);
            res.status(500).json({ message: "Erro ao buscar alunos" });
        } else {
            res.json(result); // Retorna os dados em JSON
        }
    });
});

    // Exibindo algumas informações financeiras -----------------------------------------------------

    //Soma total do material didático + módulo de aulas + taxa de matrícula

    app.get("/total-total", (req, res) => {
        const sql = `
        SELECT 
            (SELECT COALESCE(SUM(valor_material_didatico + valor_do_modulo + taxa_matricula), 0) FROM info_alunos) +
            (SELECT COALESCE(SUM(valor_faturamento), 0) FROM cadastro_faturamento) 
        AS total_tudo;
        `;
    
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Erro ao calcular total:", err);
                res.status(500).json({ message: "Erro ao calcular total" });
            } else {
                console.log("Resultado da query:", result); // Log para depuração
                res.json(result[0]); // Retorna o total
            }
        });
    });

    // Exibe o faturamento mensal total do material didático + módulo de aulas + taxa de matrícuças
    
    app.get("/faturamento-mensal-total", (req, res) => {
        const sql = `
            SELECT 
                valor_material_didatico, parcelas_material_didatico, data_inicio_pagamento_material_didatico,
                valor_do_modulo, parcelas_modulo, data_inicio_pagamento_modulo,
                taxa_matricula, parcelas_taxa_matricula, data_pagamento_taxa_matricula
            FROM info_alunos
            UNION ALL
            SELECT 
                valor_faturamento AS valor, quantidade_parcelas AS parcelas, data_pagamento AS dataInicio,
                NULL, NULL, NULL,
                NULL, NULL, NULL
            FROM cadastro_faturamento
        `;
    
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Erro ao buscar os dados:", err);
                return res.status(500).json({ message: "Erro ao calcular faturamento mensal" });
            }
    
            let faturamentoMensal = {};
    
            results.forEach((item) => {
                const pagamentos = [
                    { valor: item.valor_material_didatico, parcelas: item.parcelas_material_didatico, dataInicio: item.data_inicio_pagamento_material_didatico },
                    { valor: item.valor_do_modulo, parcelas: item.parcelas_modulo, dataInicio: item.data_inicio_pagamento_modulo },
                    { valor: item.taxa_matricula, parcelas: item.parcelas_taxa_matricula, dataInicio: item.data_pagamento_taxa_matricula },
                    { valor: item.valor, parcelas: item.parcelas, dataInicio: item.dataInicio } // Adiciona os dados de cadastro_faturamento
                ];
    
                pagamentos.forEach(({ valor, parcelas, dataInicio }) => {
                    if (valor && parcelas && dataInicio) {
                        let valorParcela = valor / parcelas;
                        let dataPagamento = new Date(dataInicio);
    
                        for (let i = 0; i < parcelas; i++) {
                            let mesAno = `${dataPagamento.getFullYear()}-${(dataPagamento.getMonth() + 1).toString().padStart(2, '0')}`;
    
                            if (!faturamentoMensal[mesAno]) {
                                faturamentoMensal[mesAno] = 0;
                            }
    
                            faturamentoMensal[mesAno] += valorParcela;
    
                            dataPagamento.setMonth(dataPagamento.getMonth() + 1);
                        }
                    }
                });
            });
    
            res.json(faturamentoMensal);
        });
    });
    
    //Soma total do material didático

    app.get("/total-material-didatico", (req, res) => {
        const sql = "SELECT SUM(valor_material_didatico) AS total FROM info_alunos";
    
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Erro ao calcular total:", err);
                res.status(500).json({ message: "Erro ao calcular total" });
            } else {
                console.log("Resultado da query:", result); // Log para depuração
                res.json(result[0]); // Retorna o total
            }
        });
    });


    // Calcular o faturamento mensal de material didático

    app.get("/faturamento-mensal", (req, res) => {
        const sql = `
            SELECT 
                DATE_FORMAT(DATE_ADD(data_inicio_pagamento_material_didatico, INTERVAL t.n + 1 MONTH), '%Y-%m') AS mes,
                SUM(valor_material_didatico / parcelas_material_didatico) AS faturamento
            FROM info_alunos
            JOIN (
                SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 
                UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            ) t
            ON t.n < parcelas_material_didatico
            GROUP BY mes
            ORDER BY mes;
        `;
    
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Erro ao calcular faturamento mensal:", err);
                res.status(500).json({ message: "Erro ao calcular faturamento mensal" });
            } else {
                res.json(result); // Retorna o faturamento por mês
            }
        });
    });

    // Soma total do módulo de aulas

        app.get("/total-modulo", (req, res) => {
        const sql = "SELECT SUM(valor_do_modulo) AS total FROM info_alunos";
    
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Erro ao calcular total:", err);
                res.status(500).json({ message: "Erro ao calcular total" });
            } else {
                console.log("Resultado da query:", result); // Log para depuração
                res.json(result[0]); // Retorna o total
            }
        });
    });


    // Calcular o faturamento mensal em módulo de aulas

    app.get("/faturamento-mensal-modulo", (req, res) => {
        const sql = `
            SELECT 
                DATE_FORMAT(DATE_ADD(data_inicio_pagamento_modulo, INTERVAL t.n + 1 MONTH), '%Y-%m') AS mes,
                SUM(valor_do_modulo / parcelas_modulo) AS faturamento_modulo
            FROM info_alunos
            JOIN (
                SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 
                UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 
                UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            ) t
            ON t.n < parcelas_modulo
            GROUP BY mes
            ORDER BY mes;
        `;
    
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Erro ao calcular faturamento mensal:", err);
                res.status(500).json({ message: "Erro ao calcular faturamento mensal" });
            } else {
                console.log("Resultado da consulta:", result);
                res.json(result); // Retorna o faturamento por mês
            }
        });
    });

    // ---------------------------------------------------------------------------
    // Rota para conectar a página "Cadastro de Faturamento" na tabela cadastro_faturamento

    app.post("/cadastrar-faturamento", (req, res) => {
        const { nome_aluno, numero_matricula, unidade, motivo_faturamento, valor_faturamento, quantidade_parcelas, data_pagamento, forma_pagamento } = req.body;
        const sql = "INSERT INTO cadastro_faturamento (nome_aluno, numero_matricula, unidade, motivo_faturamento, valor_faturamento, quantidade_parcelas, data_pagamento, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        db.query(sql, [nome_aluno, numero_matricula, unidade, motivo_faturamento, valor_faturamento, quantidade_parcelas, data_pagamento, forma_pagamento], (err, result) => {
            if (err) {
                console.error("Erro MySQL:", err);
                res.status(500).json({ message: "Erro ao cadastrar faturamento", error: err.sqlMessage });
            } else {
            res.json({ message: "Faturamento cadastrado com sucesso!" });
            }
        });
    });

    // Exibindo os faturamentos ------------------------------------------------------------------------------

    // Rota para listar todos os faturamentos
    app.get("/faturamentos", (req, res) => {

        // Busca todos os faturamentos
    const sql = "SELECT * FROM cadastro_faturamento"; 

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Erro ao buscar faturamentos:", err);
            res.status(500).json({ message: "Erro ao buscar faturamentos" });
        } else {
            res.json(result); // Retorna os dados em JSON
        }
    });
});


    






