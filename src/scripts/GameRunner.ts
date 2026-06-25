import {Game} from "../prefabs/Game.js";


const app = document.getElementById("app")

const gameObject = Game.getInstance(app)

gameObject.init()

gameObject.loadTestLevel()

gameObject.render()

