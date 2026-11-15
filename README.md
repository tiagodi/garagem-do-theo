# Garagem do Theo

Jogo de corrida para criança de 4 anos: garagem (carros, cores, peças, adesivos), corrida contra adversários fáceis com nitro, lava-jato e presentes. Roda no navegador e instala no celular como app (PWA).

## Rodar no computador

```bash
npm install
npm run dev     # abre em http://localhost:5173
npm test        # testes da lógica (adversários, presentes, salvamento...)
```

Para jogar no celular pela rede de casa, abra o endereço `Network:` que o `npm run dev` mostra. Assim o jogo não instala como app nem funciona sem internet: isso só vale pelo endereço HTTPS.

## Instalar no celular (Android)

1. Abra o endereço do GitHub Pages no Chrome do celular.
2. Menu ⋮ → **Adicionar à tela inicial** (ou **Instalar app**).
3. Abra pelo ícone: tela cheia, em pé, funciona sem internet.

O progresso fica salvo no próprio celular. Limpar os dados do Chrome apaga o progresso.

## Publicação

Todo push na branch `main` roda os testes, gera o build e publica no GitHub Pages (`.github/workflows/pages.yml`).

## Estrutura

- `src/logica/`: regras do jogo, sem Phaser e testadas (catálogo, salvar, adesivos, sujeira, adversários, presentes).
- `src/cenas/`: uma cena por tela (Início, Garagem, Corrida, LavaJato, Presente).
- `src/carro.js`: desenho do carro, usado em todas as telas.
- `src/sons.js`: sons gerados no navegador (WebAudio).

## Créditos

Nenhum arquivo de terceiros: desenhos feitos em código, adesivos são emojis do sistema e sons são sintetizados. Motor: [Phaser](https://phaser.io) (licença MIT).
