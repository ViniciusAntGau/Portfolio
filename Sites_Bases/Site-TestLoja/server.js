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
            user: 'seuemail@gmail.com', // Substitua pelo seu e-mail
            pass: 'suasenha' // Substitua pela sua senha
        }
    });

    const mailOptions = {
        from: 'seuemail@gmail.com', // E-mail do remetente
        to: 'robertinescarlinhos@gmail.com', // E-mail de destino
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