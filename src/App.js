import React from 'react'
import axios from 'axios'

import { setCaughtIds, getCaughtIds } from './lib/storage'
import StatBars from './components/StatBars'

const speciesURL = 'https://pokeapi.co/api/v2/pokemon-species/'

const types = ['all', 'bug', 'dark', 'dragon', 'electric',
  'fairy', 'fighting', 'fire', 'flying', 'ghost',
  'grass', 'ground', 'ice','normal', 'poison',
  'psychic', 'rock', 'steel', 'water']

function formatName(name) {
  if (name[name.length - 2] === '-') {
    if (name.includes('-f')) {
      return name.replace('-f', '\u2640')
    } else {
      return name.replace('-m', '\u2642')
    }
  } else {
    return name.replace('-', '. ')
  }
}

function App() {
  const [pokemons, setPokemons] = React.useState(null)
  const [currentPokemon, setCurrentPokemon] = React.useState(null)
  const [currentSpecies, setCurrentSpecies] = React.useState(null)
  const [currentEvolutionChain, setCurrentEvolutionChain] = React.useState(null)
  const [selectedType, setSelectedType] = React.useState('all')
  const [sortedPokemons, setSortedPokemons] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [pokedexImageDisplay, setPokedexImageDisplay] = React.useState(' display')
  const [caughtPokemons, setCaughtPokemons] = React.useState(getCaughtIds())

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
        setSortedPokemons(pokemonsArray)
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

  let timer
  const handlePokedexImgDisplay = () => {
    setPokedexImageDisplay('')
    clearTimeout(timer)
    timer = setTimeout(() => {
      setPokedexImageDisplay(' display')
    }, 400)
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

  const handleSort = e => {
    const key = e.target.value.split('-')[0]
    const descending = e.target.value.split('-')[1] === 'descending'
    const pokemonsCopy = JSON.parse(JSON.stringify(pokemons))
    pokemonsCopy.sort((a, b) => (a[key] - b[key]) * (descending ? -1 : 1))
    setSortedPokemons(pokemonsCopy)
    // pokemons.sort((a, b) => (a[key] - b[key]) * (descending ? -1 : 1))
    // setSortedPokemons(pokemons)
  }

  const filteredPokemons = sortedPokemons ? sortedPokemons.filter(pokemon => {
    if (!pokemon.name.includes(searchTerm)) {
      return false
    }
    if (pokemon.types.length > 1) {
      if (pokemon.types[1].type.name === selectedType) {
        return true  
      }
    }
    return pokemon.types[0].type.name === selectedType || selectedType === 'all'
  }) : null

  const catchPokemon = () => {
    let newCaughtPokemons
    if (!caughtPokemons.includes(currentPokemon.id)) {
      newCaughtPokemons = [...caughtPokemons, currentPokemon.id]
    } else {
      newCaughtPokemons = caughtPokemons.filter(id => {
        return id !== currentPokemon.id
      })
    }
    setCaughtPokemons(newCaughtPokemons)
    setCaughtIds(newCaughtPokemons)
  }
  
  return (
    <>
      <div className="background-wrapper">
        <div className="background-pink-shade"></div> 
        {currentPokemon &&
          <>
            <img src='./assets/pokeball.svg'/>
            <div
              className={`background-div-one ${currentPokemon.types[0].type.name}`}
            >
            </div>
            <div
              className={`background-div-one-behind ${currentPokemon.types[0].type.name}`}
            >
            </div>
            <div
              className={`background-div-two ${currentPokemon.types.length > 1 ?
                currentPokemon.types[1].type.name : currentPokemon.types[0].type.name}`}
            >
            </div>
          </>
        }
      </div>
  
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-one-half">
              {currentPokemon && currentSpecies && currentEvolutionChain ?
                <>
                
                  <div className="pokemon-header-wrapper">
                    <p className="selected-pokemon name">{formatName(currentPokemon.name)}</p>    
                    
                    <div className="pokemon-type-label">
                      <p className={`type ${currentPokemon.types[0].type.name}`}>
                        {currentPokemon.types[0].type.name}
                      </p>
                      {currentPokemon.types.length > 1 &&
                        <p className={`type ${currentPokemon.types[1].type.name}`}>
                          {currentPokemon.types[1].type.name}
                        </p>
                      }
                    </div>
                  </div>
                  
                  <div className="img-wrapper">
                    <div className={'shiny ' + pokedexImageDisplay +
                      (caughtPokemons.includes(currentPokemon.id) ? '' : ' invisible')}>
                      <img
                        src={currentPokemon.sprites.versions['generation-iii']['emerald'].front_shiny}
                      />
                    </div>
                    
                    <div className={'pokedex-img' + pokedexImageDisplay}>
                      <img src={currentPokemon.sprites.other['official-artwork'].front_default}/>
                    </div>  

                    <div className={`pokeball-select
                      ${caughtPokemons.includes(currentPokemon.id) ? ' activated' : ''}` +
                      pokedexImageDisplay}>
                      <img 
                        src='./assets/pokeball_blue_heavy.svg'
                        onClick={catchPokemon}
                      />
                    </div>  
                  </div>

                  <div className="evolution-chain">
                    {evolutionChain.map(stage => (
                      <div
                        key={stage[0]}
                        className={stage[1] === currentPokemon.id ? 'selected' : ''}
                        onClick={() => {
                          setCurrentPokemon(pokemons[stage[1] - 1])
                          handlePokedexImgDisplay()
                        }}
                      >
                        <img className="img-hover-effect clickable"
                          src={pokemons[stage[1] - 1].sprites.versions['generation-iii']['emerald'].front_default}/>
                        <p className="name">{formatName(stage[0])}</p>
                      </div>
                    ))}
                  </div>  
                  
                  <div className="pokedex-entry">
                    <div className={`${currentPokemon.types[0].type.name}`}></div>
                    <p>{pokedexEntry}</p>
                  </div>
                  <StatBars currentPokemon={currentPokemon}/>
                </> 
                :
                <img className="loading" src='./assets/pokeball_small.svg'/>
              }
            </div>

            <div className="column is-one-half custom-padding">
              <form>
                <input
                  className="input"
                  type="text"
                  placeholder="Pokémon name"
                  name="name"
                  onInput={(e) => setSearchTerm((e.target.value.toLowerCase()))}
                />
                <select onChange={handleSort}>
                  <option disabled>Order By</option>
                  <option value="id-ascending">ID (#001 → #151)</option>
                  <option value="id-descending">ID (#151 → #001)</option>
                  <option value="height-ascending">Height (Short → Tall)</option>
                  <option value="height-descending">Height (Tall → Short)</option>
                  <option value="weight-ascending">Weight (Light → Heavy)</option>
                  <option value="weight-descending">Weight (Heavy → Light)</option>
                </select>
                <select onChange={e => setSelectedType(e.target.value)} className="pokemon-type-select">
                  <option disabled>Filter By Type</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type.toLowerCase()}</option>
                  ))}
                </select>
                <div className={`type-indicator ${selectedType}`}>
                  {selectedType !== 'all' &&
                    <img src={`./assets/${selectedType}.svg`}/>
                  }
                </div>
              </form>
              <div className="columns is-multiline is-mobile index">
                {filteredPokemons ?
                  filteredPokemons.map(pokemon => (
                    <div
                      key={pokemon.species.name}
                      className="column is-one-quarter"
                    >
                      <img
                        className={`${caughtPokemons.includes(pokemon.id) ? '' : 'shadow'} clickable img-hover-effect`}
                        src={pokemon.sprites.versions['generation-iii']['emerald'].front_default}
                        onClick={() => {
                          setCurrentPokemon(pokemon)
                          handlePokedexImgDisplay()
                        }} 
                      />
                      <p className="name">{formatName(pokemon.species.name)}</p>
                    </div>
                  ))
                  :
                  <div className="load-wrapper">
                    <img className="loading" src='./assets/pokeball_small.svg'/>
                  </div>
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
