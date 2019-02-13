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
    this.graph = {
      0: [{x: 'x', y: 'y'}, {"n": "?", "e": "?", "s": "?", "w": "?"}]
    }
    this.traversalPath = []
  }
  

  // creates exit obj
  createExitObj() {
    const coordinatesObj = {
      x: this.state.coordinates.replace(/["()]/gi, '').split(",")[0],
      y: this.state.coordinates.replace(/["()]/gi, '').split(",")[1]
    }
    const exitObj = {}
    if (!this.graph[`Room ${this.state.room_id}`]) {
      for (let exit of this.state.exits) {
        exitObj[exit] = '?'
      }
      this.graph[`Room ${this.state.room_id}`] = [coordinatesObj, exitObj]
    }
    //value of graph at room id gives you (coordinates, exitObj)
    return this.graph[`Room ${this.state.room_id}`]
  }

  startTraversal() {
    console.log("in here")
    const inverse_directions = {'n': 's', 's': 'n', 'e': 'w', 'w': 'e'}
    const currentRoomExits = this.state.exits
    console.log(currentRoomExits)


    const unexploredExits = []
    // look for ?s to append to unexplored 
    for (let direction of currentRoomExits) {
      if (direction === '?' ){
          unexploredExits.push(direction)
      }
      if (unexploredExits.length > 0) {
        const firstExit =  unexploredExits[0]
        this.traversalPath.push(firstExit)
        const prev_room_id = this.state.room_id
        this.handleMovement(direction)

      }
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
    setTimeout(() => {
      this.handleMovement()
      this.startTraversal()
      this.createExitObj()
      console.log(this.state.exits)
    }, 500)
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
