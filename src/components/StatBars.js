import React from 'react'

function StatBars({ currentPokemon: { stats, types } }) {
  return (
    <div className="columns is-half is-mobile">
      <div className="column is-half columns is-mobile">
        <div className="column is-one-third">
          <div className="stat-wrapper stat-name">
            <p className="stat">HP</p>
          </div>
          <div className="stat-wrapper stat-name">
            <p className="stat">Attack</p>
          </div>
          <div className="stat-wrapper stat-name">
            <p className="stat">Defense</p>
          </div>
        </div>
        <div className="column is-two-thirds">
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[0].base_stat}
              max="150"
            />
          </div>
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[1].base_stat}
              max="150"
            />
          </div>
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[2].base_stat}
              max="150"
            />
          </div>
        </div>
      </div>
      <div className="column is-half is-offset-one-half columns is-mobile">
        <div className="column is-one-third">
          <div className="stat-wrapper stat-name">
            <p className="stat">Speed</p>
          </div>
          <div className="stat-wrapper stat-name">
            <p className="stat">Sp. Attack</p>
          </div>
          <div className="stat-wrapper stat-name">
            <p className="stat">Sp. Defense</p>
          </div>
        </div>
        <div className="column is-two-thirds">
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[5].base_stat}
              max="150"
            />
          </div>
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[3].base_stat}
              max="150"
            />
          </div>
          <div className="stat-wrapper progress-bar">
            <progress
              className={`progress is-small darker ${types[0].type.name}`}
              value={150 - stats[4].base_stat}
              max="150"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatBars