# Garagem do Theo — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** jogo de corrida infantil (PWA, retrato) com garagem (carros, cores, peças, adesivos), corrida com adversários fáceis e nitro, lava-jato e presentes.

**Architecture:**
- Phaser 3, com uma cena por tela.
- Toda regra de jogo fica em módulos puros em `src/logica/`, testados com Vitest. As cenas só desenham e chamam esses módulos.
- O carro é desenhado em código por um único módulo (`src/carro.js`), usado pela garagem, pela corrida e pelo lava-jato.

**Tech Stack:** phaser@3.90.0, vite@6.3.5, vitest@3.2.4, JavaScript ES modules, Node 22.

**Spec:** `docs/spec.md`

## Decisão que muda a spec (aprovar junto com o plano)

- Os carros dos pacotes do Kenney já vêm coloridos, e o tint do Phaser não pinta bem sobre cor.
  - Por isso, **carros, peças, pista, cones, poças, nitro e estrelas são desenhados em código** (Phaser Graphics, formas arredondadas e cartunescas).
  - Os **adesivos são emojis**, que o Android desenha coloridos.
  - Os **sons são sintetizados com WebAudio**.
- Resultado: nenhum arquivo de imagem ou som de terceiros. O ícone da PWA é gerado de um SVG próprio com ImageMagick (`convert`).
- A linha "Desenhos e sons do Kenney" da spec passa a dizer isso.

## Global Constraints

- Canvas lógico de 720×1280, retrato, `Phaser.Scale.FIT` + `CENTER_BOTH`, fundo `#87CEEB`.
- Alvos de toque com no mínimo 80 px lógicos. Todo toque chama `tocar(...)` e faz uma animação de escala (pulinho de 1→1.15→1 em 120 ms).
- Sem texto obrigatório na interface. O texto "Garagem do Theo" aparece só na tela inicial.
- Sem derrota. Toda tela tem um botão visível para seguir em frente.
- Persistência só pelo `src/logica/salvar.js`, com a chave `garagem-do-theo:v1` no `localStorage`.
- Nenhuma dependência além das três do Tech Stack.
- `vite.config.js` com `base: './'`, para funcionar no subcaminho do GitHub Pages.

## Review Focus

1. **`localStorage` corrompido, vazio ou indisponível** (aba anônima, cota cheia): o jogo abre com o estado inicial e não quebra. Teste em `salvar.test.js`.
2. **Catálogo crescendo depois de um save antigo** (item novo que não existia no save): o item novo aparece como não ganho e os itens iniciais sempre estão em `ganhos`. Teste em `salvar.test.js`.
3. **Toques rápidos ou repetidos** (tocar duas vezes no 🏁, abrir o presente duas vezes): a cena não inicia duas vezes e o presente não é dado em dobro. Guarda `this.saindo` em cada cena. Teste do presente em `presentes.test.js` (`abrirPresente` é idempotente pelo id da corrida).
4. **Arrastar o adesivo para fora da tela ou soltar com 8 já colados:** o adesivo é removido ou ignorado, sem duplicar. Teste em `adesivos.test.js`.
5. **App reaberto sem internet depois de instalado:** o service worker serve todos os arquivos do build. Verificação manual na Task 8.

---

### Task 1: Projeto base, tela inicial, sons e PWA

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore` (`node_modules`, `dist`)
- Create: `src/main.js` (config do Phaser e lista de cenas)
- Create: `src/cenas/Inicio.js`
- Create: `src/sons.js`
- Create: `src/ui.js`
- Create: `public/manifest.webmanifest`, `public/sw.js`, `public/icone.svg`, `public/icone-192.png`, `public/icone-512.png`
- Create: `scripts/gerar-sw-lista.js`
- Test: `src/sons.test.js`

**Interfaces:**
- Produces:
  - `tocar(nome: 'toque'|'estrela'|'nitro'|'batida'|'agua'|'vitoria'|'presente'): void`. Nunca lança erro: sem AudioContext, não faz nada.
  - `botao(cena, x, y, emoji: string, aoTocar: () => void, tamanho = 120): Phaser.GameObjects.Text`. Cria o emoji interativo com o pulinho e `tocar('toque')`.
  - Chaves das cenas: `'Inicio'`, `'Garagem'`, `'Corrida'`, `'LavaJato'`, `'Presente'`.

- [ ] **Step 1:** `npm init -y`, `npm i phaser@3.90.0`, `npm i -D vite@6.3.5 vitest@3.2.4`. Scripts: `dev: vite --host`, `build: vite build && node scripts/gerar-sw-lista.js`, `test: vitest run`.
- [ ] **Step 2: teste que falha**, `src/sons.test.js`: `tocar('toque')` não lança erro quando `globalThis.AudioContext` é `undefined`.
- [ ] **Step 3:** `npm test`. Esperado: FAIL (módulo inexistente).
- [ ] **Step 4:** implementar `sons.js`.
  - O AudioContext é criado de forma preguiçosa no primeiro toque (exigência do navegador).
  - Cada nome é um tom curto de oscilador:
    - `toque`: 660 Hz, 60 ms;
    - `estrela`: 880→1320 Hz;
    - `nitro`: ruído com 1.5 s de rampa;
    - `batida`: 120 Hz, onda quadrada;
    - `agua`: ruído filtrado;
    - `vitoria` e `presente`: arpejo de 3 notas.
- [ ] **Step 5:** `npm test`. Esperado: PASS.
- [ ] **Step 6:** `main.js` com as Global Constraints e `Inicio.js`.
  - Título "Garagem do Theo" (fonte 72 px, contorno branco) e um carro bobo desenhado (pode ser um retângulo até a Task 3).
  - `botao` ▶️ com tamanho 200 → `scene.start('Garagem')`. Até a Task 3, essa cena é um stub que mostra 🏁.
- [ ] **Step 7:** PWA.
  - `manifest.webmanifest`: `name` "Garagem do Theo", `short_name` "Garagem", `display: fullscreen`, `orientation: portrait`, `start_url: ./`, `background_color`/`theme_color` `#87CEEB`, ícones 192 e 512.
  - `icone.svg`: carro simples sobre fundo azul. Os PNGs são gerados com `convert -background none icone.svg -resize 512x512 icone-512.png` (e 192).
  - `sw.js`: cache-first. No `install`, faz cache de `./`, `./index.html` e de todos os arquivos listados em `self.LISTA`.
  - `gerar-sw-lista.js`: depois do build, lê os arquivos de `dist/` e escreve `self.LISTA=[...]` mais um número de versão no topo de `dist/sw.js`.
  - `index.html` registra `./sw.js` somente em `location.protocol === 'https:' || location.hostname === 'localhost'`.
- [ ] **Step 8:** verificar.
  - `npm run build` sem erro, e `dist/sw.js` começa com `self.LISTA=`.
  - `npx vite preview` e abrir `http://localhost:4173`: o título aparece, ▶️ troca de cena e o som toca no toque.
- [ ] **Step 9:** commit `feat: projeto base, tela inicial, sons e PWA`.

### Task 2: Catálogo e salvamento

**Files:**
- Create: `src/logica/catalogo.js`, `src/logica/salvar.js`
- Test: `src/logica/salvar.test.js`

**Interfaces:**
- Produces:
  - `CATALOGO: Item[]`, onde `Item = { id: string, tipo: 'carro'|'cor'|'aerofolio'|'teto'|'rodas'|'escapamento'|'adesivo', valor: string|number, inicial: boolean }`. Para cor, `valor` é um número `0xRRGGBB`. Para adesivo, é o emoji. Para carro, é o modelo.
  - Conteúdo:
    - carros `carrinho` (inicial), `esportivo`, `caminhonete`, `onibus`, `policia`;
    - cores: 4 iniciais (vermelho `0xE53935`, azul `0x1E88E5`, amarelo `0xFDD835`, verde `0x43A047`) e mais 6 (laranja, roxo, rosa, preto, branco, dourado);
    - peças: `nenhum` inicial em cada tipo, mais 2 a 3 opções por tipo (aerofólio: `baixo`, `alto`, `duplo`; teto: `sirene`, `bagageiro`, `faixa`; rodas: aro `0xFFFFFF`, `0xFDD835`, `0xE53935`; escapamento: fogo `0xFF6D00` inicial, `0x2979FF`, `0x00E676`, `0xD500F9`);
    - adesivos: 4 iniciais (⭐ ❤️ 🔥 ⚡) e mais 12 (🦖 🚀 🐶 🐱 🌈 ⚽ 🦁 🐸 🍕 👑 🦈 🐉).
  - `ESTADO_INICIAL(): Estado`.
  - `Estado = { ganhos: string[], carroAtual: string, porCarro: { [carroId]: Visual }, estrelas: number, ultimaCorrida: number }`.
  - `Visual = { cor: number, aerofolio: string, teto: string, rodas: string, escapamento: string, adesivos: {emoji: string, x: number, y: number}[] }`. As posições `x` e `y` vão de -1 a 1, relativas ao carro.
  - `visualDe(estado, carroId): Visual`: devolve o visual salvo ou o padrão (vermelho, sem peças, fogo laranja, sem adesivos).
  - `carregar(storage = globalThis.localStorage): Estado` e `gravar(estado, storage = globalThis.localStorage): void`. `gravar` engole exceções.

- [ ] **Step 1: testes que falham**, com um storage falso `{getItem, setItem}`:
  - `carregar` com storage vazio → `ESTADO_INICIAL()`;
  - com `'{lixo'` → estado inicial;
  - com storage cujo `getItem` lança erro → estado inicial;
  - `ganhos` salvo sem um item inicial → o resultado o contém;
  - `carroAtual` que não está em `ganhos` → `'carrinho'`;
  - ida e volta: `gravar` e depois `carregar` devolve um estado igual;
  - `gravar` com `setItem` que lança erro não lança.
- [ ] **Step 2:** `npm test`. Esperado: FAIL.
- [ ] **Step 3:** implementar. `carregar` faz merge raso com `ESTADO_INICIAL()` e une `ganhos` aos ids iniciais.
- [ ] **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** commit `feat: catálogo de itens e salvamento`.

### Task 3: Desenho do carro e garagem (carros, cores, peças)

**Files:**
- Create: `src/carro.js`, `src/cenas/Garagem.js`
- Modify: `src/main.js` (registrar `Garagem`, removendo o stub)

**Interfaces:**
- Consumes: `CATALOGO`, `carregar`, `gravar`, `visualDe`, `botao`, `tocar`.
- Produces:
  - `criarCarro(cena, x, y, modelo: string, visual: Visual, escala = 1): Phaser.GameObjects.Container`. O carro é visto de cima, com a frente para cima e tamanho base de 120×200 px.
  - Ordem das camadas: rodas (4 retângulos arredondados pretos com aro na cor de `rodas`), carroceria na cor `visual.cor`, vidros azul-claro, peça de teto, aerofólio na traseira, adesivos (texto emoji de 40 px nas posições relativas) e por último o fogo do escapamento, invisível.
  - O container expõe `container.fogo` (Graphics na cor do escapamento) para a corrida ligar.
  - Modelos variam nas proporções: `esportivo` é mais baixo e largo, `caminhonete` tem caçamba, `onibus` tem 140×260 com janelas, `policia` vem com faixa branca fixa.

- [ ] **Step 1:** `carro.js`, sem teste automático (é só desenho).
- [ ] **Step 2:** `Garagem.js`.
  - Carro com escala 1.8 no centro (360, 520).
  - 4 abas embaixo (🚗 🎨 🔧 ⭐, de 120 px). Cada aba mostra uma faixa de opções com **apenas itens ganhos** em botões de 120 px.
  - Na aba 🔧, a peça é escolhida em duas etapas: primeiro o tipo (🪽 aerofólio, 🚨 teto, 🛞 rodas, 🔥 escapamento), depois a opção.
  - Cada escolha atualiza o `Visual` do carro atual, chama `gravar` e redesenha o carro com um pulinho.
  - 🏁 no canto superior direito (140 px) → `scene.start('Corrida')`. A Task 6 cria a cena; até lá, um stub.
- [ ] **Step 3:** verificar com `npm run dev` no navegador, em modo celular do DevTools (360×800).
  - Trocar a cor e uma peça e recarregar a página: as escolhas continuam.
  - Os botões têm pelo menos 80 px (inspecionar).
- [ ] **Step 4:** `npm test` (as suítes anteriores continuam verdes). Commit `feat: garagem com carros, cores e peças`.

### Task 4: Adesivos

**Files:**
- Create: `src/logica/adesivos.js`
- Modify: `src/cenas/Garagem.js` (aba ⭐)
- Test: `src/logica/adesivos.test.js`

**Interfaces:**
- Produces:
  - `MAX_ADESIVOS = 8`.
  - `colarAdesivo(visual, emoji, x, y): Visual`. Devolve um novo visual. Com 8 adesivos colados ou com `|x|>1` ou `|y|>1`, devolve o mesmo visual sem mudança.
  - `moverAdesivo(visual, indice, x, y): Visual`. Fora de [-1, 1], o adesivo é **removido**.

- [ ] **Step 1: testes que falham**:
  - colar o 1º adesivo → 1 colado;
  - colar o 9º → continua com 8;
  - colar em x=1.5 → nada muda;
  - mover para y=-1.2 → o adesivo é removido;
  - mover para dentro → a posição é atualizada;
  - a função não altera o visual recebido (imutável).
- [ ] **Step 2:** `npm test`. Esperado: FAIL. **Step 3:** implementar. **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** na aba ⭐, os emojis ganhos são arrastáveis (`setInteractive({draggable:true})`).
  - Ao soltar, converte o ponto para coordenadas relativas ao carro e chama `colarAdesivo`.
  - Adesivos já colados também são arrastáveis e chamam `moverAdesivo`.
  - Depois disso, `gravar`, redesenhar e `tocar('estrela')`.
- [ ] **Step 6:** verificar no navegador.
  - Colar, mover, tirar arrastando para fora e recarregar: as posições se mantêm.
  - Ao colar o 9º, nada acontece.
- [ ] **Step 7:** commit `feat: adesivos arrastáveis no carro`.

### Task 5: Lava-jato

**Files:**
- Create: `src/logica/sujeira.js`, `src/cenas/LavaJato.js`
- Test: `src/logica/sujeira.test.js`

**Interfaces:**
- Consumes: `criarCarro`, `visualDe`, `carregar`, `botao`, `tocar`.
- Produces:
  - `class GradeSujeira(largura, altura, celula = 20)`, com os métodos:
    - `limpar(x, y, raio): void`: marca como limpas as células cujo centro está a até `raio` de (x, y);
    - `fracaoLimpa(): number`, entre 0 e 1.
  - `LavaJato` recebe `data = { posicao: 1|2|3|4, estrelas: number, corridaId: number }` e repassa esses dados ao `Presente`.

- [ ] **Step 1: testes que falham**:
  - grade nova → `fracaoLimpa() === 0`;
  - `limpar` no centro com raio enorme → 1;
  - limpar só a metade esquerda → entre 0.4 e 0.6;
  - limpar fora da grade não lança erro.
- [ ] **Step 2:** `npm test`. Esperado: FAIL. **Step 3:** implementar. **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** `LavaJato.js`.
  - Carro grande no centro. Por cima, um `RenderTexture` com manchas marrons desenhadas aleatoriamente, só sobre a área do carro.
  - `pointermove` com o dedo pressionado chama `rt.erase` com um pincel circular de raio 45, `grade.limpar` e `tocar('agua')` com throttle de 150 ms. Bolhas são círculos brancos que sobem e somem.
  - Com `fracaoLimpa() >= 0.9`, limpa o resto, mostra brilhos ✨ e, depois de 1 s, vai para `scene.start('Presente', data)`.
  - Botão 🏁 pequeno (90 px) no canto pula direto para o `Presente`.
- [ ] **Step 6:** verificar no navegador, em modo celular. Esfregar até limpar leva o jogo ao Presente (ou ao stub), e o 🏁 também.
- [ ] **Step 7:** commit `feat: lava-jato`.

### Task 6: Corrida

**Files:**
- Create: `src/logica/adversarios.js`, `src/cenas/Corrida.js`
- Modify: `src/main.js`
- Test: `src/logica/adversarios.test.js`

**Interfaces:**
- Consumes: `criarCarro`, `visualDe`, `carregar`, `tocar`, `botao`.
- Produces:
  - `COMPRIMENTO_PISTA = 12000` (px) e `VELOCIDADE_BASE = 220` (px/s). A corrida dura cerca de 55 s.
  - `criarAdversarios(rng = Math.random): {faixa: 0|1|2, pos: number, ousado: boolean}[]`. São 3 adversários, com `pos` inicial 0, 120 e 240 à frente do Theo. Com probabilidade 0.15, **um** deles recebe `ousado: true`.
  - `velocidadeAlvo(adv, posTheo: number): number`. Valores fixos, nesta ordem:
    1. `gap = adv.pos - posTheo`;
    2. com `gap > 0`, `v = VELOCIDADE_BASE * (1 - 0.35 * min(gap / 400, 1))`; com `gap < -500`, `v = VELOCIDADE_BASE * 1.2`; nos demais casos, `v = VELOCIDADE_BASE * 0.92`;
    3. com `posTheo / COMPRIMENTO_PISTA > 0.85` e `!adv.ousado`, `v *= 0.75`.
  - `simularCorrida(rng): number`. Simula o Theo a `VELOCIDADE_BASE` constante, com passo de 1/30 s, e os adversários aproximando a velocidade atual da `velocidadeAlvo` em 10% por passo. Devolve a posição final do Theo (1 a 4). Só é usada nos testes.
  - `Corrida` termina com `scene.start('LavaJato', { posicao, estrelas, corridaId: Date.now() })`.

- [ ] **Step 1: testes que falham**:
  - `criarAdversarios(() => 0.99)` → nenhum ousado;
  - `criarAdversarios(() => 0.01)` → exatamente 1 ousado;
  - um adversário 300 à frente tem velocidade alvo menor que `VELOCIDADE_BASE`;
  - um adversário 600 atrás tem velocidade alvo maior;
  - na reta final, um não ousado é mais lento que um ousado com o mesmo gap;
  - em 500 simulações com rng semeado (LCG simples dentro do teste), o Theo nunca chega em 3º ou 4º, e chega em 1º em 75% a 95% das corridas.
- [ ] **Step 2:** `npm test`. Esperado: FAIL. **Step 3:** implementar. **Step 4:** `npm test`. Esperado: PASS. Se a taxa de 1º lugar sair da faixa, ajuste só a probabilidade de `ousado` e registre o novo valor na interface acima.
- [ ] **Step 5:** `Corrida.js`.
  - Pista cinza com 3 faixas e listras brancas que rolam, com grama nas laterais.
  - O Theo fica em y=1000. Arrastar o dedo horizontalmente define a faixa pela coluna do toque, e o carro desliza até ela em 150 ms.
  - Velocidade do Theo:
    - `VELOCIDADE_BASE`;
    - ×1.8 por 3 s ao pegar o nitro 🔥, com `container.fogo` visível e `tocar('nitro')`;
    - ×0.5 por 1 s ao bater em cone 🔺 ou poça, com o carro girando 360° e `tocar('batida')`.
  - Objetos gerados por posição na pista, a cada 600 px, sorteando uma faixa e um tipo:
    - estrela ⭐: 50%;
    - cone ou poça: 30%;
    - nitro: 20%, com no mínimo 1500 px entre nitros.
  - Nunca há obstáculo nos primeiros 800 px.
  - Os adversários são carros de cores fixas, sem peças, desenhados em `y = 1000 - (adv.pos - posTheo)`. Ficam fora da tela quando estão longe. Não colidem com o Theo.
  - Topo da tela: 🥇🥈🥉 em 120 px com a posição atual e um contador de estrelas ⭐.
  - Barra de progresso com um carrinho na lateral.
  - Linha de chegada quadriculada. Ao cruzar:
    - confete com partículas ou emojis;
    - `tocar('vitoria')`;
    - 1º lugar: confete em dobro e 🏆 gigante;
    - depois de 2 s, o `LavaJato` começa com os dados.
- [ ] **Step 6:** verificar no navegador, em modo celular.
  - Jogar 3 corridas sem tocar na tela: ele termina sempre em 1º ou 2º.
  - Nitro, batida e estrelas se comportam como descrito.
  - 60 fps estáveis na aba Performance (CPU 4× throttling).
- [ ] **Step 7:** commit `feat: corrida com adversários, nitro, estrelas e obstáculos`.

### Task 7: Presentes, barra de estrelas e ciclo completo

**Files:**
- Create: `src/logica/presentes.js`, `src/cenas/Presente.js`
- Modify: `src/main.js`, `src/cenas/Garagem.js` (barra de estrelas no topo)
- Test: `src/logica/presentes.test.js`

**Interfaces:**
- Consumes: `CATALOGO`, `carregar`, `gravar`, `criarCarro`, `botao`, `tocar`.
- Produces:
  - `ESTRELAS_POR_BARRA = 20`.
  - `sortearPresente(ganhos: string[], rng): Item | null`. Sorteia entre os itens não ganhos:
    - se houver carro não ganho e `rng() < 0.25`, sorteia um carro;
    - senão, sorteia um não-carro;
    - sem não-carros, sorteia um carro;
    - sem nada a ganhar, devolve `null`.
  - `abrirPresente(estado, corridaId, estrelasDaCorrida, rng): { estado: Estado, itens: Item[] }`.
    - Se `corridaId <= estado.ultimaCorrida`, devolve o estado sem mudança e `itens: []`. Isso torna a função idempotente.
    - Senão, dá 1 presente garantido, soma as estrelas e dá 1 presente extra a cada barra completa (o resto fica guardado).
    - Adiciona os ids a `ganhos` e grava `ultimaCorrida = corridaId`.

- [ ] **Step 1: testes que falham**:
  - com tudo ganho → `null`;
  - com 1 carro e 1 cor faltando, `rng = () => 0.1` → carro, e `rng = () => 0.9` → cor;
  - só carros faltando e `rng = () => 0.9` → carro;
  - `abrirPresente` com 0 estrelas → 1 item;
  - com `estado.estrelas = 15` e 7 na corrida → 2 itens e `estrelas === 2`;
  - repetir o mesmo `corridaId` → `itens: []`;
  - o item ganho entra em `ganhos`.
- [ ] **Step 2:** `npm test`. Esperado: FAIL. **Step 3:** implementar. **Step 4:** `npm test`. Esperado: PASS.
- [ ] **Step 5:** `Presente.js`.
  - Caixa 🎁 gigante que balança. Ao tocar, chama `abrirPresente`, grava, toca `tocar('presente')` e abre com confete, mostrando o item:
    - carro: `criarCarro`;
    - cor: uma bolinha;
    - peça: o carro atual com a peça;
    - adesivo: o emoji grande.
  - Com mais de um item, ele toca de novo para o próximo.
  - Com `itens` vazio (tudo ganho), só confete.
  - Depois, ✅ (160 px) leva à `Garagem`. Usar a guarda `this.saindo`.
  - Na Garagem: barra de estrelas no topo (`estado.estrelas / ESTRELAS_POR_BARRA`) e um ponto pulsante na aba que tem item novo (ids em `ganhos` que ainda não foram vistos; guardar `vistos` no `Estado` com padrão `[]`).
- [ ] **Step 6:** verificar no navegador o ciclo completo Início → Garagem → Corrida → Lava-jato → Presente → Garagem, 3 vezes.
  - Os itens novos aparecem nas abas.
  - Tocar duas vezes rápido na caixa não dá presente duplicado.
- [ ] **Step 7:** commit `feat: presentes, barra de estrelas e ciclo completo`.

### Task 8: Publicação no GitHub Pages e instalação

**⚠️ Confirmar com o Tiago antes de começar.** Esta task cria um repositório público na conta dele. O `gh` não está instalado, então ele cria o repositório pela web ou instala o `gh`.

**Files:**
- Create: `.github/workflows/pages.yml`, `README.md`

- [ ] **Step 1:** `README.md` com:
  - como rodar (`npm i`, `npm run dev`; abrir no celular pelo IP mostrado);
  - como instalar no celular;
  - créditos: nenhum asset de terceiros.
- [ ] **Step 2:** workflow do Pages com `actions/checkout@v4`, `actions/setup-node@v4` (node 22), `npm ci`, `npm test`, `npm run build`, `actions/upload-pages-artifact@v3` (`path: dist`) e `actions/deploy-pages@v4`. Dispara em push na `main`.
- [ ] **Step 3:** o Tiago cria o repositório público `garagem-do-theo` e ativa Settings → Pages → Source: GitHub Actions. Depois, `git remote add origin ...`, `git branch -M main` e `git push -u origin main`.
- [ ] **Step 4:** verificar.
  - A action fica verde, e `https://<usuario>.github.io/garagem-do-theo/` abre o jogo.
  - No Chrome do Android: menu → Adicionar à tela inicial. Abre em tela cheia e em retrato.
  - Ativar o modo avião e abrir pelo ícone: o jogo funciona.
- [ ] **Step 5:** commit `ci: publicação no GitHub Pages`.
