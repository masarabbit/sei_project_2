import React from 'react'
import axios from 'axios'

const speciesURL = 'https://pokeapi.co/api/v2/pokemon-species/'
const spritePath = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/'
const versionPath = 'generation-iii/emerald/'

const types = ['all', 'bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting',
  'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 
  'normal', 'poison', 'psychic', 'rock', 'steel', 'water']

function App() {
  const [pokemons, setPokemons] = React.useState(null)
  const [currentPokemon, setCurrentPokemon] = React.useState(null)
  const [currentSpecies, setCurrentSpecies] = React.useState(null)
  const [currentEvolutionChain, setCurrentEvolutionChain] = React.useState(null)
  const [selectedType, setSelectedType] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')

  const [pokedexImageDisplay,setPokedexImageDisplay] = React.useState(' display')

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


  let timer
  const handleImageLoad = () => {
    setPokedexImageDisplay('')
    clearTimeout(timer)
    timer = setTimeout(() => {
      setPokedexImageDisplay(' display')
    }, 200)
    
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
    setPokemons(pokemonsCopy)
  }

  const filteredPokemons = pokemons ? pokemons.filter(pokemon => {
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
                    <p className="selected-pokemon name">{currentPokemon.name}</p>    

                    <p className={`type ${currentPokemon.types[0].type.name}`}>
                      {currentPokemon.types[0].type.name}
                    </p>
                    {currentPokemon.types.length > 1 &&
                      <p className={`type ${currentPokemon.types[1].type.name}`}>
                        {currentPokemon.types[1].type.name}
                      </p>
                    }
                  </div>
                  
                  <div className="img_wrapper">
                    {/* <img className="bigger" src={currentPokemon.sprites.versions['generation-iii']['emerald'].front_default}/> */}
                    <img className={'pokedex_img' + pokedexImageDisplay} src={currentPokemon.sprites.other['official-artwork'].front_default}/>
                  </div>

                  <div className="evolution-chain">
                    {evolutionChain.map(stage => (
                      <div
                        key={stage[0]}
                        className={stage[1] === currentPokemon.id ? 'selected' : ''}
                        onClick={() => {
                          setCurrentPokemon(pokemons[stage[1] - 1])
                          handleImageLoad()
                        }}
                      >
                        <img src={`${spritePath}${versionPath}${stage[1]}.png`}/>
                        <p className="name">{stage[0]}</p>
                      </div>
                    ))}
                  </div>  
                  
                  <div className="pokedex-entry">
                    <div className={`${currentPokemon.types[0].type.name}`}></div>
                    <p>{pokedexEntry}</p>
                  </div>        
                  {currentPokemon.stats.map(st => (
                    <div key={st.stat.name}>
                      <p className="stats">{st.stat.name}</p>
                      <p>{st.base_stat}</p>
                    </div>
                  ))
                  
                  }
                </> 
                :
                <img className="loading" src='./assets/pokeball_small.svg'/>
              }
            </div>
            <div className="column is-one-half is-offset-one-half">
              <form>
                <input
                  className="input"
                  type="text"
                  placeholder="pokémon name"
                  name="name"
                  onInput={(e) => setSearchTerm(e.target.value)}
                />
                <select onChange={handleSort}>
                  <option disabled>Sort By</option>
                  <option value="id-ascending">ID (ascending)</option>
                  <option value="id-descending">ID (descending)</option>
                  <option value="height-ascending">Height (Short -{'>'} Long)</option>
                  <option value="height-descending">Height (Long -{'>'} Short)</option>
                  <option value="weight-ascending">Weight (Light -{'>'} Heavy)</option>
                  <option value="weight-descending">Weight (Heavy {'→'} Light)</option>
                </select>
                <select onChange={e => setSelectedType(e.target.value)}>
                  {types.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
                {selectedType !== 'all' &&
                  <div className={`type_indicator ${selectedType}`}>
                    <img src={`./assets/${selectedType}.svg`}/>
                  </div>
                }
              </form>
              <div className="columns is-multiline">
                {filteredPokemons ?
                  filteredPokemons.map(pokemon => (
                    <div
                      key={pokemon.species.name}
                      className="column is-one-quarter"
                      onClick={() => {
                        setCurrentPokemon(pokemon)
                        handleImageLoad()
                      }}
                    >
                      <img
                        className="shadow"
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
                  <p>
                    ...loading
                    <img className="loading" src='./assets/pokeball_small.svg'/>
                  </p>
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
