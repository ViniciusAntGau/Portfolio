const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Rota para receber os dados do formulário
app.post('/enviar', (req, res) => {
    const { nome, email, mensagem } = req.body;

    // Configuração do Nodemailer para enviar e-mail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'seuemail@gmail.com', // Seu e-mail
            pass: 'suasenha' // Sua senha
        }
    });

    const mailOptions = {
        from: 'seuemail@gmail.com',
        to: 'emaildestino@example.com', // E-mail de destino
        subject: 'Nova mensagem do formulário de contato',
        text: `Nome: ${nome}\nE-mail: ${email}\nMensagem: ${mensagem}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Erro ao enviar a mensagem.');
        } else {
            console.log('E-mail enviado: ' + info.response);
            res.send('Mensagem enviada com sucesso!');
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
// script.js

// Dados dos produtos (simulando um banco de dados)
const produtos = {
    "pastilhas-de-freio": {
        nome: "Pastilhas de Freio",
        descricao: "Pastilhas de freio de alta qualidade para motos esportivas.",
        preco: "R$ 120,00",
        imagem: "https://via.placeholder.com/300",
    },
    "oleo-de-motor": {
        nome: "Óleo de Motor",
        descricao: "Óleo sintético para motores de alta performance.",
        preco: "R$ 50,00",
        imagem: "https://via.placeholder.com/300",
    },
    "pneu-dianteiro": {
        nome: "Pneu Dianteiro",
        descricao: "Pneu dianteiro para motos de corrida.",
        preco: "R$ 250,00",
        imagem: "https://via.placeholder.com/300",
    },
    // Adicione os outros produtos aqui...
};

// Captura o parâmetro da URL
const urlParams = new URLSearchParams(window.location.search);
const produtoId = urlParams.get('produto');

// Exibe os detalhes do produto
if (produtoId && produtos[produtoId]) {
    const produto = produtos[produtoId];
    document.getElementById('titulo-produto').textContent = produto.nome;
    document.getElementById('detalhes-produto').innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}">
        <p><strong>Descrição:</strong> ${produto.descricao}</p>
        <p><strong>Preço:</strong> ${produto.preco}</p>
    `;
} else {
    document.getElementById('detalhes-produto').innerHTML = "<p>Produto não encontrado.</p>";
}