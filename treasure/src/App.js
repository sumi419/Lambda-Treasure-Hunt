import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import config from './secret'

class App extends Component {
  componentDidMount() {
    const headers = {headers : {Authorization: config.token}}
    axios
    .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', headers)
    .then(response => {
      console.log(response.data)
    })
    .catch(error => {
      console.log(error.response.data)
    })
  }

  render() {
    return (
      <div className="App">
        Hi
      </div>
    );
  }
}

export default App;
