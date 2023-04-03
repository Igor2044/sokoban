import React, {useEffect, useReducer} from "react"

const LEVELS = [ // 0=playground, 1=wall, 2=box, 3=player, 4=storage, 5=empty
    [
        [5,5,5,5,5,5,5,5,5,5],
        [5,1,1,1,1,1,1,1,1,5],
        [5,1,3,0,0,0,0,0,1,5],
        [5,1,0,2,2,0,0,0,1,5],
        [5,1,0,0,1,1,0,1,1,5],
        [5,1,0,0,1,0,0,0,1,5],
        [5,1,0,0,0,0,0,0,1,5],
        [5,1,0,0,1,4,0,4,1,5],
        [5,1,1,1,1,1,1,1,1,5],
        [5,5,5,5,5,5,5,5,5,5]
    ]
]
//             0       1       2         3       4      5              6=full storage
const COLOR = ["#ddd", "#000", "orange", "#00f", "red", "transparent", "green"]

const GAME_STATE = { 
    Running:          "RUNNING", 
    Done:             "DONE" 
}

const GAME_ACTION = {
    Move:             "MOVE", 
    RestartLevel:     "RESTART_LEVEL"
}

const ITEM = {
    Playground:       0,
    Wall:             1,
    Box:              2,
    Player:           3,
    Storage:          4,    
    Empty:            5 
}

const DIRECTION = { 
    Left:             37, 
    Right:            39, 
    Up:               38, 
    Down:             40 
}

const COLOR_IN_PLACE = 6

function getInitialState(levelNo) {
    const LEVEL = LEVELS[levelNo]
    let level = [], player = {x: null, y: null}, box = []
    for (let y=0; y<LEVEL.length; y++) {
      level[y] = []
      for (let x=0; x<LEVEL[y].length; x++) {
        if ( [ITEM.Box, ITEM.Player].includes(LEVEL[y][x]))
          level[y][x] = ITEM.Playground 
        else
          level[y][x] = LEVEL[y][x] 
        if (LEVEL[y][x] === ITEM.Box)
            box.push({x:x, y:y})
        if (LEVEL[y][x] === ITEM.Player)
            player = {x:x, y:y}
      }
    }

    return {
      levelNo:  levelNo,
      status:   GAME_STATE.Running,
      level, player, box
    }
}
  
function Move(state, action) {
    switch (action.type) {
      case GAME_ACTION.RestartLevel:
        return {...getInitialState(state.levelNo), status: GAME_STATE.Running}
      case GAME_ACTION.Move:
        let d = {x: 0, y: 0} 
        console.log(action.keyCode)
        if (DIRECTION.Left === action.keyCode)
            d.x-- 
        if (DIRECTION.Right === action.keyCode) 
            d.x++
        if (DIRECTION.Up === action.keyCode)
            d.y--
        if (DIRECTION.Down === action.keyCode)
            d.y++
        if ( state.level[state.player.y+d.y][state.player.x+d.x] === ITEM.Wall)
            return {...state}
        if ( [...state.box].find(b => b.x===state.player.x+d.x && b.y===state.player.y+d.y) ) {
          if ([ITEM.Playground, ITEM.Storage].includes(state.level[state.player.y+2*d.y][state.player.x+2*d.x])
            && ![...state.box].find(b => b.x === state.player.x+2*d.x && b.y === state.player.y+2*d.y)){
            let newState = {...state, player: {x: state.player.x+d.x, y: state.player.y+d.y}, box: [...state.box].map(b => {
              if ( (b.x === state.player.x+d.x) && (b.y === state.player.y+d.y) ) 
                return {x: b.x+d.x, y: b.y+d.y}
              else
                return b
            } ) }
            let boxesInPlace = 0
            newState.box.forEach(b=>{ if (newState.level[b.y][b.x] === ITEM.Storage) boxesInPlace++ })
            if (boxesInPlace === newState.box.length) return {...newState, status:GAME_STATE.Done}
                return newState
            } else
                return {...state}
        }
        return {...state, player: {x: state.player.x+d.x, y: state.player.y+d.y}}
      default:  
    }
    return state
}
  
function changeColor(y,x, color, player, box, isStorage) {
    if (player.y === y && player.x === x)
        return ITEM.Player
    if (box.find( b => (b.y===y && b.x===x)) && isStorage )
        return COLOR_IN_PLACE
    if (box.find( b => (b.y===y && b.x===x)))
        return ITEM.Box  
    return color
}
  
export default function Game() {
    let [state, dispatch] = useReducer(Move, getInitialState(0) )
    console.log(state)
  
    function handleMove(e) {
      if ( [DIRECTION.Left, DIRECTION.Right, DIRECTION.Up, DIRECTION.Down].includes(e.keyCode) ) {
        e.preventDefault(); 
        dispatch({type: GAME_ACTION.Move, keyCode: e.keyCode}) 
      }
    }
  
    useEffect(() => {
      document.addEventListener('keydown', handleMove); 
      return () => { document.removeEventListener('keydown', handleMove); }
    });  
  
    return (
      <div className="Game">
        <button onClick={()=> dispatch({type: GAME_ACTION.RestartLevel})}>Restart level</button>
          {[...state.level].map( (row, y) => {
            return <div key={`${y}`} style={{display: 'block', lineHeight: 0}}>{
              row.map( (col, x) => {return <div key={`${y}-${x}`} style={{backgroundColor: COLOR[changeColor(y,x, col, state.player, state.box, state.level[y][x]===ITEM.Storage)], 
                width: "20px", height:"20px", display:"inline-block", border: state.level[y][x]===ITEM.Empty ? '1px solid transparent': '1px solid #ccc'}}/>})  
            }</div> 
          })}
      </div>
    );
}