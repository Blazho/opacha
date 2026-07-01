import {BasicNode} from "./prefabs/node.js";
import {ControlGroup} from "./scripts/node/ControlGroup.js";
import {PlayerController} from "./scripts/controllers/PlayerController.js";
import {Army} from "./prefabs/Army.js";
import {Path} from "./prefabs/Path.js";
import {AIController} from "./scripts/controllers/AIController.js";
import {Button} from "./ui/Button.js";
import {MainMenu} from "./ui/MainMenu.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement
if(canvas){
    const mainMenu = new MainMenu(canvas)
    mainMenu.load()
}


