import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import config from './secret'

// axios.defaults.headers.common['Authorization'] = config.token
// axios.defaults.headers.post['Content-Type'] = 'application/json'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room_id: 0,
      title: '',
      coordinates: "",
      exits: [],
      cooldown: 0, //1000 setInterval
      errors: '',
      description: '',
      elevation: 0,
      items: [],
      messages: [],
      players: [],
      terrain: ''
    }
  }
  
  componentDidMount() {
    const headers = {headers : {Authorization: config['token']}}
    axios
    .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', headers)
    .then(response => {
      console.log(response.data)
      // functional set State returns the function immediately 
      this.setState(function() { return {
        room_id: response.data.room_id,
        cooldown: response.data.cooldown,
        title: response.data.title,
        elevation: response.data.elevation,
        coordinates: response.data.coordinates,
        exits: response.data.exits
      }})
    })
    .catch(error => {
      console.log(error.response.data)
    })
    this.handleMovement()
  }

  handleMovement(direction) {
    const headers = {headers : {Authorization: config.token}}
    const data = { 
      direction: direction
    }
    axios
      .post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', data, headers)
      .then((response) => { console.log(response.data)
        this.setState(function() { return {
          room_id: response.data.room_id,
          cooldown: response.data.cooldown,
          title: response.data.title,
          elevation: response.data.elevation,
          coordinates: response.data.coordinates,
          exits: response.data.exits
      }})
    })
      .catch((error) => console.error(error.response.data))
  }

  render() {
    return (
      <div className="App">
        <div>Title: {this.state.title}</div>
        <div>Room Id:{this.state.room_id}</div>
        <div>Cooldown: {this.state.cooldown}</div>
        <div>Coordinates: {this.state.coordinates}</div>
        <div>Elevation: {this.state.elevation}</div>
        <div>Exits: {this.state.exits}</div>
        <button onClick={() => this.handleMovement('n')}>N</button>
        <button onClick={() => this.handleMovement('s')}>S</button>
        <button onClick={() => this.handleMovement('e')}>E</button>
        <button onClick={() => this.handleMovement('w')}>W</button>
      </div>
    );
  }
}

export default App;
