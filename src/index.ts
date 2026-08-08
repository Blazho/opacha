import {BasicNode} from "./prefabs/node.js";
import {ControlGroup} from "./scripts/node/ControlGroup.js";
import {PlayerController} from "./scripts/controllers/PlayerController.js";
import {Army} from "./prefabs/Army.js";
import {Path} from "./prefabs/Path.js";
import {AIController} from "./scripts/controllers/AIController.js";
import {Button} from "./ui/Button.js";
import {MainMenu} from "./ui/MainMenu.js";
import {fetchLevel, parseJsonLevel} from "./configs/dataLoader.js";
import {LEVELS, SCREENS} from "./scripts/config/constants.js";
import {UIEngine} from "./scripts/render/UIEngine.js";
import {GameEngine} from "./scripts/GameEngine.js";


const el = document.getElementById("canvas");
if (!(el instanceof HTMLCanvasElement)) {
    throw new Error(`Element canvas is not a valid Canvas.`);
}

const canvas = el;
const context = canvas.getContext("2d");
if (!context) {
    throw new Error("Failed to get Canvas 2D context.");
}
const gameEngine = GameEngine.init("canvas")
const uiEngine = UIEngine.init(canvas)

uiEngine.activate(SCREENS.MAIN_MENU)



