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

- Vista de cima, pista reta com 3 faixas rolando. O carro anda sozinho, e ele arrasta o dedo para trocar de faixa.
- **3 adversários** com ajuste ao jogador:
  - na frente do Theo, desaceleram;
  - muito atrás, alcançam;
  - nos últimos 15% da pista, freiam.
  - Meta: o Theo chega em 1º em cerca de 85% das corridas. Nas outras, chega em 2º.
- **Nitro 🔥**: um ícone na pista que, ao ser tocado pelo carro, acelera por 3 s, com fogo no escapamento. A cor do fogo depende da peça de escapamento.
- **Estrelas ⭐** para coletar. **Cones e poças** como obstáculos: bater faz o carro rodar por cerca de 1 s e perder um pouco de velocidade.
- Posição exibida com 🥇🥈🥉. Linha de chegada com confete, e o 1º lugar tem uma comemoração maior.
- Os adversários não batem no Theo. Batida só acontece com obstáculos.

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
  - sorteio de presentes;
  - salvar e carregar com valores padrão.
- Carros, peças, pista e objetos desenhados em código (Phaser Graphics); adesivos são emojis; sons sintetizados com WebAudio. Nenhum asset de terceiros.
- PWA: `manifest.webmanifest` (nome, ícone, `display: fullscreen`, `orientation: portrait`) e um service worker que guarda os arquivos do jogo para funcionar sem internet.
- Publicação: GitHub Pages (HTTPS, obrigatório para instalar a PWA). Instalação pelo menu "Adicionar à tela inicial" do Chrome no Android.

## Fora do escopo

- Play Store, APK, anúncios, compras, contas, multiplayer e ranking.
- Pista com curvas, física realista e mais de uma pista na primeira versão.
- Pintura livre com o dedo (só cores prontas).

## Entregas

1. Projeto base: Phaser, Vite, cena inicial e PWA rodando no navegador.
2. Garagem: carro, cores e adesivos, com salvamento.
3. Lava-jato.
4. Corrida com adversários, nitro, estrelas e obstáculos.
5. Presentes e progresso, com peças e carros liberáveis.
6. Publicação no GitHub Pages e instalação no celular.
