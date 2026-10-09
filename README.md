# GameLog — diário de jogos

Site de catálogo e diário pessoal feito somente com HTML, CSS e JavaScript puro. Funciona sem internet; não usa login, bibliotecas, APIs externas ou backend.

## Como abrir

Por usar módulos JavaScript, abra a pasta em um servidor local (não pelo protocolo `file://`). Por exemplo, no terminal dentro da pasta do projeto:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador. Após iniciar o servidor, a internet pode estar desconectada.

## O que faz

- Mostra 20 jogos com imagens reais salvas no projeto, busca por título e filtro por gênero.
- Permite marcar status, digitar nota de 1 a 5 (inclusive decimal, como `4,5`) e escrever ou editar uma resenha pessoal para cada jogo.
- Organiza os registros em uma página própria, **Meu Diário**, com filtro por status, edição e exclusão confirmada.
- Atualiza as contagens por status e a média das notas automaticamente.
- Mostra mensagens para buscas vazias, diário vazio, validação, salvamento e exclusão.

Os registros ficam no `localStorage` do navegador, associados ao ID de cada jogo sob a chave `gamelog.entries.v1`. Eles continuam após atualizar ou fechar a página no mesmo navegador e origem local. Limpar os dados do site no navegador apaga o diário.

## Organização

- `index.html`: página do catálogo.
- `diario.html`: página do diário pessoal.
- `css/styles.css`: tema, responsividade e estados de foco.
- `js/catalog.js`: dados do catálogo.
- `js/storage.js`: leitura, validação e gravação no `localStorage`.
- `js/app.js`: busca, filtros, detalhes, diário, estatísticas e eventos da interface.
- `assets/images/`: imagens locais. A relação das fontes está em `assets/SOURCES.md`.
- `assets/favicon.svg`: ícone da aba do navegador.
