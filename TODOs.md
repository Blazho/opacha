
# TODOs document

## Tasks

- [ ] Working demo
- [x] AI controller
- [x] findNode::ControlGroup - it is allowed to select other nodes
- [x] Take node from enemy
- [x] Enemy armies does not collide with each other
- [x] Endgame screen
- [ ] UI
* - [x] Main menu
* - [ ] Options
- [x] AI fix
* - [x] Should not supply if is connected to enemy node
* - [x] Should consider on route army + node army before deciding to attack
- [x] Armies should have count on top of them

## Bugs

- [x] Selected node indicator broken
- [x] Nodes current army is not shown
- [x] Taking nodes should reset the increment of the army
- [x] Cant directly change target when the node is already sending
* - [x] Change from one attack node to other attack node
* - [x] Change from one supply node to other supply node
* - [x] Change from one attack node to other supply node
* - [x] Change from one supply node to other attack node
- [x] Node can be taken when sending/attacking on same path
- [ ] Collision detection overshoot when army moves too fast
- [ ] Escape confirm does not reset game
* - [x] Nodes continue to send after game ended
* - [ ] AI still trying to process
- [x] Paths are updated twice for each of the two nodes

## Optional

- [x] Implementation: Attacking should send physical attack circle and not only visual 
- [x] Render system
- [ ] Change speed of the game or pause
- [ ] More type of nodes
- * [x] Basic Passive army increment
- * [ ] Defensive %/flat
- * [ ] Income increment depends on number of connections
- * [ ] Army draft - draft army instantly with cost
- * [ ] Random
- [x] Path mechanics
- [ ] Optimize num.1
* - [ ] Optimize army logic
* - [x] Optimize draw paths
* - [ ] checkOptionalNodes::ControlGroup - optimise
- [ ] Map creation tool
- [ ] Level data fetching position in app
- [x] Move update logic from render to update
- [ ] Test level
## Improvements
- [ ] End game screen
- [ ] Main menu look

## Rejected
- [ ] Main menu is singleton

-----------------------------
### Code styles
-  Private functions at end of class