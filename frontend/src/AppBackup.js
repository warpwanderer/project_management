// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


import './App.css';
import axios from 'axios';
import React from 'react';

class App extends React.Component {
  state = { details: [], }

  componentDidMount() {
    let data;
    axios.get('http://127.0.0.1:8000/api/roles/')
      .then(res => {
        data = res.data;
        this.setState({
          details: data
        });
      })
      .catch(err => {
        console.log(err);
      })
  }
  render() {
    return (
      <div>
        {this.state.details.map(role => (
          <div key={role.role_id}>
            <h2>{role.role_name}</h2>
          </div>
        ))}
      </div>
    )
  }
}

export default App;