import {BasicNode} from "./prefabs/node.js";
import {ControlGroup} from "./scripts/node/ControlGroup.js";
import {PlayerController} from "./scripts/controllers/PlayerController.js";
import {Army} from "./prefabs/Army.js";
import {Path} from "./prefabs/Path.js";
import {AIController} from "./scripts/controllers/AIController.js";
import {Button} from "./ui/Button.js";
import {MainMenu} from "./ui/MainMenu.js";
import {fetchLevel, parseJsonLevel} from "./configs/dataLoader.js";
import {LEVELS} from "./scripts/config/constants.js";


// fetchLevel(LEVELS.ONE).then(r=> parseJsonLevel(r))



