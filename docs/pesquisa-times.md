# Pesquisa — Times e jogadores

De onde vêm os dados de `src/data/teams.json` e `src/data/players.json`, e como foram conferidos.

## Fonte e método

1. **Fonte única:** as páginas da [Category:Greed Island Players](https://hunterxhunter.fandom.com/wiki/Category:Greed_Island_Players) na Hunter x Hunter Wiki (Fandom, licença CC BY-SA), baixadas pela API do MediaWiki em 09/11/2026.
2. **Recorte:** de cada página foram usadas só as seções "Greed Island arc" e "Nen". As páginas de grupo ("Bomber", "Kazsule's Alliance" e "Nickes' Alliance") foram usadas inteiras.
3. **Resumos:** escritos em português a partir desse texto, sem conhecimento externo. Fatos que só aparecem no anime ficaram de fora.
4. **Cartas:** cada carta atribuída a um time ou jogador guarda:
   - `relation`: `usou` (lançou ou usou), `obteve` (conseguiu, comprou, ganhou ou recebeu) ou `possuía` (tinha e depois deu, perdeu, trocou ou teve roubada). Quando há mais de uma, vale a mais forte: usou > obteve > possuía;
   - `evidence`: o trecho original da wiki que prova a relação;
   - `chapter` e `source`: o capítulo do mangá citado e a página de onde veio o trecho.
5. **Conferência automática:** um script verificou que cada trecho existe literalmente na página citada e que cita a carta, pelo link da wiki ou pelo nome. Resultado: 133 cartas com prova válida e 0 rejeitadas. As 24 que citam a carta só pelo nome foram revisadas à mão.

As cartas de um time no app = cartas do grupo (`teams[].cards`) + cartas de cada integrante (`players[].cards`).

## Decisões de composição

| Time | Integrantes | Observação |
|---|---|---|
| Time do Gon | Gon, Killua, Biscuit | O texto chama de "Gon's team" |
| Bombers | Genthru, Bara, Sub | Página "Bomber" da wiki |
| Equipe de Tsezguerra, de Asta, de Hanse, de Kazsule e de Yabibi | conforme as subcategorias "Team …" da wiki | |
| Irmãos Bellam | Gashta, Zetsk | Soffman parece trabalhar para eles, mas o texto não confirma; ficou de fora |
| Trupe Fantasma | Phinks, Feitan, Shalnark, Kortopi, Shizuku, Machi, Franklin, Kalluto, Nobunaga, Bonolenov | Franklin e Nobunaga não aparecem entrando no jogo, mas a wiki os lista como jogadores. Hisoka ficou fora da Trupe: nesse arco, Kalluto é o substituto dele |
| Aliança de Kazsule *(aliança)* | 15 jogadores | Uma página fala em "Goreinu e mais quinze"; as outras, em 15 |
| Aliança de Nickes *(aliança)* | 15 com nome | A aliança tinha 63 membros; só esses têm página na wiki |

`players.json` guarda só quem é integrante de algum time ou aliança (48 jogadores). Os outros 27 jogadores da categoria da wiki (Hisoka, Binolt, Latarza…) não pertencem a nenhum grupo e foram retirados, porque o app não tem página para jogadores sem time.

## O que a wiki não informa (limites conhecidos)

- **Muitas cartas nunca são nomeadas.** Exemplos: as 99 cartas de Gon, o anel com as cartas da Aliança de Nickes, as 8 cartas roubadas da equipe de Tsezguerra e as cartas de Latarza tomadas por Phinks e Feitan. A lista de cartas de cada time é um **mínimo comprovado**, não o fichário completo.
- **Cartas citadas sem link nem nome de carta** ficaram de fora. Exemplos: "King White Stag Beetle" de Gon, "Tax Collector's Gauntlet" dos Bombers, "Chidon" de Rodriot e "Favor Cushion" de Michiro.
- **Contagens de slots designados** são por time e valem para um momento específico:
  - o 50 das equipes de Asta, Hanse, Kazsule e Yabibi é só o **mínimo** exigido na reunião de Kazsule;
  - a Aliança de Nickes tem 90 (cap. 142), mas a página de Puhat fala em 81.
- **Pequenas contradições entre páginas:**
  - quem quis perseguir os Bombers: Tsezguerra ou Kess e Rodriot?
  - a "Angel's Breath" que Gon usa em Genthru: "the original" ou "his last copy"?
  - na fuga dos Bombers, foi usada "Thief" ou "Levy"? Ficou "Thief", que é citada pelo nome.
