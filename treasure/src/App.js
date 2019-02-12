import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import config from './secret'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room: {
      roomId: 0,
      title: '',
      coordinates: "",
      exits: [],
      cooldown: 0, //1000 setInterval
      errors: '',
      description: '',
      elevation: 0,
      items: [],
      messages: [],
      playrs: [],
      terrain: ''
      }
    }
  }

 
  
  componentDidMount() {
    const headers = {headers : {Authorization: config.token}}
    axios
    .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', headers)
    .then(response => {
      console.log(response.data)
      this.setState({
        room: response.data
      })
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
