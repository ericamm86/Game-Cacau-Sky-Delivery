# Cacau Sky Delivery

Jogo em HTML, CSS e JavaScript usando Phaser 3.

## Objetivo

Controle a Cacau, uma pinscher preta com detalhes caramelo, bolsa de entrega e helice nas costas. Ela voa pelo ceu ensolarado para levar bebes animais as suas familias.

## Como jogar

- Abra `index.html` no navegador.
- Use ↑/↓ ou W/S para subir e descer.
- Use → ou D para a Cacau avançar e interceptar os alvos.
- No celular, arraste para controlar a altura e avançar.
- Desvie das nuvens fofinhas: agora elas tiram vida.
- Colete estrelas para recuperar energia.
- Colete estrelas para ganhar pontos e liberar looks.
- Desvie de baloes e pipas.
- Pegue coracoes para ganhar vidas.
- Pegue o raio grande para recuperar energia em dobro.
- Pegue um bebe animal por vez.
- Entregue cada bebe na familia correta.
- A Cacau voa sempre para frente; o Bercario e as familias passam pela tela.
- Pegue o bebe quando o Ponto A passar por voce e entregue quando o Ponto B aparecer.
- A cada 3 entregas, a fase aumenta e tudo fica mais rapido.

## Sistema

- Pontuacao
- Vidas
- Timer
- Fases
- Estrelas guardadas
- Energia
- Loja de roupinhas para a Cacau
- Ranking local de pontos
- Cenarios: ceu solar, floresta, montanhas, parque e cidade dos animais
- Sons fofinhos de inicio, estrela, bebe, entrega, fase e colisao
- Fundo animado com parallax
- Animacoes suaves no personagem e nos coletaveis
- Estouro de mini ossinhos quando a Cacau acerta algo bom
- Sistema de rotas por estado: `pickup` no Bercario e `delivery` na Casinha Destino
- Validacao por pedido: a casinha compara o bebe na bolsinha com a familia correta
- Motor Phaser 3 para renderizacao, input e loop de jogo
