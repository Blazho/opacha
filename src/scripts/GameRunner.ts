import {Game} from "../prefabs/Game.js";
import {LEVELS} from "./config/constants.js";


const app = document.getElementById("app")

const gameObject = Game.getInstance(app)

gameObject.init()

// gameObject.loadTestLevel()

gameObject.loadLevel(LEVELS.ONE)
gameObject.render()

