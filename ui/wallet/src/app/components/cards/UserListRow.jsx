import React from 'react'
import { Link } from 'react-router'

import { connect } from 'react-redux'

class UserListRow extends React.Component {
  render () {
    const { user, loggedIn } = this.props
    return (
      <tr>
        <td>
          <Link to={'/@' + user}>
            <strong>{user}</strong>
          </Link>
        </td>
      </tr>
    )
  }
}

export default connect((state, ownProps) => {
  const loggedIn = state.user.hasIn(['current', 'username'])
  return {
    ...ownProps,
    loggedIn
  }
})(UserListRow)
