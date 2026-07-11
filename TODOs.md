
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
- [ ] AI fix
* - [ ] Should not supply if is connected to enemy node
* - [ ] Should consider on route army + node army before deciding to attack
- [x] Armies should have count on top of them

## Bugs

- [x] Selected node indicator broken
- [x] Nodes current army is not shown
- [x] Taking nodes should reset the increment of the army
- [ ] Cant directly change target when the node is already sending
* - [x] Change from one attack node to other attack node
* - [x] Change from one supply node to other supply node
* - [ ] Change from one attack node to other supply node
* - [ ] Change from one supply node to other attack node
- [x] Node can be taken when sending/attacking on same path
- [ ] Collision detection overshoot when army moves too fast

## Optional

- [x] Implementation: Attacking should send physical attack circle and not only visual 
- [ ] Render system
- [ ] Change speed of the game or pause
- [ ] More type of nodes
- [x] Path mechanics
- [ ] Optimize num.1
* - [ ] Optimize army logic
* - [ ] Optimize draw paths
* - [ ] checkOptionalNodes::ControlGroup - optimise
- [ ] Map creation tool
- [ ] Level data fetching position in app

## Improvements
- [ ] End game screen
- [ ] Main menu look

## Rejected
- [ ] Main menu is singleton

-----------------------------
### Code styles
- [ ] Private functions at end of class