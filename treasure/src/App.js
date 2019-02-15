import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import config from './secret';

axios.defaults.headers.common['Authorization'] = config.token;
axios.defaults.headers.post['Content-Type'] = 'application/json';

class App extends Component {
  constructor() {
    super();
    this.state = {
      room_id: 0,
      coords: '',
      exits: [],
      cooldown: '',
      errors: [],
      graph: {}
    };
  }
  componentDidMount() {
    if (localStorage.hasOwnProperty('graph')) {
      const graph = JSON.parse(localStorage.getItem('graph'));
      this.setState({ graph });
    }
    const api = 'https://lambda-treasure-hunt.herokuapp.com/api/adv';
    axios
      .get(`${api}/init`)
      .then((res) => {
        const { room_id, coordinates, exits, cooldown } = res.data;
        console.log(res.data);
        this.setState({ room_id, cooldown });
        const prev_room_id = this.state.room_id;
        const graph = this.updateGraph(room_id, this.getCoords(coordinates), exits, prev_room_id);
        this.setState({ graph });
      })
      .catch((err) => console.error(err));
  }

  updateGraph = (id, coords, exits, prevRoomId = null, move = null) => {
    let graph = Object.assign({}, this.state.graph);
    if (!this.state.graph[this.state.room_id]) {
      const newGraph = {};
      newGraph['cords'] = coords;

      const moves = {};
      for (let exit of exits) {
        console.log(exit);
        moves[exit] = '?';
      }
      newGraph['exits'] = moves;
      graph = { ...graph, [this.state.room_id]: newGraph };
    }
    if (prevRoomId && move) {
      console.log(graph[prevRoomId]['exits'][move]);
      const inverseDirection = this.get_inverseDirection(move);
      graph[prevRoomId]['exits'][move] = this.state.room_id;
      graph[this.state.room_id]['exits'][inverseDirection] = prevRoomId;
    }
    localStorage.setItem('graph', JSON.stringify(graph));
    return graph;
  };

  get_inverseDirection = (move) => {
    const inverseDir = { n: 's', s: 'n', w: 'e', e: 'w' };
    return inverseDir[move];
  };

  getCoords = (coordinates) => {
    const x = coordinates.replace(/[%^()]/g, '').split(',')[0];
    const y = coordinates.replace(/[%^()]/g, '').split(',')[1];
    const coordsObject = { x, y };
    return coordsObject;
  };

  handleMovement = (move) => {
    axios
      .post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', {
        direction: move
      })
      .then((res) => {
        const { room_id, coordinates, exits, cooldown } = res.data;
        const prev_room_id = this.state.room_id;
        const graph = this.updateGraph(
          room_id,
          this.getCoords(coordinates),
          exits,
          prev_room_id,
          move
        );
        this.setState({
          room_id,
          coordinates: this.getCoords(coordinates),
          cooldown,
          graph
        });
        console.log(this.state.graph);
        console.log(res.data);
      })
      .catch((err) => console.error(err));
  };

  handleVisualize = () => {
    let graph = JSON.parse(localStorage.getItem('graph'));
    let keys = Object.keys(graph);
    let values = Object.values(graph);
    let coords = Object.values(values);
    let divs = [];
    for (let i = 0; i < keys.length; i++) {
      let divStyle = {
        position: 'absolute',
        width: '20px',
        height: '20px',
        backgroundColor: 'pink',
        left: (coords[i].cords.x - 47) * 30 + 'px',
        top: (coords[i].cords.y - 60) * 30 + 'px'
      };
      divs.push(
        <div className="map-div" key={keys[i]} style={divStyle}>
          {values.room_id}
        </div>
      );
    }
    return divs;
  };

  render() {
    return (
      <div className="App">
        <div>
          <div>
            <div> Title: {this.state.title} </div>
            <div> Room Id: {this.state.room_id}</div>
          </div>
          <button onClick={() => this.handleMovement('n')}>Go North</button>
          <div class="east-west">
            <button onClick={() => this.handleMovement('w')}>Go West</button>
            <button onClick={() => this.handleMovement('e')}>Go East</button>
          </div>
          <button onClick={() => this.handleMovement('s')}>Go South</button>
        </div>
        <div className="map-container">{this.handleVisualize()}</div>
      </div>
    );
  }
}

export default App;
