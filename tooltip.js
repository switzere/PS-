let ShowdownEnhancedTooltip = {};

// Save a reference to the original method
const originalShowPokemonTooltip = BattleTooltips.prototype.showPokemonTooltip;

const originalShowMoveTooltip = BattleTooltips.prototype.showMoveTooltip;


ShowdownEnhancedTooltip.showPokemonTooltip = function showPokemonTooltip(clientPokemon, serverPokemon, isActive, illusionIndex) {
  // Call the original method
  let text = originalShowPokemonTooltip.call(this, clientPokemon, serverPokemon, isActive, illusionIndex);

  //console.log(originalShowPokemonTooltip);

  text += '<hr style="border: 1px solid black; margin: 5px 0;">';

  if (!serverPokemon) {
    if (!clientPokemon) throw new Error('Must pass either clientPokemon or serverPokemon');
    let [, max] = this.getSpeedRange(clientPokemon);
    text += '<p><small>Spe</small> ' + max + ' <small>(before items/abilities/modifiers)</small></p>';
  }

  // console.log(clientPokemon.stats)
  // let stats = {...serverPokemon.stats};
  // console.log(stats);
	// let pokemon = clientPokemon || serverPokemon;
  // console.log(pokemon);

  // const pokemon = clientPokemon || serverPokemon;
  // console.log(pokemon);
  //   if (!pokemon) {
  //     const stats = clientPokemon?.stats || serverPokemon?.stats || {};
  //     console.log(stats);
  //     if (!stats) {
  //       text += `
  //         <p><small>HP:</small> ${stats.hp}</p>
  //         <p><small>Atk:</small> ${stats.atk}</p>
  //         <p><small>Def:</small> ${stats.def}</p>
  //         <p><small>SpA:</small> ${stats.spa}</p>
  //         <p><small>SpD:</small> ${stats.spd}</p>
  //         <p><small>Spe:</small> ${stats.spe}</p>
  //       `;
  //     }
  //   }

  return text;//originalContent+"<img src=\"https://play.pokemonshowdown.com/sprites/types/Fairy.png\" alt=\"Fairy\" height=\"14\" width=\"32\" class=\"pixelated\" />";
}

ShowdownEnhancedTooltip.showMoveTooltip = function showMoveTooltip(move, isZOrMax, pokemon, serverPokemon, gmaxMove) {
  // Call the original method
  let text = originalShowMoveTooltip.call(this, move, isZOrMax, pokemon, serverPokemon, gmaxMove);

  let value = new ModifiableValue(this.battle, pokemon, serverPokemon);
  let [moveType, category] = this.getMoveType(move, value, gmaxMove || isZOrMax === 'maxmove');
  let categoryDiff = move.category !== category;

  text += '<hr style="border: 1px solid black; margin: 5px 0;">';

  text += '<h2>' + move.name + '<br />';

  text += Dex.getTypeIcon(moveType);
  text += ` ${Dex.getCategoryIcon(category)}</h2>`;

  //(stat: StatName, set: PokemonSet, evOverride?: number, natureOverride?: number)
  PokemonSet 
  pokemon.getStat(atk, pokemon, 84, natureOverride) {


  // Get the stats of both Pokémon
  let activePokemonStats = this.calculateModifiedStats(pokemon, serverPokemon);
  console.log(activePokemonStats);
  let opponentPokemon = pokemon.side.foe.active[0]; // Assuming single battle, adjust for double/triple battles
  console.log(opponentPokemon);
  let opponentServerPokemon = this.battle.myPokemon.find(p => p.name === opponentPokemon.name); // Adjust as needed
  console.log(opponentServerPokemon);
  let opponentPokemonStats = this.calculateModifiedStats(opponentPokemon, opponentServerPokemon);
  console.log(opponentPokemonStats);

  // Append the stats to the tooltip text
  text += '<hr style="border: 1px solid black; margin: 5px 0;">';
  text += '<h3>Active Pokémon Stats</h3>';
  text += `<p><small>HP:</small> ${activePokemonStats.hp}</p>`;
  text += `<p><small>Atk:</small> ${activePokemonStats.atk}</p>`;
  text += `<p><small>Def:</small> ${activePokemonStats.def}</p>`;
  text += `<p><small>SpA:</small> ${activePokemonStats.spa}</p>`;
  text += `<p><small>SpD:</small> ${activePokemonStats.spd}</p>`;
  text += `<p><small>Spe:</small> ${activePokemonStats.spe}</p>`;

  text += '<hr style="border: 1px solid black; margin: 5px 0;">';
  text += '<h3>Opponent Pokémon Stats</h3>';
  text += `<p><small>HP:</small> ${opponentPokemonStats.hp}</p>`;
  text += `<p><small>Atk:</small> ${opponentPokemonStats.atk}</p>`;
  text += `<p><small>Def:</small> ${opponentPokemonStats.def}</p>`;
  text += `<p><small>SpA:</small> ${opponentPokemonStats.spa}</p>`;
  text += `<p><small>SpD:</small> ${opponentPokemonStats.spd}</p>`;
  text += `<p><small>Spe:</small> ${opponentPokemonStats.spe}</p>`;

  return text;
}


BattleTooltips.prototype.showPokemonTooltip = ShowdownEnhancedTooltip.showPokemonTooltip;
BattleTooltips.prototype.showMoveTooltip = ShowdownEnhancedTooltip.showMoveTooltip;
