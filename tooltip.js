let ShowdownEnhancedTooltip = {};

// Save a reference to the original method
const originalShowPokemonTooltip = BattleTooltips.prototype.showPokemonTooltip;

const originalShowMoveTooltip = BattleTooltips.prototype.showMoveTooltip;

let addonEnabled = false; // default
let toggleStats = false;
let toggleMovesets = false;

window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'PS_ADDON_ENABLED') {
    console.log('[Injected] addonEnabled set to', addonEnabled);
    addonEnabled = event.data.value === true;
  }
  if (event.data && event.data.type === 'PS_TOGGLE_STATS') {
    toggleStats = event.data.value === true;
  } 
  if (event.data && event.data.type === 'PS_TOGGLE_MOVESETS') {
    toggleMovesets = event.data.value === true;
  }
});

let randSets = {};

// Fetch JSON data from the URL
fetch('https://raw.githubusercontent.com/pkmn/randbats/main/data/gen9randombattle.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    //console.log(data); // Process the JSON data as needed
    
    randSets = data;
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });


//**************************************************/
// HELPER FUNCTIONS //
//**************************************************/

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

function calculateDamage(move, activeStats, foeStats, activePokemonBaseSpecies, foePokemonBaseSpecies, activePokemon, foeActivePokemon, adjustedBasePower) {
  //gets the damage of the move, then using the base power, attacker's attack, defender's defense, and the level, calculates the damage
  if (adjustedBasePower === 0) return [0, 0];
  console.log(move);
  console.log(activeStats);
  console.log(foeStats);
  console.log(activePokemonBaseSpecies);
  console.log(foePokemonBaseSpecies);
  console.log(activePokemon);
  console.log(foeActivePokemon);
  console.log(adjustedBasePower)

  let level = activePokemon.level;

  //calculate the damage, we have the stats, the base power, level, and type
  let attacker = 0;
  let defender = 0;
  if(move.id === 'foulplay'){
    attacker = foeStats.atk;
    defender = foeStats.def;
  }
  else if(move.id === 'bodypress'){
    attacker = activeStats.def;
    defender = foeStats.def;
  }
  else if(move.id === 'psyshock' || move.id === 'psystrike') {
    attacker = activeStats.spa;
    defender = foeStats.def;
  }
  // else if(move.id === 'knockoff'){

  // }
  else if(move.id === 'terablast') {
    if (activePokemon.terastallized) {
      console.log("Terrastallized move detected");
      console.log(move);
    }
    else {
      attacker = activeStats.spa;
      defender = foeStats.spd;
    }
  }
  else if(move.category === 'Special') {
    attacker = activeStats.spa;
    defender = foeStats.spd;
  }
  else if(move.category === 'Physical') {
    attacker = activeStats.atk;
    defender = foeStats.def;
  }

  //attacking pokemon item
  //if life orb add 1.3 to the adjustedBasePower
  if (activePokemon.item && activePokemon.item === 'lifeorb') {
    attacker *= 1.3;
  }



  //defending pokemon item
  //eviolite
  if(foeActivePokemon.item && foeActivePokemon.item === 'eviolite') {
    defender *= 1.5;
  }
  //assault vest
  else if(foeActivePokemon.item && foeActivePokemon.item === 'assaultvest' && move.category === 'Special') {
    defender *= 1.5;
  }

  //active pokemon ability
  //if sword of ruin
  if (activePokemon.ability && activePokemon.ability === 'swordofruin' && move.category === 'Physical') {
    defender *= 0.75;
  }
  //if beads of ruin
  else if (activePokemon.ability && activePokemon.ability === 'beadsofruin' && move.category === 'Special') {
    defender *= 0.75;
  }
  //TODO: unaware?, adaptability, sheer force, technician, huge power, pure power, simple, power spot

  //defending pokemon ability
  //if vessel of ruin
  if (foeActivePokemon.ability && foeActivePokemon.ability === 'vesselofruin' && move.category === 'Special') {
    attacker *= 0.75;
  }
  //if tablets of ruin
  else if (foeActivePokemon.ability && foeActivePokemon.ability === 'tabletsofruin' && move.category === 'Physical') {
    attacker *= 0.75;
  }
  //TODO: fur coat, multiscale, filter, fluffy

  let activeType1 = activePokemonBaseSpecies.types[0];
  let activeType2 = activePokemonBaseSpecies.types[1];
  let terraType = activePokemon.terastallized;

  let foeTerraType = foeActivePokemon.terastallized;

  let foeType1 = "";
  let foeType2 = "";

  if (foeTerraType) {
    foeType1 = foeTerraType;
  }
  else {
    foeType1 = foePokemonBaseSpecies.types[0];
    foeType2 = foePokemonBaseSpecies.types[1];
  }

  // Use typeEffectivenessChart to calculate type effectiveness
  let typeEffectiveness = typeEffectivenessChart[move.type][foeType1] * (foeType2 ? typeEffectivenessChart[move.type][foeType2] : 1);

  let stab = move.type === activeType1 || move.type === activeType2 || move.type === terraType ? 1.5 : 1;

  if(adjustedBasePower === undefined) {
    adjustedBasePower = move.basePower;
  }

  // damage floor
  let damageFloor = ((((2 * level)/5 + 2) * adjustedBasePower * (attacker/defender)) / 50 + 2) * 0.85 * typeEffectiveness * stab;

  // damage ceiling
  let damageCeiling = ((((2 * level)/5 + 2) * adjustedBasePower * (attacker/defender)) / 50 + 2) * 1 * typeEffectiveness * stab;

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


//**************************************************/
// OVERRIDING TOOLTIP FUNCTIONS //
//**************************************************/

ShowdownEnhancedTooltip.showPokemonTooltip = function showPokemonTooltip(clientPokemon, serverPokemon, isActive, illusionIndex) {
  // Call the original method
  let text = originalShowPokemonTooltip.call(this, clientPokemon, serverPokemon, isActive, illusionIndex);

  if (!addonEnabled) {
    return text;
  }

  //console.log(clientPokemon);
  //console.log(serverPokemon);


  //calculateModifiedStats(clientPokemon: Pokemon | null, serverPokemon: ServerPokemon, statStagesOnly?: boolean) {

  // if not users pokemon
  if (!serverPokemon) {
    if (!clientPokemon) throw new Error('Must pass either clientPokemon or serverPokemon');

    text += '<hr style="border: 1px solid black; margin: 5px 0;">';

    //console.log(clientPokemon.name);
    // Use the getBaseSpecies method
    let baseSpecies = clientPokemon.getBaseSpecies();
    //let baseStats = baseSpecies.baseStats;
    let stats = calculateStats(baseSpecies, clientPokemon.level);
    let boosts = clientPokemon.boosts;

    let modifiedStats = boostStats(stats, boosts);

    let buf = '';

    if (toggleStats) {
      buf += '<p>';
      console.log("stats enabled");

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

    }

    if (toggleMovesets) {

      let sets = randSets[baseSpecies.name]
      //if sets are undefined
      if (!sets) {
        sets = randSets[baseSpecies.baseSpecies];
      }
      // Get revealed/used moves for the opponent's Pokémon from moveTrack
      let revealedMoves = [];
      if (clientPokemon.moveTrack && Array.isArray(clientPokemon.moveTrack)) {
        revealedMoves = clientPokemon.moveTrack.map(m => m[0].toLowerCase());
      }

      //console.log(sets['roles']);

      // Only keep roles that contain all revealed moves
      if (revealedMoves.length > 0) {
        for (const roleName of Object.keys(sets['roles'])) {
          const role = sets['roles'][roleName];
          // If any revealed move is not in this role's moves, remove the role
          if (!revealedMoves.every(m => role["moves"].map(x => x.toLowerCase()).includes(m))) {
            delete sets['roles'][roleName];
          }
        }
      }

      //for all roles check if only 1 possibility for item
      let uniqueItems = [...new Set(Object.values(sets['roles']).flatMap(role => role.items.map(item => item.toLowerCase().replace(/\s+/g, ''))))];

      //for all abilities check if only 1 possibility for ability
      let uniqueAbilities = [...new Set(Object.values(sets['roles']).flatMap(role => role.abilities.map(ability => ability.toLowerCase().replace(/\s+/g, ''))))];


      //buf += '<p>';

      for (const roleName in sets['roles']) {
          const role = sets['roles'][roleName];
          buf += '<p>';
          buf += `<strong>${roleName}</strong><br>`;
          buf += `Abilities: ${role["abilities"].join(', ')}<br>`;
          buf += `Items: ${role["items"] && role["items"].length > 0 ? role["items"].join(', ') : 'None'}<br>`;
          buf += `Tera Types: ${role["teraTypes"].join(', ')}<br>`;
          buf += `Moves: <br>`;

          for (const moveName of role["moves"]) {
            let move = this.battle.dex.moves.get(moveName);
            let moveTypeClass = `PS-type-${move.type}`;

            let dRText = '';
            let colorBox = `<span class="PS-type-color PS-type-${move.type}"></span>`;
            let moveSpan = `${colorBox}${moveName} `;
            if (revealedMoves.includes(moveName.toLowerCase())) {
              dRText = `<strong>${moveSpan}</strong>`;
            } else {
              dRText = moveSpan;
            }
            if (clientPokemon.side.foe.active[0]) {
              let foePokemonBaseSpecies = clientPokemon.side.foe.active[0].getBaseSpecies();
              //let baseStats = baseSpecies.baseStats;
              let foeStats = calculateStats(foePokemonBaseSpecies, clientPokemon.side.foe.active[0].level);
              foeStats = boostStats(foeStats, clientPokemon.side.foe.active[0].boosts);
            
              //console.log(clientPokemon.name);
              // Use the getBaseSpecies method
              let activePokemonBaseSpecies = clientPokemon.getBaseSpecies();
              //let baseStats = baseSpecies.baseStats;
              let activeStats = calculateStats(activePokemonBaseSpecies, clientPokemon.level);
              activeStats = boostStats(activeStats, clientPokemon.boosts);
              let damageRange;

              //if opponent has assault vest as it's only item, add the item to the clientPokemon.side.foe.active[0]
              if(uniqueItems.length === 1) {
                clientPokemon.item = uniqueItems[0];
              }
              //if opponent has only 1 ability, add the ability to the clientPokemon.side.foe.active[0]
              if(uniqueAbilities.length === 1) {
                clientPokemon.ability = uniqueAbilities[0];
              }

              //TODO: figure out how to get your own pokemon in this tooltip

              console.log("My Pokemon: ");
              console.log(this.battle.myPokemon);

              damageRange = calculateDamage(move, activeStats, foeStats, activePokemonBaseSpecies, foePokemonBaseSpecies, clientPokemon, clientPokemon.side.foe.active[0]);

                //console.log(move.name + " damage range: " + damageRange);

              //turn into percentage
              damageRange[0] = (damageRange[0] / foeStats.hp * 100).toFixed(1);
              damageRange[1] = (damageRange[1] / foeStats.hp * 100).toFixed(1);
              
              if (isNaN(damageRange[0]) || isNaN(damageRange[1])) {
                dRText += 'N/A';
              } else {
                dRText += damageRange[0] + "% - " + damageRange[1] + "%";
              }

              //this.showMoveTooltip(move, false, clientPokemon, clientPokemon.side.foe.active[0], false);

              
            }
            buf += dRText + '<br>';

          }
          buf += '</p>';
      }

    }
    //buf += '</p>';


    // buf += '<p>';
    // buf += JSON.stringify(randSets[baseSpecies.name]);
    // buf += '</p>';


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
  else {
    //placeholder for your pokemon
  }


  return text;//originalContent+"<img src=\"https://play.pokemonshowdown.com/sprites/types/Fairy.png\" alt=\"Fairy\" height=\"14\" width=\"32\" class=\"pixelated\" />";
}

ShowdownEnhancedTooltip.showMoveTooltip = function showMoveTooltip(move, isZOrMax, pokemon, serverPokemon, gmaxMove) {
  // Call the original method
  let text = originalShowMoveTooltip.call(this, move, isZOrMax, pokemon, serverPokemon, gmaxMove);

  if (!addonEnabled) {
    return text;
  }

  //console.log(serverPokemon);

  let value = new ModifiableValue(this.battle, pokemon, serverPokemon);
  let [moveType, category] = this.getMoveType(move, value, gmaxMove || isZOrMax === 'maxmove');
  let categoryDiff = move.category !== category;

  text += '<hr style="border: 1px solid black; margin: 5px 0;">';

  // text += '<h2>' + move.name + '<br />';

  // text += Dex.getTypeIcon(moveType);
  // text += ` ${Dex.getCategoryIcon(category)}</h2>`;

  // Use the getBaseSpecies method
  let foePokemonBaseSpecies = pokemon.side.foe.active[0].getBaseSpecies();
  //let baseStats = baseSpecies.baseStats;
  let foeStats = calculateStats(foePokemonBaseSpecies, pokemon.side.foe.active[0].level);
  foeStats = boostStats(foeStats, pokemon.side.foe.active[0].boosts);

  // Use the getBaseSpecies method
  let activePokemonBaseSpecies = pokemon.side.active[0].getBaseSpecies();
  //let baseStats = baseSpecies.baseStats;
  
  //let activeStats = calculateStats(activePokemonBaseSpecies, pokemon.side.active[0].level);
  //activeStats = boostStats(activeStats, pokemon.side.active[0].boosts);

                                                                                //true to stat changes only means don't take into account items or abilities ect
  let modifiedStats = BattleTooltips.prototype.calculateModifiedStats.call(this, pokemon, serverPokemon);

  let activeTarget = pokemon.side.foe.active[0]
  let moveBasePower = BattleTooltips.prototype.getMoveBasePower.call(this, move, moveType, value, activeTarget).value;

  let damageRange = calculateDamage(move, modifiedStats, foeStats, activePokemonBaseSpecies, foePokemonBaseSpecies, serverPokemon, pokemon.side.foe.active[0], moveBasePower);
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
    "Rock": 2,
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
    "Ice": 2,
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
    "Bug": 0.5,
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
    "Poison": 0.5,
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
    "Psychic": 2,
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
