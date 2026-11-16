#!/usr/bin/env bash
# Prepara os sprites do Kenney Racing Pack (CC0) para o jogo.
# Uso: scripts/preparar-sprites.sh <pasta do zip extraído> [pasta com carros em alta resolução]
# Gera em public/assets/kenney/: camadas de pintura dos carros, adversários, objetos e a licença.
set -euo pipefail

ORIGEM="${1:?informe a pasta do zip extraído do Kenney Racing Pack}"
# Opcional: pasta com car_red_N.png em alta resolução, recortados de Vector/vector_objects.svg
# renderizado com 6400 px de largura (1ª coluna = carros vermelhos 1..5). Sem ela, usa o PNG de ~70 px.
HD="${2:-}"
DESTINO="$(dirname "$0")/../public/assets/kenney"
mkdir -p "$DESTINO"

# Carros pintáveis: N = modelo do Kenney (2 carrinho, 3 esportivo, 4 caminhonete, 5 viatura).
for N in 2 3 4 5; do
  CARRO="$ORIGEM/PNG/Cars/car_red_$N.png"
  if [ -n "$HD" ] && [ -f "$HD/car_red_$N.png" ]; then CARRO="$HD/car_red_$N.png"; fi
  # Detalhes: só o que é quase branco (faixas, brilhos), por cima e sem pintura.
  convert "$CARRO" -alpha set -fuzz 18% +transparent white "PNG32:$DESTINO/detalhe_$N.png"
  # Corpo: o resto, em cinza claro, para receber a cor com setTint mantendo as sombras.
  convert "$CARRO" -type TrueColorAlpha -fuzz 18% -transparent white \
    -colorspace gray -level 0,58% -colorspace sRGB "PNG32:$DESTINO/corpo_$N.png"
done

# Adversários: carros nas cores originais.
cp "$ORIGEM/PNG/Cars/car_blue_1.png" "$DESTINO/adv_1.png"
cp "$ORIGEM/PNG/Cars/car_green_3.png" "$DESTINO/adv_2.png"
cp "$ORIGEM/PNG/Cars/car_yellow_5.png" "$DESTINO/adv_3.png"

# Objetos da pista e do cenário.
O="$ORIGEM/PNG/Objects"
cp "$O/cone_down.png" "$DESTINO/cone.png" # deitado: de cima, o cone em pé vira um anel
cp "$O/oil.png" "$DESTINO/oleo.png"
cp "$O/tires_red.png" "$DESTINO/pneus.png"
cp "$O/arrow_yellow.png" "$DESTINO/seta.png"
cp "$O/tree_large.png" "$DESTINO/arvore_g.png"
cp "$O/tree_small.png" "$DESTINO/arvore_p.png"
for i in 1 2 3; do cp "$O/rock$i.png" "$DESTINO/pedra_$i.png"; done
cp "$O/tent_red.png" "$DESTINO/tenda_v.png"
cp "$O/tent_blue.png" "$DESTINO/tenda_a.png"
cp "$O/tribune_full.png" "$DESTINO/arquibancada.png"
cp "$ORIGEM/PNG/Tiles/Grass/land_grass11.png" "$DESTINO/grama.png" # grama lisa, fundo do circuito

cp "$ORIGEM/License.txt" "$DESTINO/License.txt"
echo "sprites prontos em $DESTINO"
