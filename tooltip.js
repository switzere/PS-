let ShowdownEnhancedTooltip = {};

// Save a reference to the original method
const originalShowPokemonTooltip = BattleTooltips.prototype.showPokemonTooltip;

const originalShowMoveTooltip = BattleTooltips.prototype.showMoveTooltip;

//serverPokemon exists when it's the users Pokemon
//clientPokemon always exists

function calculateStats(pokemon, level) {
  //gets the stats of the pokemon, then using the base stats, evs, level, and nature, calculates the actual stats
  let baseStats = pokemon.baseStats;
  let evs = 84;
  let ivs = 31;
  let stats = {};

  for (let stat in baseStats) {
    if (stat === 'hp') {
      stats[stat] = Math.floor(0.01 * (2 * baseStats[stat] + ivs + Math.floor(evs / 4)) * level + level + 10);
    }
    else {
      stats[stat] = Math.floor(0.01 * (2 * baseStats[stat] + ivs + Math.floor(evs / 4)) * level + 5);
    }
  }

  return stats;
}

function calculateDamage(move, activeStats, foeStats, activePokemonBaseSpecies, foePokemonBaseSpecies, level) {
  //gets the damage of the move, then using the base power, attacker's attack, defender's defense, and the level, calculates the damage
  if (move.basePower === 0) return [0, 0];

  //calculate the damage, we have the stats, the base power, level, and type
  let attacker = 0;
  let defender = 0;
  if(move.category === 'Special') {
    attacker = activeStats.spa;
    defender = foeStats.spd;
  } else if(move.category === 'Physical') {
    attacker = activeStats.atk;
    defender = foeStats.def;
  }

  let activeType1 = activePokemonBaseSpecies.types[0];
  let activeType2 = activePokemonBaseSpecies.types[1];

  let foeType1 = foePokemonBaseSpecies.types[0];
  let foeType2 = foePokemonBaseSpecies.types[1];

  // Use typeEffectivenessChart to calculate type effectiveness
  let typeEffectiveness = typeEffectivenessChart[move.type][foeType1] * (foeType2 ? typeEffectivenessChart[move.type][foeType2] : 1);

  let stab = move.type === activeType1 || move.type === activeType2 ? 1.5 : 1;

  // damage floor
  let damageFloor = ((((2 * level)/5 + 2) * move.basePower * (attacker/defender)) / 50 + 2) * 0.85 * typeEffectiveness * stab;

  // damage ceiling
  let damageCeiling = ((((2 * level)/5 + 2) * move.basePower * (attacker/defender)) / 50 + 2) * 1 * typeEffectiveness * stab;

  return [damageFloor, damageCeiling]; // Return damage range as an array



}

function boostStats(stats, boosts) {
  let modifiedStats = {};
  for (let stat in stats) {
    modifiedStats[stat] = stats[stat];
    if (boosts[stat] > 0) {
      modifiedStats[stat] = Math.floor(stats[stat] * (2 + boosts[stat]) / 2);
    }
    else if (boosts[stat] < 0) {
      modifiedStats[stat] = Math.floor(stats[stat] * 2 / (2 + Math.abs(boosts[stat])));
    }
  }
  return modifiedStats;
}

ShowdownEnhancedTooltip.showPokemonTooltip = function showPokemonTooltip(clientPokemon, serverPokemon, isActive, illusionIndex) {
  // Call the original method
  let text = originalShowPokemonTooltip.call(this, clientPokemon, serverPokemon, isActive, illusionIndex);

  //console.log(originalShowPokemonTooltip);

  text += '<hr style="border: 1px solid black; margin: 5px 0;">';

  if (!serverPokemon) {
    if (!clientPokemon) throw new Error('Must pass either clientPokemon or serverPokemon');
    console.log(clientPokemon.name);
    // Use the getBaseSpecies method
    let baseSpecies = clientPokemon.getBaseSpecies();
    //let baseStats = baseSpecies.baseStats;
    let stats = calculateStats(baseSpecies, clientPokemon.level);
    let boosts = clientPokemon.boosts;

    let modifiedStats = boostStats(stats, boosts);

    let buf = '<p>';

    for (const statName of Object.keys(stats)) {
      if (this.battle.gen === 1 && statName === 'spd') continue;
      if (statName === 'hp') continue;
      let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
      buf += statName === 'atk' ? '<small>' : '<small> / ';
      buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
      buf += '' + stats[statName];
      //if (modifiedStats[statName] !== stats[statName]) hasModifiedStat = true;
    }

    buf += '</p>';

    //if the stats were modified
    if (clientPokemon.boosts) {
      buf += '<p><small>(After stat modifiers:)</small></p>';
      buf += '<p>';
      for (const statName of Object.keys(modifiedStats)) {
        if (this.battle.gen === 1 && statName === 'spd') continue;
        if (statName === 'hp') continue;
        let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
        buf += statName === 'atk' ? '<small>' : '<small> / ';
        buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
        if (modifiedStats[statName] === stats[statName]) {
          buf += '' + modifiedStats[statName];
        } else if (modifiedStats[statName] < stats[statName]) {
          buf += '<strong class="stat-lowered">' + modifiedStats[statName] + '</strong>';
        } else if (modifiedStats[statName] > stats[statName]) {
          buf += '<strong class="stat-boosted">' + modifiedStats[statName] + '</strong>';
        }
      }
    }

    buf += '</p>';
    text += buf;
    // for (const statName of Object.keys(stats)) {
    //   if (this.battle.gen === 1 && statName === 'spd') continue;
    //   let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
    //   buf += statName === 'atk' ? '<small>' : '<small> / ';
    //   buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
    //   buf += '' + stats[statName];
    // }
    // text += buf;
  }


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

  console.log(pokemon.side.foe.active[0].name);
  // Use the getBaseSpecies method
  let foePokemonBaseSpecies = pokemon.side.foe.active[0].getBaseSpecies();
  //let baseStats = baseSpecies.baseStats;
  let foeStats = calculateStats(foePokemonBaseSpecies, pokemon.side.foe.active[0].level);

  text += '<p><small>Base Stats</small></p>';
  let buf = '';
  for (const statName of Object.keys(foeStats)) {
    if (this.battle.gen === 1 && statName === 'spd') continue;
    let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
    buf += statName === 'atk' ? '<small>' : '<small> / ';
    buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
    buf += '' + foeStats[statName];
  }
  text += buf;

  console.log(pokemon.side.active[0].name);
  // Use the getBaseSpecies method
  let activePokemonBaseSpecies = pokemon.side.active[0].getBaseSpecies();
  //let baseStats = baseSpecies.baseStats;
  let activeStats = calculateStats(activePokemonBaseSpecies, pokemon.side.active[0].level);

  text += '<p><small>Base Stats</small></p>';
  buf = '';
  for (const statName of Object.keys(activeStats)) {
    if (this.battle.gen === 1 && statName === 'spd') continue;
    let statLabel = this.battle.gen === 1 && statName === 'spa' ? 'spc' : statName;
    buf += statName === 'atk' ? '<small>' : '<small> / ';
    buf += '' + BattleText[statLabel].statShortName + '&nbsp;</small>';
    buf += '' + activeStats[statName];
  }
  text += buf + '<br />';

  let damageRange = calculateDamage(move, activeStats, foeStats, activePokemonBaseSpecies, foePokemonBaseSpecies, pokemon.side.active[0].level);
  //turn into percentage
  damageRange[0] = (damageRange[0] / foeStats.hp * 100).toFixed(1);
  damageRange[1] = (damageRange[1] / foeStats.hp * 100).toFixed(1);
  text += damageRange[0] + "% - " + damageRange[1] + "%";


  return text;
}


const typeEffectivenessChart = {
  "Normal": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 0.5,
    "Ghost": 0,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Fire": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 0.5,
    "Electric": 1,
    "Grass": 2,
    "Ice": 2,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 2,
    "Rock": 0.5,
    "Ghost": 1,
    "Dragon": 0.5,
    "Dark": 1,
    "Steel": 2,
    "Fairy": 1
  },
  "Water": {
    "Normal": 1,
    "Fire": 2,
    "Water": 0.5,
    "Electric": 1,
    "Grass": 0.5,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 2,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 0.5,
    "Dark": 1,
    "Steel": 1,
    "Fairy": 1
  },
  "Electric": {
    "Normal": 1,
    "Fire": 1,
    "Water": 2,
    "Electric": 0.5,
    "Grass": 0.5,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 0,
    "Flying": 2,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 0.5,
    "Dark": 1,
    "Steel": 1,
    "Fairy": 1
  },
  "Grass": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 2,
    "Electric": 1,
    "Grass": 0.5,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 0.5,
    "Ground": 2,
    "Flying": 0.5,
    "Psychic": 1,
    "Bug": 0.5,
    "Rock": 2,
    "Ghost": 1,
    "Dragon": 0.5,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Ice": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 0.5,
    "Electric": 1,
    "Grass": 2,
    "Ice": 0.5,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 2,
    "Flying": 2,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 2,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Fighting": {
    "Normal": 2,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 0.5,
    "Ground": 1,
    "Flying": 0.5,
    "Psychic": 0.5,
    "Bug": 0.5,
    "Rock": 2,
    "Ghost": 0,
    "Dragon": 1,
    "Dark": 2,
    "Steel": 2,
    "Fairy": 0.5
  },
  "Poison": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 2,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 0.5,
    "Ground": 0.5,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 0.5,
    "Ghost": 0.5,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 0,
    "Fairy": 2
  },
  "Ground": {
    "Normal": 1,
    "Fire": 2,
    "Water": 1,
    "Electric": 2,
    "Grass": 0.5,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 2,
    "Ground": 1,
    "Flying": 0,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 2,
    "Ghost": 1,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 2,
    "Fairy": 1
  },
  "Flying": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 0.5,
    "Grass": 2,
    "Ice": 1,
    "Fighting": 2,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 2,
    "Rock": 0.5,
    "Ghost": 1,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Psychic": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 2,
    "Poison": 2,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 0.5,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 1,
    "Dark": 0,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Bug": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 1,
    "Electric": 1,
    "Grass": 2,
    "Ice": 1,
    "Fighting": 0.5,
    "Poison": 1,
    "Ground": 1,
    "Flying": 0.5,
    "Psychic": 2,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 0.5,
    "Dragon": 1,
    "Dark": 2,
    "Steel": 0.5,
    "Fairy": 0.5
  },
  "Rock": {
    "Normal": 1,
    "Fire": 2,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 2,
    "Fighting": 0.5,
    "Poison": 1,
    "Ground": 0.5,
    "Flying": 2,
    "Psychic": 1,
    "Bug": 2,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 1
  },
  "Ghost": {
    "Normal": 0,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 2,
    "Dragon": 1,
    "Dark": 0.5,
    "Steel": 1,
    "Fairy": 1
  },
  "Dragon": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 2,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 0
  },
  "Dark": {
    "Normal": 1,
    "Fire": 1,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 0.5,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 2,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 2,
    "Dragon": 1,
    "Dark": 0.5,
    "Steel": 1,
    "Fairy": 0.5
  },
  "Steel": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 0.5,
    "Electric": 0.5,
    "Grass": 1,
    "Ice": 2,
    "Fighting": 1,
    "Poison": 1,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 2,
    "Ghost": 1,
    "Dragon": 1,
    "Dark": 1,
    "Steel": 0.5,
    "Fairy": 2
  },
  "Fairy": {
    "Normal": 1,
    "Fire": 0.5,
    "Water": 1,
    "Electric": 1,
    "Grass": 1,
    "Ice": 1,
    "Fighting": 2,
    "Poison": 0.5,
    "Ground": 1,
    "Flying": 1,
    "Psychic": 1,
    "Bug": 1,
    "Rock": 1,
    "Ghost": 1,
    "Dragon": 2,
    "Dark": 2,
    "Steel": 0.5,
    "Fairy": 1
  }
};

BattleTooltips.prototype.showPokemonTooltip = ShowdownEnhancedTooltip.showPokemonTooltip;
BattleTooltips.prototype.showMoveTooltip = ShowdownEnhancedTooltip.showMoveTooltip;
