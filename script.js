/* =========================================================
   JOGO DA MEMÓRIA — LÍNGUA PORTUGUESA (6º ANO)
   Fases: Coletivos → Sinônimos → Antônimos
   ========================================================= */

// ---------- CONFIGURAÇÃO DAS FASES ----------
const FASES = [
  {
    nome: "Coletivos",
    dica: "Ligue cada coletivo ao grupo de seres que ele nomeia.",
    pares: [
      { a: "Alcateia",    b: "Lobos" },
      { a: "Cardume",     b: "Peixes" },
      { a: "Enxame",      b: "Abelhas" },
      { a: "Matilha",     b: "Cães" },
      { a: "Revoada",     b: "Pássaros" },
      { a: "Cacho",       b: "Bananas" }
    ]
  },
  {
    nome: "Sinônimos",
    dica: "Encontre as palavras que têm o mesmo significado.",
    pares: [
      { a: "Feliz",       b: "Contente" },
      { a: "Bonito",      b: "Belo" },
      { a: "Rápido",      b: "Veloz" },
      { a: "Casa",        b: "Moradia" },
      { a: "Professor",   b: "Mestre" },
      { a: "Falar",       b: "Dizer" }
    ]
  },
  {
    nome: "Antônimos",
    dica: "Encontre as palavras que têm significados opostos.",
    pares: [
      { a: "Alto",        b: "Baixo" },
      { a: "Quente",      b: "Frio" },
      { a: "Claro",       b: "Escuro" },
      { a: "Feliz",       b: "Triste" },
      { a: "Cheio",       b: "Vazio" },
      { a: "Doce",        b: "Amargo" }
    ]
  }
];

// ---------- ESTADO DO JOGO ----------
const estado = {
  faseAtual: 0,
  pontos: 0,
  jogadas: 0,
  acertos: 0,
  segundos: 0,
  intervalo: null,
  primeiraCarta: null,
  segundaCarta: null,
  bloqueado: false,
  restantes: 0,
  jogoAtivo: false
};

// ---------- REFERÊNCIAS DO DOM ----------
const telaInicio  = document.getElementById('tela-inicio');
const telaJogo    = document.getElementById('tela-jogo');
const telaFinal   = document.getElementById('tela-final');

const elFase      = document.getElementById('info-fase');
const elPontos    = document.getElementById('info-pontos');
const elJogadas   = document.getElementById('info-jogadas');
const elTempo     = document.getElementById('info-tempo');

const elTituloFase = document.getElementById('titulo-fase');
const elDicaFase   = document.getElementById('dica-fase');
const elTabuleiro  = document.getElementById('tabuleiro');
const elMensagem   = document.getElementById('mensagem');

const btnComecar    = document.getElementById('btn-comecar');
const btnReiniciar  = document.getElementById('btn-reiniciar');
const btnSair       = document.getElementById('btn-sair');
const btnJogarNovamente = document.getElementById('btn-jogar-novamente');

const elFinalPontos   = document.getElementById('final-pontos');
const elFinalJogadas  = document.getElementById('final-jogadas');
const elFinalTempo    = document.getElementById('final-tempo');
const elTextoFinal    = document.getElementById('texto-final');

// ---------- UTILITÁRIOS ----------
function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function formatarTempo(totalSegundos) {
  const min = String(Math.floor(totalSegundos / 60)).padStart(2, '0');
  const seg = String(totalSegundos % 60).padStart(2, '0');
  return `${min}:${seg}`;
}

function mostrarTela(tela) {
  [telaInicio, telaJogo, telaFinal].forEach(t => t.classList.remove('ativa'));
  tela.classList.add('ativa');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function atualizarPainel() {
  elFase.textContent    = `${estado.faseAtual + 1}/${FASES.length}`;
  elPontos.textContent  = estado.pontos;
  elJogadas.textContent = estado.jogadas;
  elTempo.textContent   = formatarTempo(estado.segundos);
}

// ---------- CRONÔMETRO ----------
function iniciarCronometro() {
  pararCronometro();
  estado.segundos = 0;
  atualizarPainel();
  estado.intervalo = setInterval(() => {
    estado.segundos++;
    elTempo.textContent = formatarTempo(estado.segundos);
  }, 1000);
}

function pararCronometro() {
  if (estado.intervalo) {
    clearInterval(estado.intervalo);
    estado.intervalo = null;
  }
}

// ---------- MONTAR O TABULEIRO ----------
function montarTabuleiro() {
  const fase = FASES[estado.faseAtual];

  // Cria as cartas a partir dos pares (a e b viram cartas separadas)
  const cartas = [];
  fase.pares.forEach((par, indice) => {
    cartas.push({ texto: par.a, parId: indice });
    cartas.push({ texto: par.b, parId: indice });
  });

  const cartasEmbaralhadas = embaralhar(cartas);

  elTabuleiro.innerHTML = '';
  cartasEmbaralhadas.forEach((carta, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'carta';
    btn.dataset.parId = carta.parId;
    btn.dataset.indice = i;
    btn.setAttribute('aria-label', 'Carta virada');

    btn.innerHTML = `
      <div class="carta-interna">
        <div class="carta-face carta-verso" aria-hidden="true">?</div>
        <div class="carta-face carta-frente">${carta.texto}</div>
      </div>
    `;

    btn.addEventListener('click', () => virarCarta(btn));
    elTabuleiro.appendChild(btn);
  });

  estado.restantes = fase.pares.length;
  estado.primeiraCarta = null;
  estado.segundaCarta = null;
  estado.bloqueado = false;
}

// ---------- VIRAR CARTA ----------
function virarCarta(carta) {
  if (estado.bloqueado) return;
  if (carta.classList.contains('virada')) return;
  if (carta.classList.contains('combinada')) return;

  carta.classList.add('virada');
  carta.setAttribute('aria-label', 'Carta: ' + carta.querySelector('.carta-frente').textContent);

  // Primeira carta da rodada
  if (!estado.primeiraCarta) {
    estado.primeiraCarta = carta;
    return;
  }

  // Segunda carta
  estado.segundaCarta = carta;
  estado.jogadas++;
  atualizarPainel();
  verificarPar();
}

// ---------- VERIFICAR PAR ----------
function verificarPar() {
  const c1 = estado.primeiraCarta;
  const c2 = estado.segundaCarta;

  const mesmoPar = c1.dataset.parId === c2.dataset.parId;

  if (mesmoPar) {
    // ✅ ACERTO
    c1.classList.add('combinada');
    c2.classList.add('combinada');
    c1.disabled = true;
    c2.disabled = true;

    estado.pontos += 10;
    estado.acertos++;
    estado.restantes--;

    elMensagem.textContent = '✅ Acertou! +10 pontos';
    elMensagem.classList.remove('erro');
    atualizarPainel();

    resetarEscolha();

    if (estado.restantes === 0) {
      finalizarFase();
    }
  } else {
    // ❌ ERRO
    estado.pontos = Math.max(0, estado.pontos - 2);
    atualizarPainel();

    elMensagem.textContent = '❌ Errou! −2 pontos';
    elMensagem.classList.add('erro');

    c1.classList.add('errada');
    c2.classList.add('errada');

    estado.bloqueado = true;

    setTimeout(() => {
      c1.classList.remove('virada', 'errada');
      c2.classList.remove('virada', 'errada');
      c1.setAttribute('aria-label', 'Carta virada');
      c2.setAttribute('aria-label', 'Carta virada');
      resetarEscolha();
      estado.bloqueado = false;
    }, 900);
  }
}

function resetarEscolha() {
  estado.primeiraCarta = null;
  estado.segundaCarta = null;
}

// ---------- FINALIZAR FASE ----------
function finalizarFase() {
  pararCronometro();
  estado.bloqueado = true;

  estado.pontos += 20;
  atualizarPainel();

  elMensagem.textContent = `🎉 Fase concluída! Bônus de +20 pontos!`;
  elMensagem.classList.remove('erro');

  setTimeout(() => {
    estado.faseAtual++;

    if (estado.faseAtual < FASES.length) {
      iniciarFase();
    } else {
      mostrarTelaFinal();
    }
  }, 1800);
}

// ---------- INICIAR FASE ----------
function iniciarFase() {
  const fase = FASES[estado.faseAtual];

  elTituloFase.textContent = `Fase ${estado.faseAtual + 1} — ${fase.nome}`;
  elDicaFase.textContent   = fase.dica;
  elMensagem.textContent   = '';
  elMensagem.classList.remove('erro');

  montarTabuleiro();
  iniciarCronometro();
  atualizarPainel();
  estado.bloqueado = false;
}

// ---------- MOSTRAR TELA FINAL ----------
function mostrarTelaFinal() {
  pararCronometro();
  estado.jogoAtivo = false;

  elFinalPontos.textContent  = estado.pontos;
  elFinalJogadas.textContent = estado.jogadas;
  elFinalTempo.textContent   = formatarTempo(estado.segundos);

  let medalha = '🥉';
  let mensagem = 'Bom trabalho! Continue praticando!';

  if (estado.pontos >= 400) {
    medalha = '🥇';
    mensagem = 'Excelente! Você é um mestre das palavras!';
  } else if (estado.pontos >= 250) {
    medalha = '🥈';
    mensagem = 'Muito bem! Você conhece bastante a Língua Portuguesa!';
  }

  elTextoFinal.textContent = `${medalha} ${mensagem}`;
  mostrarTela(telaFinal);
}

// ---------- INICIAR JOGO (do zero) ----------
function iniciarJogo() {
  estado.faseAtual  = 0;
  estado.pontos     = 0;
  estado.jogadas    = 0;
  estado.acertos    = 0;
  estado.segundos   = 0;
  estado.primeiraCarta = null;
  estado.segundaCarta  = null;
  estado.bloqueado  = false;
  estado.jogoAtivo  = true;

  mostrarTela(telaJogo);
  iniciarFase();
}

// ---------- EVENTOS ----------
btnComecar.addEventListener('click', iniciarJogo);

btnReiniciar.addEventListener('click', () => {
  if (!estado.jogoAtivo) return;
  iniciarFase();
});

btnSair.addEventListener('click', () => {
  pararCronometro();
  estado.jogoAtivo = false;
  mostrarTela(telaInicio);
});

btnJogarNovamente.addEventListener('click', iniciarJogo);

// ---------- INICIALIZAÇÃO ----------
mostrarTela(telaInicio);