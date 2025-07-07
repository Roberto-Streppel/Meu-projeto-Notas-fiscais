const { Parser } = require('json2csv'); // 👈 Lembre de instalar: npm install json2csv


const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const CAMINHO_ARQUIVO = './notas.json';

// Simulador de validação com a SEFAZ
function validarComSefaz(nota) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulação simples: rejeita valores acima de R$ 10000, por exemplo
      if (nota.valor > 10000) {
        resolve({ status: 'rejeitada', motivo: 'Valor excede o limite permitido pela SEFAZ.' });
      } else {
        resolve({ status: 'autorizada' });
      }
    }, 1000); // Simula o tempo de comunicação com a SEFAZ
  });
}

// Rota de emissão da nota com validação
app.post('/emitir-nota', async (req, res) => {
  const { cliente, item, valor } = req.body;
  const novaNota = {
    cliente,
    item,
    valor,
    data: new Date().toLocaleString('pt-BR')
  };

  try {
    const respostaSefaz = await validarComSefaz(novaNota);

    if (respostaSefaz.status === 'rejeitada') {
      return res.status(400).json({ mensagem: `NF-e rejeitada: ${respostaSefaz.motivo}` });
    }

    // Leitura do arquivo atual
    let notas = [];
    if (fs.existsSync(CAMINHO_ARQUIVO)) {
      const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, 'utf8');
      notas = conteudo ? JSON.parse(conteudo) : [];
    }

    notas.push(novaNota);
    fs.writeFileSync(CAMINHO_ARQUIVO, JSON.stringify(notas, null, 2));
    res.json({ mensagem: 'NF-e autorizada e emitida com sucesso!' });
  } catch (err) {
    console.error('Erro ao processar nota:', err);
    res.status(500).json({ mensagem: 'Erro ao processar nota fiscal.' });
  }
});

// Rota para consultar histórico
app.get('/historico-notas', (req, res) => {
  try {
    if (fs.existsSync(CAMINHO_ARQUIVO)) {
      const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, 'utf8');
      const notas = JSON.parse(conteudo || '[]');
      res.json(notas);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('Erro ao ler histórico:', err);
    res.status(500).json({ mensagem: 'Erro ao ler o histórico.' });
  }
});

const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
app.get('/exportar-csv', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler o arquivo de notas.');
    }

    try {
      const notas = JSON.parse(data);
      const campos = ['cliente', 'item', 'valor', 'data'];
      const parser = new Parser({ fields: campos });
      const csv = parser.parse(notas);

      res.header('Content-Type', 'text/csv');
      res.attachment('notas.csv');
      return res.send(csv);
    } catch (erroConversao) {
      return res.status(500).send('Erro ao converter os dados para CSV.');
    }
  });
});

