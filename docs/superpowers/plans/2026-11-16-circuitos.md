# Circuitos com direção pelo dedo — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar a pista reta de 3 faixas por três circuitos fechados, sorteados a cada corrida. O Theo dirige com o dedo, com assistência invisível, em 2 voltas.

**Architecture:**
- Toda a geometria fica em lógica pura e testável:
  - `circuito.js`: linha central suavizada, ponto mais próximo, posição na distância;
  - `direcao.js`: ângulo novo do carro.
- `adversarios.js` e `pista.js` passam a receber o comprimento da corrida ou o circuito, em vez de constantes.
- `Corrida.js` é reescrita para um mundo 2D com câmera seguindo o carro. A pista é pintada uma vez por corrida em RenderTextures de meia resolução.

**Tech Stack:** Phaser 3.90 (câmera, RenderTexture), Vitest.

**Spec:** `docs/spec.md`, seção "Corrida"

## Global Constraints

- Circuitos: `oval`, `feijao`, `serpente`, um sorteado por corrida. Cada um tem ~15 pontos de controle, formando um laço fechado.
- Medidas:
  - asfalto com `LARGURA_PISTA = 360` (meia largura 180), zebras vermelho/branco nas bordas, fundo de grama do Kenney;
  - cada volta com 8500–9500 px de linha central;
  - 2 voltas; com `VELOCIDADE_BASE = 330`, a corrida dura 50–60 s.
- Velocidades:
  - na grama (afastamento > 180), o Theo anda a 60%;
  - nitro 1.8× por 3 s, batida 0.5× por 1 s, como hoje;
  - não há derrota nem parede.
- A câmera segue o Theo e não gira: o norte fica sempre para cima.
- Os adversários não colidem com o Theo. A meta continua: Theo em 1º em ~85% das corridas, nunca em 3º ou 4º.
- Objetos:
  - sorteados uma vez por corrida, nas mesmas posições nas duas voltas;
  - estrela pega não volta;
  - um a cada 600 px; 50% estrela, 30% obstáculo (nunca antes de 800 px), 20% nitro (≥ 1500 px entre nitros).
- Nenhuma dependência npm nova. A interface de `criarCarro` não muda. Garagem, LavaJato e Presente não mudam.
- A cena continua chamando `scene.start('LavaJato', { posicao, estrelas, corridaId: Date.now() })`.

## Review Focus

1. **Dedo apontando para trás ou atrás do carro:** o carro nunca anda de ré pela pista. O ângulo desejado fica limitado a ±90° da direção da pista. Teste em `direcao.test.js`.
2. **Dedo muito perto do carro (< 40 px):** ignorado, para o carro não girar sem rumo sob o dedo. Teste em `direcao.test.js`.
3. **Circuito que encosta nele mesmo:** na serpente e no feijão, partes distantes da linha não podem se sobrepor. Senão, o "ponto mais próximo" pula para o outro trecho e a volta é contada errado. Teste em `circuito.test.js`.
4. **Volta contada errado ao cruzar a largada** (d de L para 0): o progresso é acumulado por diferença com desdobramento. Teste em `circuito.test.js` (`avancar`).
5. **Phaser reutiliza a instância da cena:** na 2ª corrida, estado zerado em `create()` e RenderTextures da corrida anterior destruídas. Verificação no navegador na Task 4 (3 corridas seguidas).

---

### Task 1: Circuitos (geometria pura)

**Files:**
- Create: `src/logica/circuito.js`
- Test: `src/logica/circuito.test.js`

**Interfaces:**
- Produces:
  - `LARGURA_PISTA = 360`
  - `CIRCUITOS: { oval: [x, y][], feijao: [x, y][], serpente: [x, y][] }`: pontos de controle em px do mundo, coordenadas ≥ 400 (margem para a grama), no sentido horário.
  - `criarCircuito(pontos) → { amostras: {x, y, d}[], comprimento }`: Catmull-Rom fechado, amostrado a cada ~20 px; `d` é a distância acumulada a partir do 1º ponto.
  - `pontoNa(c, d) → { x, y, angulo }`: `d` em módulo do comprimento (aceita negativo e > L). `angulo` em radianos, no padrão do Phaser (0 = direita).
  - `maisProximo(c, x, y, dDica?) → { d, afastamento }`: busca numa janela de ±600 px ao redor de `dDica`; sem dica, busca em tudo. `afastamento` com sinal (positivo à direita do sentido de marcha).
  - `avancar(percorrido, dAnterior, dNovo, L) → percorrido`: soma a diferença desdobrada (diferença em [−L/2, L/2]).

- [ ] **Step 1: testes que falham.** Para cada um dos 3 circuitos:
  - `comprimento` entre 8500 e 9500;
  - laço fechado: a distância entre a última e a primeira amostra é ≤ 25;
  - sem sobreposição: para quaisquer duas amostras a mais de 1000 px de distância ao longo da linha (circular), a distância euclidiana é ≥ `LARGURA_PISTA + 200`;
  - `maisProximo` de um ponto a 100 px à direita de `pontoNa(c, 3000)` → `d ≈ 3000` (±30) e `afastamento ≈ 100` (±10);
  - `pontoNa(c, -100)` é igual a `pontoNa(c, L - 100)`;
  - `avancar(9000, L - 50, 30, L)` resulta em `9080`; `avancar(100, 30, L - 20, L)` resulta em `50`.
- [ ] **Step 2:** `npm test`. Esperado: FAIL (módulo não existe).
- [ ] **Step 3:** implementar. Desenhar os pontos de controle:
  - **oval:** elipse de raios ~1700×1150, com 14 pontos;
  - **feijão:** a oval com 3 pontos de um lado puxados ~500 px para dentro;
  - **serpente:** um retângulo arredondado com um "S" no lado de baixo.
  - Ajustar os pontos até os testes passarem.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: circuitos com linha central suavizada`.

### Task 2: Direção pelo dedo com assistência (lógica pura)

**Files:**
- Create: `src/logica/direcao.js`
- Test: `src/logica/direcao.test.js`

**Interfaces:**
- Consumes: `criarCircuito`, `pontoNa`, `maisProximo`, `CIRCUITOS`, `LARGURA_PISTA` (Task 1).
- Produces:
  - `GIRO_MAX = 3.5` (rad/s); `FATOR_GRAMA = 0.6`; `OLHAR_A_FRENTE = 250`.
  - `novoAngulo({ angulo, x, y, dedo, alvoPista, tangente, afastamento, dt }) → angulo`:
    - `dedo` é `{x, y}` ou `null`; `alvoPista = pontoNa(c, d + OLHAR_A_FRENTE)`; `tangente` é o ângulo da pista no ponto do carro.
    - `angDedo` = ângulo até o dedo; sem dedo ou com o dedo a < 40 px, usa `angPista`.
    - `angPista` = ângulo até `alvoPista`.
    - `peso = clamp((|afastamento| - 60) / 200, 0, 1)` (sem dedo, `peso = 1`); `desejado = angDedo + peso · difAngulo(angPista, angDedo)`.
    - `desejado` é limitado a `tangente ± π/2`.
    - O resultado anda de `angulo` até `desejado` no máximo `GIRO_MAX · dt`.
  - `simularVoltas(c, voltas, dedoFn, dt = 1/30) → { segundos, maxAfastamento }`: carro na `VELOCIDADE_BASE`, a 60% quando `|afastamento| > LARGURA_PISTA / 2`. `dedoFn(estado)` devolve o dedo ou `null`. Usada só nos testes e para calibrar.

- [ ] **Step 1: testes que falham:**
  - sem dedo, nos 3 circuitos: `simularVoltas(c, 2, () => null)` completa as voltas com `maxAfastamento < 120` e `segundos` entre 50 e 60;
  - dedo sempre 300 px à direita do carro, perpendicular à pista (puxando para fora), nos 3 circuitos: completa 2 voltas, com `maxAfastamento < LARGURA_PISTA / 2 + 200` e `segundos < 80`;
  - dedo 300 px atrás do carro: depois de 2 s de simulação, o carro continua avançando (`percorrido` cresceu > 300);
  - dedo a 20 px do carro: `novoAngulo` igual ao caso sem dedo;
  - giro limitado: com `dt = 0.1`, `|novo - angulo| ≤ 0.35 + 1e-9`.
- [ ] **Step 2:** `npm test`. Esperado: FAIL.
- [ ] **Step 3:** implementar. Se os tempos ficarem fora de 50–60 s, recalibrar os circuitos da Task 1 dentro de 8500–9500, não a velocidade.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: direção pelo dedo com assistência`.

### Task 3: Adversários e objetos no circuito

**Files:**
- Modify: `src/logica/adversarios.js`, `src/logica/pista.js`
- Test: `src/logica/adversarios.test.js`, `src/logica/pista.test.js`

**Interfaces:**
- Consumes: `criarCircuito`, `pontoNa`, `maisProximo`, `LARGURA_PISTA`, `CIRCUITOS` (Task 1).
- Produces:
  - `COMPRIMENTO_PISTA` sai. Entra `COMPRIMENTO_PADRAO = 18000`, usado só como padrão dos testes e da simulação.
  - `velocidadeAlvo(adv, posTheo, total)` e `simularCorrida(rng, total = COMPRIMENTO_PADRAO)`: mesma regra, com a reta final em `posTheo / total > 0.85`.
  - `atualizarAdversario(adv, posTheo, dt, total)`.
  - `criarAdversarios` sem mudança (`faixa` 0..2 vira o deslocamento lateral `[-110, 0, 110]` na cena).
  - `gerarObjetos(rng, comprimentoVolta)`: mesmas regras, de 600 até `comprimentoVolta - 300`. `pos` é a distância na volta; `faixa` 0..2 vira o deslocamento lateral `[-110, 0, 110]`.
  - `gerarCenario(rng, c) → { x, y, tipo }[]`:
    - a cada 250 px de linha, alternando os lados, a `±(LARGURA_PISTA/2 + 140..260)` do centro;
    - descarta itens com `maisProximo(c, x, y).afastamento` (absoluto) < `LARGURA_PISTA/2 + 80`, ou seja, em cima de outro trecho;
    - arquibancada: exatamente 2, em `d = 300` e `d = L - 300`, do lado de fora (`lado = -1`, à esquerda no sentido horário), também passando pelo descarte.

- [ ] **Step 1: testes que falham (ajustar os existentes):**
  - `simularCorrida` com `total = 18000`: nunca 3º ou 4º, e vitórias entre 75% e 95% em 500 corridas;
  - o teste de ritmo passa a ser: `18000 / VELOCIDADE_BASE` entre 50 e 60;
  - `gerarObjetos(rng, 9000)`: as regras atuais, com o último `pos < 8700`;
  - `gerarCenario` nos 3 circuitos: nenhum item com afastamento < `LARGURA_PISTA/2 + 80` e 1 ou 2 arquibancadas.
- [ ] **Step 2:** `npm test`. Esperado: FAIL.
- [ ] **Step 3:** implementar. `Corrida.js` antiga deixa de compilar contra `COMPRIMENTO_PISTA`; ela é reescrita na Task 4. Até lá, o build pode quebrar dentro desta branch.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: adversários e objetos medidos no circuito`.

### Task 4: Cena da corrida no circuito (PORTÃO de sensação)

**Files:**
- Modify: `src/cenas/Corrida.js` (reescrita), `src/cenas/Carregar.js` (+ `grama`), `src/sons.js` (+ `volta`), `scripts/preparar-sprites.sh` (+ `land_grass11.png` → `grama.png`)
- Create: `public/assets/kenney/grama.png`

**Interfaces:**
- Consumes: as Tasks 1–3, `criarCarro`, `tocar`, `carregar` e `visualDe`.
- Produces: a cena `Corrida` com a mesma saída para o `LavaJato`; `tocar('volta')` = arpejo `[659, 880, 1047]`.

- [ ] **Step 1:** grama:
  - acrescentar a cópia de `PNG/Tiles/Grass/land_grass11.png` como `grama.png` no script;
  - copiar o arquivo e incluir `grama` na lista do `Carregar`;
  - `modelos.test.js` ou um teste novo garante que o arquivo existe.
- [ ] **Step 2:** reescrever `create()`, zerando todo o estado:
  - sorteia o circuito e cria `c = criarCircuito(...)`;
  - fundo: tileSprite `grama` cobrindo o mundo (bounds das amostras + 600);
  - pista pintada num Graphics fora da tela: círculos ao longo das amostras, primeiro as zebras (raio 196, alternando vermelho e branco a cada 3 amostras), depois o asfalto `0x616161` (raio 180);
  - o Graphics é copiado para RenderTextures de 1024×1024 px do mundo com resolução 0.5, depois destruído;
  - linha de chegada: quadriculado em `pontoNa(c, 0)`, girado para atravessar a pista.
- [ ] **Step 3:** carros:
  - Theo com `criarCarro(..., 0.8)` na largada, deslocado +110; adversários (`adv_i`) em `pos = i·120`, deslocados `[-110, 0, 110][faixa]`;
  - os sprites apontam para cima, então `rotation = angulo + π/2`;
  - `cameras.main.startFollow(theo, true, 0.12, 0.12)`.
- [ ] **Step 4:** `update(dt)`:
  - `maisProximo` com dica e depois `avancar` para o `percorrido`;
  - `novoAngulo` com o dedo em `pointer.worldX/worldY` quando `isDown`;
  - velocidade com grama, nitro e batida; anda na direção do ângulo;
  - adversários: `atualizarAdversario(a, percorrido, dt, 2L)`, posicionados com `pontoNa(c, a.pos)` mais o deslocamento lateral pela normal;
  - objetos: posicionados uma vez com `pontoNa` mais o deslocamento lateral, e colisão por distância < 70;
  - estrela pega fica invisível para sempre; nitro e obstáculo voltam a valer na 2ª volta.
- [ ] **Step 5:** HUD com `setScrollFactor(0)`:
  - medalha e estrelas como hoje;
  - "🏁 1/2" no centro do topo;
  - minimapa de ~180 px no canto inferior direito: a linha do circuito escalada, pontinhos dos carros e o do Theo maior;
  - ao passar `percorrido ≥ L`: "ÚLTIMA VOLTA!" por 1.5 s e `tocar('volta')`;
  - chegada em `percorrido ≥ 2L`, com o `chegar` atual.
- [ ] **Step 6:** `npm test` e `npm run build`. Esperado: verdes.
- [ ] **Step 7:** verificar no navegador (400×800), com 3 corridas seguidas:
  - cada circuito aparece;
  - dirigir com toques puxando para fora volta à pista;
  - sem dedo, completa sozinho;
  - estrelas, nitro e obstáculo funcionam;
  - termina no lava-jato.
- [ ] **Step 8: PORTÃO.** Pedir ao Tiago para testar no celular pelo servidor de dev da rede (`http://<ip>:5173`). Ajustar `GIRO_MAX`, o peso da assistência ou `FATOR_GRAMA` se ele achar difícil ou "solto" demais. Não avançar sem o OK dele.
- [ ] **Step 9:** commit `feat: corrida em circuito com direção pelo dedo`.

### Task 5: Publicação

- [ ] **Step 1:** `npm test` e `npm run build` verdes; revisão final da branch; merge `--ff-only` na `main`.
- [ ] **Step 2:** **pedir confirmação ao Tiago** e fazer o push. Conferir a action verde e a versão nova na tela inicial do site.
