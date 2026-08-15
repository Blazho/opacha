import {Button} from "./Button.js";
import {getMousePosition} from "../scripts/helpers/FHelper.js";
import {MenuTab} from "./MenuTab.js";
import {LEVELS, MENU_TABS, SCREENS, UI_SIZE} from "../scripts/config/constants.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";
import {GameEngine} from "../scripts/GameEngine.js";
import {RenderObject, UIScreenObject} from "../scripts/render/RenderObject.js";

export class MainMenu extends UIScreenObject{
    private readonly canvas : HTMLCanvasElement;
    private readonly game: GameEngine

    private menuTabs: UniqueSet<MenuTab, "name">

    constructor(canvas: HTMLCanvasElement) {
        super(SCREENS.MAIN_MENU)
        this.canvas  = canvas;
        this.game = GameEngine.getInstance()
        this.menuTabs = new UniqueSet<MenuTab, "name">("name")

        this.generateTabs()
    }

    //todo review logic
    public load(){
        this.addClickEventListener()
        this.activateTab(MENU_TABS.BASE)
    }

    public update(dt: number) {
    }

    public generateTabs(){
        this.genBaseTab()
        this.genSkirmishTab()
        this.genCampaignTab()
        this.genOptionsTab()
    }

    private genBaseTab() {
        const baseTab = new MenuTab(MENU_TABS.BASE, this.canvas)
        baseTab.addButtons(
            [
                new Button(MENU_TABS.SKIRMISH, UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                    this.activateTab(MENU_TABS.SKIRMISH)
                }),
                new Button(MENU_TABS.CAMPAIGN, UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 200}, () => {
                    this.activateTab(MENU_TABS.CAMPAIGN)
                }),
                new Button(MENU_TABS.OPTIONS, UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 300}, () => {
                    this.activateTab(MENU_TABS.OPTIONS)
                })
            ]
        )
        baseTab.activate()
        this.menuTabs.add(baseTab)
    }

    public activateTab(tabName: typeof MENU_TABS[keyof typeof MENU_TABS]){
        for(const [_, tab] of this.menuTabs.entries()){
            tab.isActive = false
        }

        const tab = this.menuTabs.get(tabName)
        if(tab){
            tab.isActive = true
            console.log("Active tab: ", tab)
        }else {
            console.error("Tab not found")
        }
    }

    private genSkirmishTab(){
        const skirmishTab = new MenuTab(MENU_TABS.SKIRMISH, this.canvas)
        skirmishTab.addButtons([
            new Button("Back", UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
            new Button("Test level", UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y : 200}, () => {
                this.game.loadTestLevel()
                this.game.start()
                console.log("Skirmish tab")
            })
        ])
        this.menuTabs.add(skirmishTab)
    }

    private genCampaignTab(){
        const campaignTab = new MenuTab(MENU_TABS.CAMPAIGN, this.canvas)
        campaignTab.addButtons([
            new Button("Back", UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
                ...this.genCampaignLvlButtons()
        ])
        this.menuTabs.add(campaignTab)
    }

    private genOptionsTab(){
        const optionsTab = new MenuTab(MENU_TABS.OPTIONS, this.canvas)
        optionsTab.addButtons([
            new Button("Back", UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
            new Button("OPTIONS TAB", UI_SIZE.buttonWidth, UI_SIZE.buttonHeight, {x: this.calcXMiddleBtnPos(), y : 200}, () => {
        })
        ])
        this.menuTabs.add(optionsTab)
    }

    /**
     * Generate level's buttons in pattern n x 2
     *
     * n is row/s
     *
     * 2 is columns
     */
    private genCampaignLvlButtons(){
        const listOfBtns: Button[] = []
        let index = 0
        for(const value of Object.values(LEVELS)){
            listOfBtns.push(
                new Button(value,
                    UI_SIZE.buttonWidthS,
                    UI_SIZE.buttonHeightS,
                    {x: this.calcXWithOffset(index), y: this.calcYWithOffset(index)},
                    () => this.game.loadLevel(value))
            )
            index++
        }
        return listOfBtns
    }

    private calcXMiddleBtnPos(){
        return (this.canvas.width / 2) - (UI_SIZE.buttonWidth / 2)
    }

    private calcXWithOffset(index: number){
        const offset = Math.floor(index % 2) * UI_SIZE.buttonWidthS
        return (this.canvas.width / 2) - UI_SIZE.buttonWidthS + offset
    }

    private calcYWithOffset(index: number){
        const offset = Math.floor(index / 2) * 100
        return 200 + offset
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for(const [_, tab] of this.menuTabs.entries()){
            if(tab.isActive){
                tab.draw(ctx)
                break
            }
        }
    }

    private addClickEventListener(){
        this.canvas.addEventListener("click", this.handleClick)
        //todo find better place
        window.addEventListener("keyup", (e) => {
            if(e.code === "Escape"){
                const isConfirmed: boolean = window.confirm("Are you sure you want to exit current game?")
                    if(isConfirmed){
                        console.log("Game level exited")
                        this.game.stop()
                        this.activateTab(MENU_TABS.BASE)
                    }

            }
        })
    }

    private clearClickEventListener(){
        this.canvas.removeEventListener("click", this.handleClick)
    }

    //todo fix to work for all ui
    private handleClick = (e: PointerEvent) => {
        const clickPos = getMousePosition(e, this.canvas)
        let activeTab: MenuTab | undefined
        for(const [_, tab] of this.menuTabs.entries()){
            if(tab.isActive){
                activeTab = tab
                break
            }
        }
        if(activeTab){
            activeTab.processClick(clickPos)
        }else {
            console.error("There are no active menu tabs")
        }

    }

}