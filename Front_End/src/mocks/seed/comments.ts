export interface SeedComment {
  sightingId: string;
  authorId: string;
  text: string;
  /** Minutos depois da publicação. */
  after: number;
}

export const SEED_COMMENTS: SeedComment[] = [
  // Mount Rainier
  { sightingId: 'sgt_rainier', authorId: 'usr_lucas', after: 42, text: '10 segundos é bastante tempo para um avistamento. Você lembra da cor da pelagem?' },
  { sightingId: 'sgt_rainier', authorId: 'usr_marina', after: 55, text: 'Marrom-escuro, quase preto. E os ombros eram muito largos, sem pescoço aparente.' },
  { sightingId: 'sgt_rainier', authorId: 'usr_helena', after: 130, text: 'Consegue marcar o ponto exato no mapa? Vale checar se havia ursos-negros registrados na área nessa semana.' },
  { sightingId: 'sgt_rainier', authorId: 'usr_victor', after: 300, text: 'Essa névoa na foto dá até arrepio. Obrigado por compartilhar!' },
  { sightingId: 'sgt_rainier', authorId: 'usr_ethan', after: 900, text: 'Trabalhei nesse setor ano passado. Os guardas-parque ouvem relatos assim com mais frequência do que admitem.' },

  // Pegadas na neve — Mount Hood
  { sightingId: 'sgt_hood_snow', authorId: 'usr_tom', after: 18, text: 'Passada de 1,52 m em neve fresca? Isso é absurdo. Posta a foto do molde!' },
  { sightingId: 'sgt_hood_snow', authorId: 'usr_lucas', after: 35, text: 'Posto amanhã, junto com as medidas dos dedos.' },
  { sightingId: 'sgt_hood_snow', authorId: 'usr_helena', after: 90, text: 'Quanto tempo depois da nevada você encontrou? Neve derretendo aumenta o tamanho das pegadas.' },
  { sightingId: 'sgt_hood_snow', authorId: 'usr_lucas', after: 104, text: 'A nevada parou por volta das 4h e eu cheguei às 7h15. Temperatura ainda negativa, então a deformação deve ser mínima.' },
  { sightingId: 'sgt_hood_snow', authorId: 'usr_clara', after: 240, text: 'A linha reta subindo a encosta é o que mais me impressiona.' },

  // Harrison Hot Springs
  { sightingId: 'sgt_harrison', authorId: 'usr_noah', after: 60, text: 'O lago Hicks é lindo e assustador ao mesmo tempo. Já acampei lá duas vezes.' },
  { sightingId: 'sgt_harrison', authorId: 'usr_rafael', after: 200, text: 'Conseguiu ver quanto tempo ela levou para subir a encosta?' },
  { sightingId: 'sgt_harrison', authorId: 'usr_aiyana', after: 230, text: 'Uns 15 segundos até sumir entre as árvores. E subiu sem usar as mãos.' },

  // Lago McDonald
  { sightingId: 'sgt_glacier_winter', authorId: 'usr_marina', after: 25, text: 'Que bom que você decidiu postar! Relatos antigos também contam.' },
  { sightingId: 'sgt_glacier_winter', authorId: 'usr_lucas', after: 70, text: '400 metros sem desviar num lago congelado… Você mediu alguma pegada?' },
  { sightingId: 'sgt_glacier_winter', authorId: 'usr_tom', after: 95, text: 'Duas. 43 cm. Tenho as fotos com a trena, vou separar.' },

  // Bluff Creek
  { sightingId: 'sgt_bluff_creek', authorId: 'usr_helena', after: 80, text: 'Cheiro forte de almíscar é uma descrição recorrente em vários relatos da Califórnia. Interessante.' },
  { sightingId: 'sgt_bluff_creek', authorId: 'usr_victor', after: 260, text: 'Bluff Creek está na minha lista há anos. Qual trilha você usou para chegar?' },
  { sightingId: 'sgt_bluff_creek', authorId: 'usr_rafael', after: 290, text: 'Saí de Orleans pela estrada florestal e depois caminhei uns 4 km pelo leito do riacho. Chegue cedo.' },

  // Floresta Hoh
  { sightingId: 'sgt_hoh', authorId: 'usr_ethan', after: 45, text: 'Já vi estruturas assim nas Cascatas. Nunca encontrei uma explicação convincente.' },
  { sightingId: 'sgt_hoh', authorId: 'usr_lucas', after: 120, text: 'Galhos torcidos e não cortados é um detalhe importante. Fotografou as pontas?' },
  { sightingId: 'sgt_hoh', authorId: 'usr_helena', after: 150, text: 'Fotografei todas as junções. Vou organizar tudo e postar um relatório completo.' },
  { sightingId: 'sgt_hoh', authorId: 'usr_rastro', after: 400, text: 'Registro excelente, Helena. Esse é o nível de documentação que ajuda a comunidade.' },

  // Ape Canyon
  { sightingId: 'sgt_ape_canyon', authorId: 'usr_aiyana', after: 30, text: 'Arrepiei só de ler. Posta o áudio!' },
  { sightingId: 'sgt_ape_canyon', authorId: 'usr_noah', after: 75, text: 'O silêncio total depois é o detalhe mais assustador.' },
  { sightingId: 'sgt_ape_canyon', authorId: 'usr_helena', after: 180, text: 'Se quiser, posso ajudar a comparar o espectrograma com vocalizações de alces na época de acasalamento.' },
  { sightingId: 'sgt_ape_canyon', authorId: 'usr_clara', after: 210, text: 'Quero sim, Helena! Te mando os arquivos.' },

  // Rodovia 126
  { sightingId: 'sgt_siuslaw_road', authorId: 'usr_marina', after: 40, text: 'Dois passos em 7 metros… e braços na altura dos joelhos. Que relato.' },
  { sightingId: 'sgt_siuslaw_road', authorId: 'usr_tom', after: 95, text: 'Já passei por essa estrada de madrugada. Nunca mais vou passar do mesmo jeito.' },
  { sightingId: 'sgt_siuslaw_road', authorId: 'usr_rafael', after: 160, text: 'Você conseguiu ver o rosto?' },
  { sightingId: 'sgt_siuslaw_road', authorId: 'usr_ethan', after: 175, text: 'Não. Estava de perfil e a neblina não deixou ver detalhes. Só a silhueta, muito alta.' },

  // Multnomah
  { sightingId: 'sgt_multnomah', authorId: 'usr_helena', after: 65, text: 'Não dá para descartar uma sombra, mas o sumiço é intrigante. Você tem as três fotos em sequência?' },
  { sightingId: 'sgt_multnomah', authorId: 'usr_marina', after: 80, text: 'Tenho! Na primeira aparece algo; nas outras, nada. Vou tentar ampliar.' },
  { sightingId: 'sgt_multnomah', authorId: 'usr_victor', after: 500, text: 'Gosto muito desse tipo de relato honesto, sem forçar conclusão.' },

  // Strathcona
  { sightingId: 'sgt_strathcona', authorId: 'usr_aiyana', after: 50, text: 'Pedras empilhadas já apareceram em outros relatos da Ilha de Vancouver.' },
  { sightingId: 'sgt_strathcona', authorId: 'usr_lucas', after: 140, text: 'Cheiro de enxofre também aparece bastante. Como os cachorros reagiram?' },
  { sightingId: 'sgt_strathcona', authorId: 'usr_noah', after: 170, text: 'Ficaram encolhidos, rosnando baixinho. Nunca tinha visto os dois assim.' },

  // Serra do Vulto
  { sightingId: 'sgt_serra_vulto', authorId: 'usr_marina', after: 35, text: 'Um registro no Brasil! Qual era a distância até a clareira?' },
  { sightingId: 'sgt_serra_vulto', authorId: 'usr_victor', after: 50, text: 'Uns 80 metros. Deu para ver bem a postura, mas nenhum detalhe.' },
  { sightingId: 'sgt_serra_vulto', authorId: 'usr_clara', after: 200, text: 'A neblina da serra catarinense é outra coisa. Volta lá com um gravador!' },
  { sightingId: 'sgt_serra_vulto', authorId: 'usr_helena', after: 380, text: 'Araucárias, neblina e um vulto ereto… Documente tudo, Victor. Relatos fora da América do Norte são raros.' },

  // Expedição
  { sightingId: 'sgt_expedicao', authorId: 'usr_lucas', after: 20, text: 'Foi uma experiência incrível. Obrigado pela organização!' },
  { sightingId: 'sgt_expedicao', authorId: 'usr_clara', after: 45, text: 'As gravações da terceira noite são as mais interessantes. Estou ansiosa pelo relatório.' },
  { sightingId: 'sgt_expedicao', authorId: 'usr_ethan', after: 120, text: 'Contem comigo para a próxima.' },
  { sightingId: 'sgt_expedicao', authorId: 'usr_victor', after: 600, text: 'Como faço para participar da próxima expedição?' },
  { sightingId: 'sgt_expedicao', authorId: 'usr_rastro', after: 640, text: 'As inscrições abrem no começo do ano, Victor. Vamos avisar aqui no perfil oficial.' },

  // Clearwater
  { sightingId: 'sgt_clearwater', authorId: 'usr_lucas', after: 55, text: 'Crista de pressão no meio do pé! É o que chamam de "quebra mediotarsal". Muito difícil de falsificar.' },
  { sightingId: 'sgt_clearwater', authorId: 'usr_tom', after: 300, text: 'Gosto de como você escreve: "não é prova, é um dado".' },

  // Prairie Creek
  { sightingId: 'sgt_prairie_creek', authorId: 'usr_noah', after: 90, text: 'Pinha arremessada no tripé… isso é bizarro.' },
  { sightingId: 'sgt_prairie_creek', authorId: 'usr_marina', after: 240, text: 'Relatos de objetos arremessados estão entre os mais comuns e os mais difíceis de explicar.' },

  // Lago Timothy
  { sightingId: 'sgt_timothy_lake', authorId: 'usr_ethan', after: 60, text: '20 minutos circulando? Eu nunca mais dormiria.' },
  { sightingId: 'sgt_timothy_lake', authorId: 'usr_aiyana', after: 150, text: 'Aconteceu quase igual comigo em Golden Ears. Arrepiei.' },
  { sightingId: 'sgt_timothy_lake', authorId: 'usr_clara', after: 170, text: 'Aiyana, vi seu relato! Precisamos comparar os horários.' },

  // Mount Baker
  { sightingId: 'sgt_baker', authorId: 'usr_tom', after: 70, text: 'Batidas respondendo no mesmo ritmo… isso é comunicação.' },
  { sightingId: 'sgt_baker', authorId: 'usr_helena', after: 190, text: 'Pica-paus também produzem sequências, mas responder ao estímulo no mesmo ritmo é outra história.' },
  { sightingId: 'sgt_baker', authorId: 'usr_lucas', after: 260, text: 'Vocês encerraram cedo e fizeram muito bem.' },

  // Ravenmoor
  { sightingId: 'sgt_ravenmoor', authorId: 'usr_marina', after: 110, text: 'Essa sensação de ser acompanhado é descrita por muita gente. Você voltou lá?' },
  { sightingId: 'sgt_ravenmoor', authorId: 'usr_victor', after: 150, text: 'Ainda não. Estou planejando voltar com mais alguém e um gravador.' },

  // Golden Ears
  { sightingId: 'sgt_golden_ears', authorId: 'usr_clara', after: 85, text: 'Respiração acima da altura da barraca… esse detalhe me pegou.' },
  { sightingId: 'sgt_golden_ears', authorId: 'usr_noah', after: 200, text: 'Golden Ears é famoso por relatos assim. Se cuida!' },
];
