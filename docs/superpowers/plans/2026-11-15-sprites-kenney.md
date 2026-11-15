# Sprites do Kenney — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trocar o desenho em código dos carros e do cenário da corrida por sprites do Kenney *Racing Pack*, mantendo a pintura nas 10 cores, as peças e o resto do jogo.

**Architecture:**
- Um script prepara os PNGs uma vez: camadas de pintura e cópia dos objetos. O resultado fica versionado em `public/assets/kenney/`.
- Uma cena nova, `Carregar`, faz o preload. `src/carro.js` mantém a mesma interface `criarCarro(...)`, mas monta o carro com sprites.
- A geração dos objetos da pista sai da cena e vira lógica pura testável (`src/logica/pista.js`).

**Tech Stack:** Phaser 3.90 (sprites com `setTint`), ImageMagick 6 (`convert`, `montage`), Vitest.

**Spec:** `docs/spec.md`, seção "Sprites do Kenney"

## Global Constraints

- Fonte dos sprites: Kenney *Racing Pack*, CC0. Entram só os PNGs usados e a `License.txt` do pacote, em `public/assets/kenney/`.
- Mapa dos modelos: carrinho = `2`, esportivo = `3`, caminhonete = `4`, viatura = `5`. O ônibus continua desenhado em código.
- A interface `criarCarro(cena, x, y, modelo, visual, escala)` e as propriedades `container.fogo`, `container.dims` e `container.adesivos` não mudam. Garagem, Corrida, LavaJato e Presente não precisam saber de sprites.
- `container.dims` continua perto das medidas atuais (~120×200 na escala 1), para não mexer em layout.
- Nenhuma dependência npm nova. ImageMagick só no script de preparo, que roda na máquina do dev; o CI usa os PNGs já versionados.
- Arquivos novos no `dist` entram no cache offline sozinhos (`gerar-sw-lista.js` lista `dist/` inteiro).

## Review Focus

1. **Sprite não carregado** (arquivo faltando ou erro de rede na primeira visita): o carro não pode sumir nem travar a cena. Se a textura não existir, o carro cai no desenho em código atual. Teste em `modelos.test.js`: todo modelo do catálogo tem entrada e o arquivo existe em `public/assets/kenney/`.
2. **Save antigo com carro de modelo novo ou desconhecido:** cai no carrinho (comportamento atual de `porId(...)?.valor ?? 'carrinho'`).
3. **Pintura escura (preto) ou clara (branco):** o tint sobre o cinza deve continuar legível. Isso é verificado na prévia da Task 1.
4. **Cache offline depois da atualização:** os PNGs novos entram na `LISTA` do service worker. Verificar `dist/sw.js` na Task 2.
5. **Densidade da pista:** os objetos novos (pneus) não podem fechar as 3 faixas na mesma altura. A garantia é que há no máximo 1 objeto por linha (600 px). Teste em `pista.test.js`.

---

### Task 1: Preparar os sprites e aprovar a prévia (premissa de risco)

**Files:**
- Create: `scripts/preparar-sprites.sh`
- Create: `public/assets/kenney/` (PNGs gerados + `License.txt`)

**Interfaces:**
- Produces, em `public/assets/kenney/`:
  - `corpo_N.png` e `detalhe_N.png` para N em {2, 3, 4, 5};
  - `adv_1.png`, `adv_2.png`, `adv_3.png`, copiados de `car_blue_1`, `car_green_3`, `car_yellow_5`;
  - os objetos `cone.png` (cone_straight), `oleo.png` (oil), `pneus.png` (tires_red), `seta.png` (arrow_yellow), `arvore_g.png` (tree_large), `arvore_p.png` (tree_small), `pedra_1..3.png` (rock1..3), `tenda_v.png` (tent_red), `tenda_a.png` (tent_blue), `arquibancada.png` (tribune_full);
  - `License.txt`.
- Uso: `scripts/preparar-sprites.sh <pasta do zip extraído>`.

- [ ] **Step 1:** escrever o script. Para cada N, a partir de `PNG/Cars/car_red_N.png`:
  - `detalhe_N`: só os pixels quase brancos (`-fuzz 18% -fill none +opaque white`);
  - `corpo_N`: a imagem original sem esses pixels, convertida para cinza e com o nível ajustado para o tom dominante da carroceria virar ~`#E8E8E8` (o contorno continua escuro). Ajustar `-level` olhando a prévia.
  - Depois, copia os objetos e a `License.txt` com os nomes acima.
- [ ] **Step 2:** rodar com a pasta extraída do zip (no scratchpad). Esperado: 24 PNGs + `License.txt` em `public/assets/kenney/`.
- [ ] **Step 3:** gerar a prévia, fora do repositório, com `montage`: 4 modelos × 10 cores do `CATALOGO`. Cada célula é `corpo_N` com multiply da cor (emula o `setTint`) e `detalhe_N` por cima.
- [ ] **Step 4: PORTÃO.** Mostrar a prévia ao Tiago e esperar a aprovação. Se for reprovada, ajustar o `-level` ou a extração do branco no Step 1 e repetir. Não avançar sem aprovação.
- [ ] **Step 5:** commit `feat: sprites do Kenney preparados para pintura`.

### Task 2: Carro com sprites e cena de carregamento

**Files:**
- Create: `src/logica/modelos.js`, `src/cenas/Carregar.js`
- Modify: `src/carro.js`, `src/main.js` (Carregar como primeira cena)
- Test: `src/logica/modelos.test.js`

**Interfaces:**
- Consumes: os arquivos da Task 1.
- Produces:
  - `MODELOS: { [modelo]: { sprite: number | null, w: number, h: number, raio: number } }`. `sprite` é o N do Kenney, ou `null` para o ônibus. `w` e `h` são as medidas na escala 1, e substituem o mapa de medidas de `carro.js`.
  - `medidas(modelo)` passa a ler de `modelos.js`, com o mesmo retorno de antes.
  - Texturas `corpo_N`, `detalhe_N`, `adv_1..3` e os objetos com o nome do arquivo sem extensão.

- [ ] **Step 1: testes que falham:**
  - todo carro do `CATALOGO` tem entrada em `MODELOS`;
  - todo `sprite` não nulo tem `corpo_N.png` e `detalhe_N.png` em `public/assets/kenney/` (`fs.existsSync`);
  - `w` e `h` de cada modelo com sprite são o tamanho do PNG × um fator único, ficando entre 100–140 de largura (ler o tamanho com a leitura do cabeçalho PNG, bytes 16–23).
- [ ] **Step 2:** `npm test`. Esperado: FAIL.
- [ ] **Step 3:** implementar `modelos.js`. Fator único = 120 / 70 ≈ 1.7. O ônibus mantém 140×260.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** `Carregar.js` faz `this.load.image(...)` de tudo e depois `scene.start('Inicio')`, sem tela de progresso: o carregamento é local e rápido.
  - Em `carro.js`, com `sprite` e `cena.textures.exists('corpo_N')`: rodas (como hoje), `image corpo_N` com `setTint(visual.cor)` e `setDisplaySize(w, h)`, `image detalhe_N` por cima, a faixa da viatura e as peças/adesivos/fogo como hoje.
  - Sem textura (ou no ônibus): o desenho atual em código. A borda do ônibus passa a 8 px com alpha 0.45, e ganha um brilho branco no canto superior esquerdo.
- [ ] **Step 6:** verificar no navegador (400×800):
  - a garagem com os 5 carros;
  - cada carro nas cores vermelho, preto e branco;
  - aerofólio e sirene encaixados no esportivo e na viatura;
  - `npm run build` e `dist/sw.js` contendo `./assets/kenney/corpo_2.png`.
- [ ] **Step 7:** commit `feat: carros com sprites do Kenney`.

### Task 3: Pista com objetos e cenário do Kenney

**Files:**
- Create: `src/logica/pista.js`
- Modify: `src/cenas/Corrida.js`
- Test: `src/logica/pista.test.js`

**Interfaces:**
- Consumes: `COMPRIMENTO_PISTA` e as texturas da Task 2.
- Produces:
  - `gerarObjetos(rng): {pos, faixa: 0|1|2, tipo: 'estrela'|'cone'|'oleo'|'pneus'|'nitro'}[]`, com as regras atuais:
    - um objeto a cada 600 px, de 600 até `COMPRIMENTO_PISTA - 300`;
    - estrela 50%;
    - obstáculo 30%, dividido em partes iguais entre cone, óleo e pneus, e nunca antes de 800 px;
    - nitro 20%, com no mínimo 1500 px entre nitros (senão vira estrela).
  - `gerarCenario(rng): {pos, lado: -1|1, tipo: 'arvore_g'|'arvore_p'|'pedra_1'|'pedra_2'|'pedra_3'|'tenda_v'|'tenda_a'|'arquibancada'}[]`: um item a cada 250 px, alternando o lado e sorteando o tipo; a arquibancada só a cada ≥ 2000 px.

- [ ] **Step 1: testes que falham** (com o `lcg` dos testes de adversários):
  - em 50 pistas, nenhum obstáculo com `pos < 800`;
  - distância entre nitros ≥ 1500;
  - no máximo 1 objeto por `pos`;
  - só os 5 tipos permitidos;
  - aparecem os 3 tipos de obstáculo;
  - no cenário, os lados alternam e a distância entre arquibancadas é ≥ 2000.
- [ ] **Step 2:** `npm test`. Esperado: FAIL. **Step 3:** implementar. **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** `Corrida.js` usa `gerarObjetos(Math.random)` e cria os sprites:
  - `cone`, `oleo` e `pneus` em ~90 px;
  - a `seta` fica no chão, apontando para cima e pulsando, no lugar do 🔥;
  - estrela continua emoji.
  - A colisão continua por distância, e `oleo` e `pneus` têm o mesmo efeito do cone.
  - O cenário (`gerarCenario`) fica na grama: x ≈ 60 (lado −1) ou 660 (lado 1), com profundidade abaixo dos carros, rolando como os objetos.
  - Os adversários usam `image adv_1..3` no lugar do `criarCarro`.
- [ ] **Step 6:** verificar no navegador, com 1 corrida inteira:
  - obstáculos, setas e cenário visíveis;
  - batida no óleo e nos pneus gira o carro;
  - a seta dá nitro;
  - termina no lava-jato.
- [ ] **Step 7:** commit `feat: pista com objetos e cenário do Kenney`.

### Task 4: Publicação

- [ ] **Step 1:** `npm test` e `npm run build` verdes. Merge `--ff-only` na `main`.
- [ ] **Step 2:** **pedir confirmação ao Tiago** e fazer o push. Conferir a action verde e a versão nova na tela inicial do site.
