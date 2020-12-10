import React from 'react'
import axios from 'axios'

function App() {
  const [pokemons, setPokemons] = React.useState([])

  React.useEffect(() => {
    const getData = async () => {
      try {
        const { data: { results } } = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=40')
        const requestsArray = results.map(pokemon => {
          return axios.get(pokemon.url)
        })
        const response = await Promise.all(requestsArray)
        const pokemonsArray = response.map(res => res.data)
        pokemonsArray.sort((a, b) => a.id - b.id)
        setPokemons(pokemonsArray)
      } catch (err) {
        console.log(err)
      }
    }
    getData()
  }, [])
  

  
  console.log(pokemons)

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-one-half">
            </div>
            <div className="column is-one-half is-offset-one-half">
              <div className="columns is-multiline">
                {pokemons ?
                  pokemons.map(pokemon => (
                    <div key={pokemon.species.name} className="column is-one-quarter">
                      <p>{pokemon.species.name}</p>
                      <img
                        className="shadow"
                        src={pokemon.sprites.versions['generation-iii']['emerald'].front_default}
                      />
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
