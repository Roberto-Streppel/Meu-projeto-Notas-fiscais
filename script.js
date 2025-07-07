// Envia a nota para o backend
document.getElementById('notaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cliente = document.getElementById('cliente').value;
  const item = document.getElementById('item').value;
  const valor = parseFloat(document.getElementById('valor').value);

  const nota = { cliente, item, valor };

  try {
    const response = await fetch('http://127.0.0.1:3000/emitir-nota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nota)
    });

    const data = await response.json();
    const respostaDiv = document.getElementById('resposta');

    // Exibe a mensagem
    respostaDiv.innerText = data.mensagem;

    if (data.autorizada) {
      respostaDiv.style.color = 'green';

      // Mostra os dados do recibo
      document.getElementById('reciboCliente').innerText = cliente;
      document.getElementById('reciboItem').innerText = item;
      document.getElementById('reciboValor').innerText = valor.toFixed(2);
      document.getElementById('reciboData').innerText = new Date().toLocaleString('pt-BR');
      document.getElementById('recibo').style.display = 'block';
    } else {
      respostaDiv.style.color = 'red';
      document.getElementById('recibo').style.display = 'none'; // Oculta recibo se rejeitada
    }

  } catch (error) {
    console.error('Erro ao emitir nota:', error);
    const respostaDiv = document.getElementById('resposta');
    respostaDiv.innerText = 'Erro ao emitir nota.';
    respostaDiv.style.color = 'red';
  }
});

// Controle de visibilidade do histórico
let historicoVisivel = false;

document.getElementById('verHistorico').addEventListener('click', async () => {
  const historicoDiv = document.getElementById('historico');

  if (historicoVisivel) {
    // Oculta
    historicoDiv.innerHTML = '';
    historicoVisivel = false;
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:3000/historico-notas');
    const notas = await response.json();

    historicoDiv.innerHTML = '<h3>Histórico de Notas</h3>';

    if (notas.length === 0) {
      historicoDiv.innerHTML += '<p>Nenhuma nota emitida ainda.</p>';
    } else {
      notas.forEach(nota => {
        historicoDiv.innerHTML += `
          <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
            <strong>Cliente:</strong> ${nota.cliente}<br>
            <strong>Item:</strong> ${nota.item}<br>
            <strong>Valor:</strong> R$${Number(nota.valor).toFixed(2)}<br>
            <strong>Data:</strong> ${nota.data}
          </div>
        `;
      });
    }

    historicoVisivel = true;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    const respostaDiv = document.getElementById('resposta');
    respostaDiv.innerText = 'Erro ao carregar histórico.';
    respostaDiv.style.color = 'red';
  }
  // Botão para limpar o formulário
document.getElementById('limparForm').addEventListener('click', () => {
  document.getElementById('cliente').value = '';
  document.getElementById('item').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('resposta').innerText = '';
  document.getElementById('recibo').style.display = 'none';
});

});
// Botão para exportar histórico em CSV
document.getElementById('exportarCSV').addEventListener('click', async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/exportar-csv');
    const csv = await response.text();

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'notas.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    alert('Erro ao exportar CSV.');
  }
});

