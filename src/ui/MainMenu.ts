import {Button} from "./Button.js";
import {Game} from "../prefabs/Game.js";
import {getMousePosition} from "../scripts/helpers/FHelper.js";
import {MenuTab} from "./MenuTab.js";
import {LEVELS, MENU_TABS} from "../scripts/config/constants.js";
import {UniqueSet} from "../scripts/helpers/UniqueSet.js";

export class MainMenu{
    private canvas : HTMLCanvasElement;
    private readonly game: Game
    private readonly buttonWidth = 200
    private readonly buttonHeight = 80

    private readonly buttonWidthS = 100
    private readonly buttonHeightS = 80

    private menuTabs: UniqueSet<MenuTab, "name">

    constructor(canvas: HTMLCanvasElement, game: Game) {
        this.canvas  = canvas;
        this.game = game
        this.menuTabs = new UniqueSet<MenuTab, "name">("name")
    }

    public load(){
        this.addClickEventListener()

        this.generateTabs()

        this.draw()
    }

    private generateTabs(){
        this.genBaseTab()
        this.genSkirmishTab()
        this.genCampaignTab()
        this.genOptionsTab()
    }

    private genBaseTab() {
        const baseTab = new MenuTab(MENU_TABS.BASE, this.canvas)
        baseTab.addButtons(
            [
                new Button(MENU_TABS.SKIRMISH, this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                    this.activateTab(MENU_TABS.SKIRMISH)
                }),
                new Button(MENU_TABS.CAMPAIGN, this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 200}, () => {
                    this.activateTab(MENU_TABS.CAMPAIGN)
                }),
                new Button(MENU_TABS.OPTIONS, this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 300}, () => {
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
            this.clearCanvasContext()
            tab.draw()
        }else {
            console.error("Tab not found")
        }
    }

    private clearCanvasContext(){
        const ctx = this.canvas.getContext("2d");
        if(ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }


    private genSkirmishTab(){
        const skirmishTab = new MenuTab(MENU_TABS.SKIRMISH, this.canvas)
        skirmishTab.addButtons([
            new Button("Back", this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
            new Button("Test level", this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y : 200}, () => {
                this.game.loadTestLevel()
                this.game.render()
            })
        ])
        this.menuTabs.add(skirmishTab)
    }

    private genCampaignTab(){
        const campaignTab = new MenuTab(MENU_TABS.CAMPAIGN, this.canvas)
        campaignTab.addButtons([
            new Button("Back", this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
                ...this.genCampaignLvlButtons()
        ])
        this.menuTabs.add(campaignTab)
    }

    private genOptionsTab(){
        const optionsTab = new MenuTab(MENU_TABS.OPTIONS, this.canvas)
        optionsTab.addButtons([
            new Button("Back", this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y: 100}, () => {
                this.activateTab(MENU_TABS.BASE)
            }),
            new Button("OPTIONS TAB", this.buttonWidth, this.buttonHeight, {x: this.calcXMiddleBtnPos(), y : 200}, () => {
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
                new Button(value, this.buttonWidthS, this.buttonHeightS, {x: this.calcXWithOffset(index), y: this.calcYWithOffset(index)}, () => this.game.loadLevel(value))
            )
            index++
        }
        return listOfBtns
    }

    private calcXMiddleBtnPos(){
        return (this.canvas.width / 2) - (this.buttonWidth / 2)
    }

    private calcXWithOffset(index: number){
        const offset = Math.floor(index % 2) * this.buttonWidthS
        return (this.canvas.width / 2) - this.buttonWidthS + offset
    }

    private calcYWithOffset(index: number){
        const offset = Math.floor(index / 2) * 100
        return 200 + offset
    }

    private draw(){
        const ctx = this.canvas.getContext("2d");
        if(ctx){
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            for(const [_, tab] of this.menuTabs.entries()){
                if(tab.isActive){
                    tab.draw()
                    break
                }
            }
        }
    }

    private addClickEventListener(){
        this.canvas.addEventListener("click", this.handleClick)
        window.addEventListener("keyup", (e) => {
            if(e.code === "Escape"){
                const isConfirmed: boolean = window.confirm("Are you sure you want to exit current game?")
                    if(isConfirmed){
                        this.game.stopGame()
                        this.activateTab(MENU_TABS.BASE)
                    }

            }
        })
    }

    private clearClickEventListener(){
        this.canvas.removeEventListener("click", this.handleClick)
    }

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