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

Início → Garagem → Corrida → Presente → Garagem, e, quando ele quiser, Garagem → Lava-jato → Garagem.

1. **Início**: título e um botão ▶️ gigante.
2. **Garagem**: carro grande no centro, abas 🚗 🎨 🔧 ⭐ embaixo, botão 🏁 para correr e botão 🚿 para lavar.
3. **Corrida**: cerca de 60 s.
4. **Presente**: uma caixa que ele toca para abrir, com o item novo. Volta para a garagem.
5. **Lava-jato** (opcional, só pela garagem): ver "Lava-jato". Não dá presente.

## Corrida

Visão por trás do carro (pseudo-3D, como os jogos de corrida de fliperama): a estrada sai da parte de baixo da tela e some no horizonte.

- **Circuitos:** os três laços fechados (*oval*, *feijão* e *serpente*), um sorteado por corrida.
  - A curvatura de cada trecho da linha central vira a curva da estrada, então cada circuito tem as curvas nos mesmos lugares.
  - A linha central também mede voltas, adversários e objetos, e desenha o minimapa.
- **Corrida:** 2 voltas, com duração total de 50 a 60 s.
  - O Theo e 3 adversários largam juntos na linha de chegada quadriculada.
  - No início da 2ª volta aparece "ÚLTIMA VOLTA!" com som.
- **Visual:**
  - céu em degradê, morros ao fundo que deslizam nas curvas, grama listrada;
  - asfalto com zebras vermelho/branco e faixas brancas;
  - dos lados: árvores, pedras, tendas e arquibancada com torcida, crescendo conforme se aproximam;
  - tudo desenhado em código (os sprites do Kenney são vistos de cima).
- **Velocidade:** cerca de 60% da sensação do protótipo aprovado. A duração da corrida continua em 50 a 60 s, e a sensação de velocidade fica numa constante única de escala.
- **Direção:**
  - O carro acelera sozinho.
  - Tocar e segurar na metade esquerda da tela vira para a esquerda; na metade direita, para a direita.
  - A curva empurra o carro um pouco para fora. Sem o dedo, ele volta devagar para o meio da pista.
  - **Grama:** fora do asfalto, a velocidade cai para 60%. Ele não passa muito da zebra (limite lateral). Não há derrota, parede nem batida por sair da pista.
- **Carro do Theo, visto por trás**, desenhado em código a partir do visual da garagem:
  - o formato muda com o modelo (carrinho, esportivo baixo e largo, caminhonete com caçamba, ônibus alto, viatura);
  - cor da pintura, aerofólio, teto (sirene, bagageiro, faixa) e cor do aro das rodas;
  - até 3 adesivos na traseira;
  - fogo do nitro na cor do escapamento.
- **Adversários:**
  - carros vistos por trás, nas cores azul, verde e amarelo, cada um numa posição lateral;
  - o ajuste elástico atual continua, medido pela distância percorrida (2 voltas = comprimento total):
    - na frente do Theo, desaceleram;
    - muito atrás, alcançam;
    - nos últimos 15% da corrida, freiam;
  - meta: o Theo chega em 1º em cerca de 85% das corridas. Nas outras, chega em 2º;
  - os adversários não batem no Theo. Batida só acontece com obstáculos.
- **Objetos na pista** (sorteados uma vez por corrida, nas mesmas posições nas duas voltas):
  - um objeto a cada ~600 px de linha, à esquerda, no centro ou à direita;
  - 50% estrela ⭐, 30% obstáculo (cone, óleo ou pneus, desenhados), 20% nitro (seta amarela no chão);
  - nenhum obstáculo nos primeiros 800 px; nitros a pelo menos 1500 px um do outro;
  - estrela pega some e não volta na 2ª volta;
  - nitro: 1.8× por 3 s, com fogo no escapamento;
  - obstáculo: 0.5× por 1 s, com o carro balançando.
- **Placar na tela:** medalha da posição 🥇🥈🥉, estrelas, volta "1/2" ou "2/2" com 🏁 e minimapa do circuito com um pontinho por carro.
- **Chegada:** troféu no 1º lugar ou medalha nos outros, confete e presente.

## Lava-jato

Opcional, aberto pelo botão 🚿 da garagem. Volta para a garagem e não dá presente.

- O carro chega com poeira e manchas de lama.
- Duas ferramentas grandes embaixo da tela. Ele toca para escolher, e a escolhida fica destacada:
  - 🧽 **Esponja:** esfregar cobre a lama com espuma branca e bolhas, com som de esfregar.
  - 🔫 **Pistola de água:** um jato azul sai da pistola até o dedo, com gotinhas e som de água. Onde há espuma, o jato tira a espuma e a lama junto.
- **Primeiro ensaboa, depois enxágua:** o jato direto na lama sem espuma não limpa. A lama fica molhada e brilhante e a esponja pisca como dica.
- Com ~90% do carro limpo, o carro brilha ✨ e volta para a garagem.
- Um botão ↩️ volta para a garagem a qualquer momento.

## Garagem

- **Carros**: 1 carro inicial, e os outros são liberados como presente.
- **Cores**: o tint do Phaser é aplicado sobre um carro desenhado em tons claros. São 4 cores iniciais, e as outras vêm como presente.
- **Peças** (visíveis de cima e também na corrida): aerofólio, item de teto (sirene, bagageiro, faixa), rodas (cor do aro) e escapamento (cor do fogo do nitro).
- **Adesivos**: ele arrasta o adesivo para cima do carro. Arrastar para fora remove. Máximo de 8 adesivos por carro. A posição é salva em coordenadas relativas ao carro.
- O mesmo visual do carro (carro, cor, peças e adesivos) é usado na garagem e no lava-jato (visto de cima) e na corrida (visto por trás).

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
  - circuitos: suavização da linha central, posição e direção na distância d, curvatura;
  - estrada pseudo-3D: projeção dos trechos e movimento lateral do carro (dedo, empurrão da curva, volta ao meio, grama);
  - lava-jato: estado de cada pedacinho do carro (sujo, ensaboado, limpo);
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
- **Corrida:** não usa sprites do Kenney (a visão por trás é desenhada em código). Os PNGs só da corrida vista de cima saem do projeto.
- Visto de cima, o carro é igual em todas as telas: um único módulo desenha o carro. Visto por trás (corrida), outro módulo desenha o carro a partir do mesmo visual.
- **Critério de aceite do visual:** antes de entrar no jogo, uma prévia dos 4 modelos nas 10 cores é aprovada pelo Tiago.

## Fora do escopo

- Play Store, APK, anúncios, compras, contas, multiplayer e ranking.
- Física realista (derrapagem, inércia), colisão entre carros, subidas e descidas na estrada, 3D de verdade, editor de pistas e circuitos liberados por presente.
- Lava-jato depois da corrida (saiu: lavar é só pela garagem).
- Pintura livre com o dedo (só cores prontas).

## Entregas

1. Projeto base: Phaser, Vite, cena inicial e PWA rodando no navegador.
2. Garagem: carro, cores e adesivos, com salvamento.
3. Lava-jato.
4. Corrida com adversários, nitro, estrelas e obstáculos.
5. Presentes e progresso, com peças e carros liberáveis.
6. Publicação no GitHub Pages e instalação no celular.
7. Circuitos com direção pelo dedo, substituindo a pista reta.
8. Lava-jato com esponja e pistola de água, só pela garagem.
9. Corrida com visão por trás do carro (pseudo-3D).
