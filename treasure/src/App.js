import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import config from './secret';

axios.defaults.headers.common['Authorization'] = config.token;
axios.defaults.headers.post['Content-Type'] = 'application/json';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      room_id: 0,
      title: '',
      coordinates: '',
      exits: [],
      cooldown: 0, //1000 setInterval
      errors: '',
      description: '',
      elevation: 0,
      items: [],
      messages: [],
      players: [],
      terrain: '',
      graph: {}
    };
  }

  getCoordinates = (coordinates) => {
    const x = coordinates.replace(/[%^()]/g, '').split(',')[0];
    const y = coordinates.replace(/[%^()]/g, '').split(',')[1];
    const coordsObject = { x, y };
    return coordsObject;
  };

  inverseDirection = (direction) => {
    const inverseDir = { n: 's', s: 'n', w: 'e', e: 'w' };
    return inverseDir[direction];
  };

  updateGraph = (id, coordinates, exits, prevRoomId = null, direction = null) => {
    let graph = Object.assign({}, this.state.graph);
    if (!this.state.graph[this.state.room_id]) {
      const newGraph = {};
      newGraph['cords'] = coordinates;

      const directions = {};
      for (let exit of this.state.exits) {
        console.log(exit);
        directions[exit] = '?';
      }
      newGraph['exits'] = directions;
      graph = { ...graph, [this.state.room_id]: newGraph };
    }
    if (prevRoomId && direction) {
      console.log(graph[prevRoomId]['exits'][direction]);
      const inverse = this.inverseDirection(direction);
      graph[prevRoomId]['exits'][direction] = this.state.room_id;
      graph[this.state.room_id]['exits'][inverse] = prevRoomId;
    }
    localStorage.setItem('graph', JSON.stringify(graph));
    return graph;
  };

  // backtrack_to_unexplored(starting_vertex_id = this.state.room_id, target = '?') {
  //   const queue = [];
  //   queue.push([starting_vertex_id]);
  //   const visited = [];
  //   while (queue.length > 0) {
  //     let dequeued = queue.shift();
  //     let last_room = dequeued[dequeued.length - 1];
  //     for (let exit in last_room) {
  //       if (last_room[exit] === target) {
  //         dequeued.pop();
  //         return dequeued;
  //       } else {
  //         visited.add(last_room[exit]);
  //         for (let path in this.graph[last_room[exit]].exits) {
  //           if (visited.has(this.graph[last_room[exit]].exits[path]) === false) {
  //             let path_copy = [...dequeued];
  //             path_copy.push({ [path]: this.graph[last_room[exit]].exits[path] });
  //             queue.push(path_copy);
  //             console.log(queue);
  //           }
  //         }
  //         console.log(queue);
  //       }
  //     }
  //   }
  // }

  // path_to_directions(path) {
  //   const current_room = path[0]
  //   const directions = []
  //   for (let i = 1; i < path.length; i++) {
  //     for (let exit in this.graph[current_room]) {
  //       if (i == this.graph[current_room][exit]) {
  //         directions.push(exit)
  //       }
  //       return directions
  //     }
  //   }
  // }

  componentDidMount() {
    const headers = {
      headers: {
        Authorization: config['token']
      }
    };
    if (localStorage.hasOwnProperty('graph')) {
      const graph = JSON.parse(localStorage.getItem('graph'));
      this.graph = graph;
    }
    console.log(this.graph);
    axios
      .get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', headers)
      .then((response) => {
        console.log(response.data);
        // functional set State returns the function immediately
        this.setState(function() {
          return {
            room_id: response.data.room_id,
            cooldown: response.data.cooldown,
            title: response.data.title,
            elevation: response.data.elevation,
            coordinates: response.data.coordinates,
            exits: response.data.exits
          };
        });
        const prev_room_id = this.state.room_id;
        const graph = this.updateGraph(
          this.state.room_id,
          this.getCoordinates(this.state.coordinates),
          this.state.exits,
          prev_room_id
        );
        this.setState({ graph });
      })
      .catch((error) => {
        console.log(error.response.data);
      });
    setTimeout(() => {
      this.handleMovement();
      console.log(this.state.exits);
    }, 500);
  }

  handleMovement(direction) {
    const headers = {
      headers: {
        Authorization: config.token
      }
    };
    const data = {
      direction: direction
    };
    axios
      .post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', data, headers)
      .then((response) => {
        console.log(response.data);
        this.setState(function() {
          return {
            room_id: response.data.room_id,
            cooldown: response.data.cooldown,
            title: response.data.title,
            elevation: response.data.elevation,
            coordinates: response.data.coordinates,
            exits: response.data.exits
          };
        });
        const prev_room_id = this.state.room_id;
        const graph = this.updateGraph(
          this.state.room_id,
          this.getCoordinates(this.state.coordinates),
          this.state.exits,
          prev_room_id,
          direction
        );
      })
      .catch((error) => console.error(error.response.data));
  }

  render() {
    return (
      <div className="App">
        <div> Title: {this.state.title} </div> <div> Room Id: {this.state.room_id} </div>{' '}
        <div> Cooldown: {this.state.cooldown} </div>{' '}
        <div> Coordinates: {this.state.coordinates} </div>{' '}
        <div> Elevation: {this.state.elevation} </div> <div> Exits: {this.state.exits} </div>{' '}
        <button onClick={() => this.handleMovement('n')}> N </button>{' '}
        <button onClick={() => this.handleMovement('s')}> S </button>{' '}
        <button onClick={() => this.handleMovement('e')}> E </button>{' '}
        <button onClick={() => this.handleMovement('w')}> W </button>{' '}
      </div>
    );
  }
}

export default App;
