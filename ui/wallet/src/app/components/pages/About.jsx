import React from 'react'
import { APP_NAME, APP_URL } from 'app/client_config'
import tt from 'counterpart'

class About extends React.Component {
  render () {
    return (
      <div className='About'>
        <section className='AboutMission'>
          <div className='AboutMission__heading-container'>
            <h1 className='AboutMission__heading'>
              Blurt.blog Mission, Vision and Values
            </h1>
          </div>
        </section>
      </div>
    )
  }
}

module.exports = {
  path: 'about.html',
  component: About
}
