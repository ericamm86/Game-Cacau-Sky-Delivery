# Cacau Sky Delivery

Jogo em HTML, CSS e JavaScript com Phaser 3, agora com backend Node.js, autenticação, progresso em banco SQLite, ranking global, XP, moedas, níveis, tutorial e conquistas.

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor:

```bash
npm start
```

3. Abra no navegador:

```text
http://localhost:5177
```

O servidor entrega o jogo e também expõe as APIs em `/api`.

## Banco de dados

O banco padrão é SQLite e fica em:

```text
data/cacau-sky.sqlite
```

As tabelas são criadas automaticamente a partir de:

```text
server/schema.sql
```

Tabelas principais:

- `users`: usuários, email e senha criptografada.
- `progress`: moedas, XP, nível, fase, recorde, entregas e tutorial.
- `leaderboard`: pontuações globais.
- `achievements`: conquistas disponíveis.
- `user_achievements`: conquistas liberadas por usuário.
- `game_sessions`: histórico validado de partidas.

Para usar outro caminho de banco:

```bash
set DB_PATH=C:\caminho\cacau-sky.sqlite
npm start
```

Para produção, defina também:

```bash
set JWT_SECRET=uma_chave_grande_e_secreta
```

## Sistemas criados

- Login e cadastro com nome, email e senha.
- Senhas protegidas com hash `bcryptjs`.
- Sessão persistente com JWT salvo no navegador.
- Logout.
- Validação de campos no frontend e backend.
- Salvamento em nuvem de moedas, XP, nível, fase, recorde, entregas e tutorial.
- Ranking global com nome, pontuação e fase.
- Sistema de XP, níveis e barra visual.
- Tutorial inicial mostrado uma vez por usuário.
- Conquistas com recompensas de moedas e XP.
- Validação server-side de resultados da partida para reduzir alteração fácil de moedas e ranking.
- Estrutura preparada para futuras atualizações.

## Tecnologias

- HTML5
- CSS3 responsivo
- JavaScript
- Phaser 3
- Node.js
- Express
- SQLite com `better-sqlite3`
- JWT com `jsonwebtoken`
- Hash de senha com `bcryptjs`

## Desenvolvimento

Checar sintaxe:

```bash
npm run check
```

Arquivos principais:

- `index.html`: estrutura da interface.
- `styles.css`: layout responsivo e visual.
- `game.js`: jogo Phaser e regras de gameplay.
- `app.js`: login, progresso, ranking, tutorial e conquistas no frontend.
- `server/app.js`: API HTTP.
- `server/db.js`: conexão, seed e helpers do banco.
- `server/security.js`: validação, JWT e senhas.
- `server/schema.sql`: estrutura do banco.
