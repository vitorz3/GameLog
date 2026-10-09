// lista fixa dos jogos que aparecem no catalogo.
export const games = [
  { id: 'hollow-knight', title: 'Hollow Knight', genre: 'Metroidvania', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Explore um reino subterrâneo em ruínas, descubra caminhos secretos e enfrente criaturas memoráveis.', art: 'rings', colors: ['#213650', '#62c9cf'] },
  { id: 'stardew-valley', title: 'Stardew Valley', genre: 'Simulação', platforms: 'PC, Switch, PlayStation, Xbox, Mobile', description: 'Cultive sua fazenda, conheça os moradores da vila e encontre seu próprio ritmo no campo.', art: 'field', colors: ['#4b5a34', '#d2bb6f'] },
  { id: 'celeste', title: 'Celeste', genre: 'Plataforma', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Suba uma montanha desafiadora em uma jornada sobre coragem, persistência e autodescoberta.', art: 'peak', colors: ['#32447e', '#f19a9c'] },
  { id: 'hades', title: 'Hades', genre: 'Roguelike', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Tente escapar do submundo em combates rápidos e descubra novas histórias a cada tentativa.', art: 'rays', colors: ['#56343f', '#f1aa72'] },
  { id: 'the-witcher-3', title: 'The Witcher 3', genre: 'RPG', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Viaje por um mundo de fantasia repleto de escolhas difíceis, monstros e personagens marcantes.', art: 'slashes', colors: ['#3d4859', '#c7d3d3'] },
  { id: 'minecraft', title: 'Minecraft', genre: 'Sandbox', platforms: 'PC, Switch, PlayStation, Xbox, Mobile', description: 'Construa, explore e transforme um universo de blocos com liberdade para criar suas próprias metas.', art: 'blocks', colors: ['#355b4a', '#9dc781'] },
  { id: 'portal-2', title: 'Portal 2', genre: 'Puzzle', platforms: 'PC, PlayStation, Xbox, Switch', description: 'Resolva câmaras engenhosas com portais e humor afiado em uma instalação cheia de surpresas.', art: 'portals', colors: ['#315066', '#ffb66e'] },
  { id: 'ori-and-the-will-of-the-wisps', title: 'Ori and the Will of the Wisps', genre: 'Metroidvania', platforms: 'PC, Switch, Xbox', description: 'Atravesse florestas luminosas e paisagens perigosas em uma aventura delicada e emocionante.', art: 'glow', colors: ['#244d60', '#a6e3df'] },
  { id: 'red-dead-redemption-2', title: 'Red Dead Redemption 2', genre: 'Aventura', platforms: 'PC, PlayStation, Xbox', description: 'Acompanhe uma gangue no fim do Velho Oeste enquanto explora um vasto mundo aberto.', art: 'sun', colors: ['#613a36', '#e9a472'] },
  { id: 'outer-wilds', title: 'Outer Wilds', genre: 'Exploração', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Investigue os mistérios de um pequeno sistema solar em uma viagem movida por curiosidade.', art: 'orbit', colors: ['#39385d', '#e7c889'] },
  { id: 'cuphead', title: 'Cuphead', genre: 'Ação', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Enfrente chefes inventivos em uma aventura de ação inspirada na animação clássica.', art: 'dots', colors: ['#62513e', '#f4d899'] },
  { id: 'undertale', title: 'Undertale', genre: 'RPG', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Conheça habitantes de um mundo subterrâneo onde suas decisões mudam cada encontro.', art: 'heart', colors: ['#433b62', '#de9ac9'] },
  { id: 'the-legend-of-zelda-breath-of-the-wild', title: 'The Legend of Zelda: Breath of the Wild', genre: 'Aventura', platforms: 'Switch, Wii U', description: 'Desbrave Hyrule com liberdade para experimentar, descobrir segredos e seguir seu próprio caminho.', art: 'horizon', colors: ['#3a6770', '#b8d8a5'] },
  { id: 'disco-elysium', title: 'Disco Elysium', genre: 'RPG', platforms: 'PC, Switch, PlayStation, Xbox', description: 'Investigue um crime e as próprias contradições em uma cidade rica em diálogos e possibilidades.', art: 'shards', colors: ['#4a3f57', '#e1a59a'] },
  { id: 'league-of-legends', title: 'League of Legends', genre: 'MOBA', platforms: 'PC, Mac', description: 'Escolha um campeão, forme uma equipe e dispute partidas estratégicas em Summoner’s Rift.', art: 'rays', colors: ['#214354', '#c9a353'] },
  { id: 'valorant', title: 'VALORANT', genre: 'Tiro tático', platforms: 'PC, PlayStation 5, Xbox Series X|S', description: 'Combine mira precisa e habilidades de agentes em confrontos táticos entre duas equipes.', art: 'slashes', colors: ['#5b3544', '#ff5c65'] },
  { id: 'elden-ring', title: 'Elden Ring', genre: 'RPG de ação', platforms: 'PC, PlayStation, Xbox', description: 'Explore as Terras Intermédias, enfrente adversários imponentes e construa sua própria lenda.', art: 'rings', colors: ['#454733', '#d8bf78'] },
  { id: 'terraria', title: 'Terraria', genre: 'Sandbox', platforms: 'PC, Switch, PlayStation, Xbox, Mobile', description: 'Cave, construa e lute em um mundo 2D cheio de biomas, tesouros e chefes inesperados.', art: 'blocks', colors: ['#3c674d', '#b3ce77'] },
  { id: 'baldurs-gate-3', title: 'Baldur’s Gate 3', genre: 'RPG', platforms: 'PC, Mac, PlayStation 5, Xbox Series X|S', description: 'Reúna companheiros e decida o rumo de uma aventura fantástica moldada por suas escolhas.', art: 'shards', colors: ['#594353', '#e4b388'] },
  { id: 'cyberpunk-2077', title: 'Cyberpunk 2077', genre: 'RPG de ação', platforms: 'PC, PlayStation, Xbox', description: 'Percorra Night City e descubra histórias de ambição, tecnologia e sobrevivência.', art: 'grid', colors: ['#635c32', '#f2de5a'] }
];

// cada capa tem o mesmo nome do id do jogo e fica salva no projeto.
for (const game of games) {
  game.image = `./assets/images/${game.id}.jpg`;
}

// estes nomes aparecem nos cards, no diario e nos filtros.
export const statusLabels = {
  want: 'Quero jogar',
  playing: 'Jogando',
  finished: 'Finalizado'
};
