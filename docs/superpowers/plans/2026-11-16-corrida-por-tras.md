# Corrida vista por trás (pseudo-3D) — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar a corrida vista de cima por uma estrada em perspectiva com o carro do Theo visto por trás, mantendo os circuitos, as voltas, os adversários elásticos, os objetos e o placar.

**Architecture:**
- **Pseudo-3D clássico:** a estrada é uma lista de segmentos, cada um com uma curvatura. A cada quadro, os ~160 segmentos à frente são projetados e pintados num Graphics, de perto para longe, com recorte vertical.
- **Origem da curvatura:** vem da linha central do circuito (`pontoNa`). O progresso continua em px de circuito, então `adversarios.js` e `gerarObjetos` não mudam.
- **Lógica pura nova em `src/logica/estrada.js`:** curvatura, projeção, movimento lateral e colisão.
- **Desenho do carro por trás em `src/carroTras.js`.**
- **Arte:** tudo é desenhado em código. Os PNGs do Kenney usados só na corrida vista de cima saem.

**Tech Stack:** Phaser 3.90 (Graphics, Text), Vitest.

**Spec:** `docs/spec.md`, seção "Corrida"

## Global Constraints

- 2 voltas, de 50 a 60 s, com `VELOCIDADE_BASE = 330` px de circuito por segundo.
- Sensação de velocidade: ~60% do protótipo, que andava 45 segmentos/s.
  - `PX_POR_SEGMENTO = 12` px de circuito por segmento de estrada, o que dá ~27 segmentos/s.
  - Esse valor é a única constante de ajuste.
- Direção: segurar na metade esquerda vira para a esquerda, na direita vira para a direita.
  - A curva empurra para fora; sem o dedo, o carro volta para o meio.
  - Posição lateral `x`: 0 é o centro, ±1 é a borda do asfalto, e o limite é ±1.6.
  - Grama (`|x| > 1`) a 60%.
- Nitro 1.8× por 3 s; obstáculo 0.5× por 1 s, com o carro balançando. A estrela não volta na 2ª volta.
- Adversários: azul, verde e amarelo, com `x` em `[-0.5, 0, 0.5]` por faixa. Objetos usam `x` em `[-0.5, 0, 0.5]` pela `faixa`.
- A corrida termina em `scene.start('Presente', { posicao, estrelas, corridaId: Date.now() })`.
- Nenhuma dependência nova. Garagem, LavaJato e Presente não mudam.

## Review Focus

1. **Sem o dedo, o carro não pode ir parar na grama nas curvas:** a volta ao meio vence o empurrão da curva mais forte. Teste em `estrada.test.js`.
2. **Passagem pela largada** (segmento `n-1` para o `0`): a estrada e os objetos continuam sem salto. Os índices são calculados em módulo, e a distância até um objeto é medida "para frente" em módulo L. Teste em `estrada.test.js` (`aFrente`).
3. **Objeto atrás do carro ou longe:** não colide nem é desenhado. Teste de `colide`.
4. **Cena reaproveitada:** Graphics, textos do Theo e estado zerados em `create()`. Verificação com 3 corridas seguidas.
5. **Desempenho:** 160 segmentos e ~30 enfeites por quadro, num único Graphics, sem criar objetos por quadro. Verificar no celular, no portão.

---

### Task 1: Estrada (lógica pura)

**Files:**
- Create: `src/logica/estrada.js`, `src/logica/estrada.test.js`
- Modify: `src/logica/pista.js` (`gerarCenario` vira `gerarEnfeites`), `src/logica/pista.test.js`, `src/logica/circuito.js` (sai `maisProximo` e `avancar`, sem uso), `src/logica/circuito.test.js`
- Delete: `src/logica/direcao.js`, `src/logica/direcao.test.js`

**Interfaces:**
- Consumes: `criarCircuito`, `pontoNa`, `CIRCUITOS`; `VELOCIDADE_BASE`.
- Produces:
  - `PX_POR_SEGMENTO = 12`, `LIMITE_LATERAL = 1.6`, `FATOR_GRAMA = 0.6`.
  - `curvaturas(c) → number[]`: um valor por segmento (`floor(L / PX_POR_SEGMENTO)`), igual a `difAngulo` entre o início e o fim do segmento vezes `K_CURVA`. Positivo vira para a direita.
  - `moverLateral({ x, dedo, curva, pct, dt }) → x`:
    - `dedo` ∈ {-1, 0, 1}; `pct` = velocidade / `VELOCIDADE_BASE`;
    - `x += dedo · VIRAR · pct · dt`;
    - `x -= curva · EMPURRAO · pct · dt`;
    - sem dedo, aproxima de 0 com taxa `VOLTA`;
    - resultado limitado a ±`LIMITE_LATERAL`.
  - `naGrama(x) → boolean` (`|x| > 1`).
  - `aFrente(dObjeto, dTheo, L) → number`: distância para frente, em [0, L).
  - `colide(objX, dist, x) → boolean`: `dist < PX_POR_SEGMENTO * 2` e `|objX - x| < 0.35`.
  - `gerarEnfeites(rng, L) → { d, x, tipo }[]`:
    - um a cada 150 px, alternando os lados, com `|x|` entre 1.5 e 2.6;
    - tipos `arvore`, `pinheiro`, `pedra`, `tenda`;
    - `arquibancada` em `d = L - 150` e `d = 150`, do lado `x = -2`.

- [ ] **Step 1: testes que falham:**
  - para os 3 circuitos, `max |curvatura|` entre 2.5 e 4, e a soma das curvaturas / `K_CURVA` ≈ 2π (±0.05): o circuito fecha no sentido horário;
  - sem o dedo, simulando 2 voltas inteiras com `dt = 1/30`: `max |x| < 0.9`;
  - dedo sempre para fora da curva: `|x|` nunca passa de `LIMITE_LATERAL`;
  - dedo para a direita por 1 s numa reta faz `x` passar de 0.8;
  - `aFrente(30, L - 20, L) === 50`, `aFrente(10, 20, L) === L - 10`;
  - `colide`: verdadeiro com `dist = 5` e `|Δx| = 0.2`; falso com `dist = L - 5` (objeto atrás) e com `|Δx| = 0.5`;
  - `gerarEnfeites`: lados alternam, `|x| ≥ 1.5`, exatamente 2 arquibancadas.
- [ ] **Step 2:** `npx vitest run`. Esperado: FAIL.
- [ ] **Step 3:** implementar. Calibrar `K_CURVA`, `VIRAR`, `EMPURRAO` e `VOLTA` até os testes passarem. Remover `direcao.*`, `maisProximo` e `avancar`, junto com os seus testes.
- [ ] **Step 4:** `npx vitest run`. Esperado: PASS. O build pode quebrar até a Task 2 (`Corrida.js` antiga).
- [ ] **Step 5:** commit `feat: estrada pseudo-3D (lógica)`.

### Task 2: Carro por trás e cena da corrida

**Files:**
- Create: `src/carroTras.js`
- Modify: `src/cenas/Corrida.js` (reescrita)

**Interfaces:**
- Consumes: Task 1; `porId`, `carregar`, `visualDe`, `criarAdversarios`, `atualizarAdversario`, `gerarObjetos`, `tocar`.
- Produces:
  - `desenharCarroTras(g, x, y, w, { modelo, cor, aerofolio, teto, rodas })`: desenha no Graphics `g`, com o ponto (x, y) no chão, centro. Formato por modelo:
    - carrinho: base;
    - esportivo: 80% da altura e 110% da largura;
    - caminhonete: tampa da caçamba marrom;
    - ônibus: alto, com vidro grande;
    - viatura: sirene se `teto` for `nenhum`.
    - Peças: aerofólio (`baixo`, `alto`, `duplo`), teto (`sirene`, `bagageiro`, `faixa`), aro das rodas na cor de `rodas`.
  - `ADESIVOS_TRAS(w) → { x, y }[]`: 3 posições na traseira, relativas a (x, y).

- [ ] **Step 1:** `carroTras.js` a partir do desenho do protótipo. A cor do visual vem como número (`0xRRGGBB`), que é o que o Graphics usa.
- [ ] **Step 2:** `Corrida.create()` zera tudo:
  - sorteia o circuito, calcula `curvaturas` e `L`;
  - cria `gerarObjetos(Math.random, L)` com `voltaPega`/`pego` e `gerarEnfeites`;
  - cria os adversários;
  - cria um Graphics de fundo (céu, morros, grama) e um Graphics para estrada e enfeites;
  - carro do Theo: Container fixo em (360, 1140), com um Graphics desenhado uma vez (`w = 300`), até 3 adesivos (`visual.adesivos.slice(0, 3)`) e o fogo.
- [ ] **Step 3:** `update`:
  - `pct` com grama, nitro e batida; `percorrido += 330 · pct · dt`;
  - `x = moverLateral(...)` com `dedo` = metade da tela do `activePointer` quando `isDown`;
  - estrada pintada de perto para longe:
    - segmento `i = (base + n) mod nSeg`;
    - acúmulo de `dx` pela curvatura;
    - grama listrada, zebra, asfalto, faixas;
    - quadriculado nos segmentos da largada;
  - morros deslocados pela soma das curvaturas;
  - de longe para perto: enfeites, objetos (estrela e 🔥 como Text de um pool, cone, óleo e pneus desenhados) e adversários (`desenharCarroTras`);
  - colisões com `aFrente` e `colide`, com as mesmas regras de volta da versão atual;
  - batida: o Container do Theo balança (tween de ângulo ±15°).
- [ ] **Step 4:** HUD fixo, como hoje (medalha, ⭐, 🏁 1/2, minimapa com `pontoNa`). "ÚLTIMA VOLTA!" e `chegar` iguais, indo para o `Presente`.
- [ ] **Step 5:** `npx vitest run` e `npm run build` verdes.
- [ ] **Step 6:** verificar no navegador (400×800):
  - 3 corridas seguidas até o presente, sem erros;
  - prints dos 5 modelos (trocar `carroAtual` no localStorage) para conferir o formato e as peças.
- [ ] **Step 7:** commit `feat: corrida vista por trás do carro`.

### Task 3: Limpeza dos sprites que saíram

**Files:**
- Modify: `src/cenas/Carregar.js` (SPRITES só com `corpo_N` e `detalhe_N`), `scripts/preparar-sprites.sh` (só os carros e a licença)
- Delete: em `public/assets/kenney/`, `adv_*`, `cone`, `oleo`, `pneus`, `seta`, `arvore_*`, `pedra_*`, `tenda_*`, `arquibancada` e `grama` (`.png`)

- [ ] **Step 1:** remover. Antes, conferir com `grep -rn` que nenhum arquivo de `src` usa essas chaves.
- [ ] **Step 2:** `npx vitest run` (o teste de carregamento perde o `toContain('grama')`) e `npm run build` verdes.
- [ ] **Step 3:** commit `chore: remove sprites da corrida vista de cima`.

### Task 4: Portão e publicação

- [ ] **Step 1: PORTÃO.** O Tiago testa no celular (`http://<ip>:5173`): velocidade, curvas, direção e desempenho. Ajustar `PX_POR_SEGMENTO` ou as taxas da Task 1 se ele pedir.
- [ ] **Step 2:** revisão final da branch; merge `--ff-only`; push com o OK dele. Conferir a action e a versão no site.
