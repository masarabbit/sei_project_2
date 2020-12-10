import React from 'react'
import axios from 'axios'

const speciesURL = 'https://pokeapi.co/api/v2/pokemon-species/'
const spritePath = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/'
const versionPath = 'generation-iii/emerald/'

const types = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 
  'normal', 'poison', 'psychic', 'rock', 'steel', 'water']

function App() {
  const [pokemons, setPokemons] = React.useState(null)
  const [currentPokemon, setCurrentPokemon] = React.useState(null)
  const [currentSpecies, setCurrentSpecies] = React.useState(null)
  const [currentEvolutionChain, setCurrentEvolutionChain] = React.useState(null)
  // const [selectedType, setSelectedType] = React.useState(null)

  React.useEffect(() => {
    const getData = async () => {
      try {
        const { data: { results } } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151')
        const requestsArray = results.map(pokemon => {
          return axios.get(pokemon.url)
        })
        const response = await Promise.all(requestsArray)
        const pokemonsArray = response.map(res => res.data)
        pokemonsArray.sort((a, b) => a.id - b.id)
        setPokemons(pokemonsArray)
        setCurrentPokemon(pokemonsArray[0])
      } catch (err) {
        console.log(err)
      }
    }
    getData()
  }, [])

  React.useEffect(() => {
    const getData = async () => {
      try {
        const { data: speciesData } = await axios.get(speciesURL + currentPokemon.name)
        const { data: evolutionData } = await axios.get(speciesData.evolution_chain.url)
        setCurrentSpecies(speciesData)
        setCurrentEvolutionChain(evolutionData)
      } catch (err){
        console.log(err)
      }  
    }
    getData()
  }, [currentPokemon])

  let pokedexEntry
  if (currentSpecies) {
    let i = 0
    while (currentSpecies.flavor_text_entries[i].language.name !== 'en') {
      i++
    }
    pokedexEntry = currentSpecies.flavor_text_entries[i].flavor_text
  }

  let evolutionChain = []
  if (currentEvolutionChain) {
    evolutionChain.push([currentEvolutionChain.chain.species.name,
      Number(currentEvolutionChain.chain.species.url.split('/')[6])])
    if (currentEvolutionChain.chain.evolves_to.length > 0) {
      for (let i = 0; i < currentEvolutionChain.chain.evolves_to.length; i++) {
        evolutionChain.push([currentEvolutionChain.chain.evolves_to[i].species.name,
          Number(currentEvolutionChain.chain.evolves_to[i].species.url.split('/')[6])])
      }
      if (currentEvolutionChain.chain.evolves_to[0].evolves_to.length > 0) {
        evolutionChain.push([currentEvolutionChain.chain.evolves_to[0].evolves_to[0].species.name,
          Number(currentEvolutionChain.chain.evolves_to[0].evolves_to[0].species.url.split('/')[6])])
      }
    }
    evolutionChain = evolutionChain.filter(stage => {
      return stage[1] <= 151
    })
  }

  // const filteredPokemons = pokemons ? pokemons.filter(pokemon => {
  //   if (pokemon.types.length > 1) {
  //    if (pokemon.types[1].type.name === selectedType) {
  //      return true  
  //    }
  //  return pokemon.types[0].type.name === selectedType ||
  //    
  // }) : null
  
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-one-half">
              {currentPokemon && currentSpecies && currentEvolutionChain ?
                <>
                  <div className="evolution-chain">
                    {evolutionChain.map(stage => (
                      <div
                        key={stage[0]}
                        className={stage[1] === currentPokemon.id ? 'selected' : ''}
                        onClick={() => setCurrentPokemon(pokemons[stage[1] - 1])}
                      >
                        <p className="name">{stage[0]}</p>
                        <img src={`${spritePath}${versionPath}${stage[1]}.png`}/>
                      </div>
                    ))}
                  </div>  
                  <p className="name">{currentPokemon.name}</p>
                  {/* <img className="bigger" src={currentPokemon.sprites.versions['generation-iii']['emerald'].front_default}/> */}
                  <img src={currentPokemon.sprites.other['official-artwork'].front_default}/>
                  <p>{pokedexEntry}</p>
                  <p className={`type ${currentPokemon.types[0].type.name}`}>
                    {currentPokemon.types[0].type.name}
                  </p>
                  {currentPokemon.types.length > 1 &&
                    <p className={`type ${currentPokemon.types[1].type.name}`}>
                      {currentPokemon.types[1].type.name}
                    </p>
                  }
                  {currentPokemon.stats.map(st => (
                    <div key={st.stat.name}>
                      <p className="stats">{st.stat.name}</p>
                      <p>{st.base_stat}</p>
                    </div>
                  ))
                  
                  }
                </> 
                :
                <p>...loading</p>
              }
            </div>
            <div className="column is-one-half is-offset-one-half">
              <form>
                <input
                  className="input"
                  placeholder="pokémon name"
                  name="name"
                />
                <select>
                  {types.map(type => (
                    <option key={type} className={`type ${type}`}>{type}</option>
                  ))}
                </select>
                <div className="type_indicator">
                  <img src="./assets/bug.svg"/>
                </div>
              </form>
              <div className="columns is-multiline">
                {pokemons ?
                  pokemons.map(pokemon => (
                    <div
                      key={pokemon.species.name}
                      className="column is-one-quarter"
                      onClick={() => setCurrentPokemon(pokemon)}
                    >
                      <img
                        className=""
                        src={pokemon.sprites.versions['generation-iii']['emerald'].front_default}
                      />
                      {pokemon.species.name[pokemon.species.name.length - 2] === '-' ?
                        pokemon.species.name.includes('-f') ?
                          <p className="name">{pokemon.species.name.replace('-f','')}&#9792;</p>
                          :
                          <p className="name">{pokemon.species.name.replace('-m','')}&#9794;</p>
                        :
                        <p className="name">{pokemon.species.name.replace('-','. ')}</p>
                      }
                    </div>
                  ))
                  :
                  <p>...loading</p>
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default App
