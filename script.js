document.getElementById('nfeForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const notaFiscal = {
    emitente: {
      nome: document.getElementById('emitenteNome').value,
      cnpj: document.getElementById('emitenteCNPJ').value,
      ie: document.getElementById('emitenteIE').value,
      endereco: document.getElementById('emitenteEndereco').value
    },
    destinatario: {
      nome: document.getElementById('destinatarioNome').value,
      cpf_cnpj: document.getElementById('destinatarioCPF_CNPJ').value,
      ie: document.getElementById('destinatarioIE').value,
      endereco: document.getElementById('destinatarioEndereco').value
    },
    produto: {
      descricao: document.getElementById('produtoDescricao').value,
      codigo: document.getElementById('produtoCodigo').value,
      ncm: document.getElementById('produtoNCM').value,
      cfop: document.getElementById('produtoCFOP').value,
      quantidade: parseFloat(document.getElementById('produtoQtd').value),
      valorUnitario: parseFloat(document.getElementById('produtoValorUnit').value)
    },
    pagamento: {
      forma: document.getElementById('formaPagamento').value
    }
  };

  try {
    const response = await fetch('http://localhost:3000/emitir-nfe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notaFiscal)
    });

    const data = await response.json();
    document.getElementById('resposta').innerText = data.mensagem || 'Nota emitida com sucesso!';
  } catch (error) {
    console.error('Erro ao emitir NF-e:', error);
    document.getElementById('resposta').innerText = 'Erro ao emitir NF-e.';
  }
});

