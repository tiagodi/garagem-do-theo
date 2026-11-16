# Garagem do Theo — Spec

Jogo de corrida para o Theo (4 anos), no celular Android, como app web instalável (PWA).

## Objetivo e critério de sucesso

- O Theo joga sozinho, sem ajuda de um adulto, e quer voltar a jogar.
- Uso pessoal: sem loja de apps, anúncios, compras, login ou internet depois de instalado.

## Regras de experiência (valem para todas as telas)

- Sem derrota e sem "game over". Qualquer resultado dá presente.
- Sem texto obrigatório: só ícones, cores e sons. O nome "Garagem do Theo" aparece só na tela inicial.
- Alvos de toque com no mínimo 80 px. Todo toque responde com som e animação.
- Tela sempre em pé (retrato), em tela cheia.
- Nenhuma tela prende a criança: sempre há um botão visível para seguir em frente.

## Ciclo do jogo

Início → Garagem → Corrida → Lava-jato → Presente → Garagem

1. **Início**: título e um botão ▶️ gigante.
2. **Garagem**: carro grande no centro, abas 🚗 🎨 🔧 ⭐ embaixo, botão 🏁 para correr.
3. **Corrida**: cerca de 60 s.
4. **Lava-jato**: o carro chega com lama, e ele esfrega com o dedo até limpar. Um botão 🏁 pequeno pula a lavagem.
5. **Presente**: uma caixa que ele toca para abrir, com o item novo. Volta para a garagem.

## Corrida

Circuito fechado visto de cima. O Theo dirige com o dedo.

- **Circuitos:** três laços fechados (*oval*, *feijão* e *serpente*), um sorteado por corrida.
  - Cada circuito é uma lista de ~15 pontos de controle. O jogo suaviza essa lista numa linha central.
  - A largura do asfalto é ~360 px, com zebras vermelho/branco nas bordas. O fundo é a grama do Kenney.
  - A linha central serve para tudo: desenho da pista, adversários, assistência, voltas e posição dos objetos.
- **Corrida:** 2 voltas, com duração total de 50 a 60 s.
  - O Theo e 3 adversários largam lado a lado na linha de chegada.
  - No início da 2ª volta aparece "ÚLTIMA VOLTA!" com som.
- **Direção:**
  - O carro acelera sozinho, na `VELOCIDADE_BASE` atual.
  - Com o dedo na tela, o carro vira na direção do ponto tocado (no mundo), com limite de giro por segundo.
  - Sem o dedo, segue a pista sozinho.
  - **Assistência invisível:** o ângulo desejado mistura "para o dedo" com "para a frente na pista". O peso da pista cresce com o afastamento do centro: perto do centro, quem manda é o dedo; perto da borda, é a pista. Resultado: o carro pode sair um pouco, mas sempre volta.
  - **Grama:** fora do asfalto, a velocidade cai para 60%. Não há derrota, parede nem batida por sair da pista.
- **Câmera:** segue o carro. O mapa não gira: o norte fica sempre para cima.
- **Adversários:**
  - Seguem a linha central, cada um deslocado para um lado.
  - O ajuste elástico atual continua, medido pela distância percorrida na linha (2 voltas = comprimento total):
    - na frente do Theo, desaceleram;
    - muito atrás, alcançam;
    - nos últimos 15% da corrida, freiam.
  - Meta: o Theo chega em 1º em cerca de 85% das corridas. Nas outras, chega em 2º.
  - Os adversários não batem no Theo. Batida só acontece com obstáculos.
- **Objetos na pista** (sorteados uma vez por corrida, nas mesmas posições nas duas voltas):
  - um objeto a cada ~600 px de linha, deslocado à esquerda, no centro ou à direita;
  - 50% estrela ⭐, 30% obstáculo (cone, óleo ou pneus), 20% nitro (seta amarela);
  - nenhum obstáculo nos primeiros 800 px; nitros a pelo menos 1500 px um do outro;
  - estrela pega some e não volta na 2ª volta;
  - nitro: 1.8× por 3 s, com fogo no escapamento;
  - obstáculo: 0.5× por 1 s, com o carro rodando.
- **Cenário:** árvores, pedras e tendas na grama, fora do asfalto. Arquibancada com torcida ao lado da reta de largada.
- **Placar na tela:**
  - medalha da posição 🥇🥈🥉;
  - estrelas;
  - volta "1/2" ou "2/2" com 🏁;
  - minimapa no canto com a forma do circuito e um pontinho por carro (o do Theo maior).
- **Chegada:** linha quadriculada atravessada na pista. Troféu no 1º lugar ou medalha nos outros, confete e lava-jato, como antes.

## Garagem

- **Carros**: 1 carro inicial, e os outros são liberados como presente.
- **Cores**: o tint do Phaser é aplicado sobre um carro desenhado em tons claros. São 4 cores iniciais, e as outras vêm como presente.
- **Peças** (visíveis de cima e também na corrida): aerofólio, item de teto (sirene, bagageiro, faixa), rodas (cor do aro) e escapamento (cor do fogo do nitro).
- **Adesivos**: ele arrasta o adesivo para cima do carro. Arrastar para fora remove. Máximo de 8 adesivos por carro. A posição é salva em coordenadas relativas ao carro.
- O mesmo visual do carro (carro, cor, peças e adesivos) é usado na garagem, na corrida e no lava-jato.

## Progresso e presentes

- 1 presente garantido por corrida.
- As estrelas enchem uma barra, e cada barra cheia dá 1 presente extra.
- O presente é sorteado entre os itens ainda não ganhos. Cerca de 2 a cada 5 presentes são um carro, enquanto houver carros a liberar. Cada modelo nasce com cor e formato próprios.
- Com tudo liberado, o presente vira confete e festa, sem item.
- Tudo é salvo no `localStorage`: itens ganhos, carro atual, cor, peças, adesivos por carro e a barra de estrelas. Se o dado salvo estiver corrompido ou faltar, o jogo volta ao estado inicial sem quebrar.

## Técnico

- Phaser 3, Vite e JavaScript (ES modules). Vitest só para a lógica pura.
- Lógica pura, testável e separada das cenas:
  - ajuste dos adversários (velocidade alvo a partir da distância até o Theo e do progresso da pista);
  - circuitos: suavização da linha central, ponto mais próximo (distância percorrida e afastamento), posição e direção na distância d;
  - direção: ângulo novo a partir do ângulo atual, do dedo e da direção da pista, com assistência e limite de giro;
  - sorteio de presentes;
  - salvar e carregar com valores padrão.
- Visual: sprites do Kenney *Racing Pack* (CC0) para carros e cenário (ver "Sprites do Kenney"); peças e ônibus desenhados em código; adesivos são emojis; sons sintetizados com WebAudio.
- PWA: `manifest.webmanifest` (nome, ícone, `display: fullscreen`, `orientation: portrait`) e um service worker que guarda os arquivos do jogo para funcionar sem internet.
- Publicação: GitHub Pages (HTTPS, obrigatório para instalar a PWA). Instalação pelo menu "Adicionar à tela inicial" do Chrome no Android.

## Sprites do Kenney

Fonte: Kenney *Racing Pack* (CC0). Só os PNGs usados entram no repositório, em `public/assets/kenney/`, junto com a licença do Kenney. O zip original não entra.

- **Modelos:** carrinho = carro `2`; esportivo = `3`; caminhonete = `4` (picape com caçamba); viatura = `5` (preto por padrão, sirene desenhada). O ônibus não existe no pacote e continua desenhado em código, imitando o estilo (contorno grosso escuro e brilho branco).
- **Pintura:** para cada modelo, um script gera duas camadas a partir do carro vermelho: a carroceria em cinza claro, que recebe o tint da cor escolhida mantendo as sombras, e os detalhes brancos (faixas, brilhos), que ficam por cima sem tint. As 10 cores do catálogo continuam valendo.
- **Peças:** desenhadas em código por cima do sprite, proporcionais ao tamanho de cada modelo. As rodas aparecem um pouco para fora da carroceria, para a cor do aro continuar visível.
- **Corrida:**
  - cone do Kenney no lugar de 🚧;
  - mancha de óleo no lugar da poça;
  - pneus empilhados como terceiro tipo de obstáculo, com o mesmo efeito de batida;
  - o nitro é a seta amarela pintada na pista (passar por cima acelera);
  - na grama, árvores, pedras, tendas e arquibancada com torcida, sem colisão;
  - os adversários usam carros do Kenney nas cores originais;
  - as estrelas continuam emoji ⭐.
- O carro continua igual em todas as telas: um único módulo desenha o carro.
- **Critério de aceite do visual:** antes de entrar no jogo, uma prévia dos 4 modelos nas 10 cores é aprovada pelo Tiago.

## Fora do escopo

- Play Store, APK, anúncios, compras, contas, multiplayer e ranking.
- Física realista (derrapagem, inércia), colisão entre carros, editor de pistas e circuitos liberados por presente.
- Pintura livre com o dedo (só cores prontas).

## Entregas

1. Projeto base: Phaser, Vite, cena inicial e PWA rodando no navegador.
2. Garagem: carro, cores e adesivos, com salvamento.
3. Lava-jato.
4. Corrida com adversários, nitro, estrelas e obstáculos.
5. Presentes e progresso, com peças e carros liberáveis.
6. Publicação no GitHub Pages e instalação no celular.
7. Circuitos com direção pelo dedo, substituindo a pista reta.
