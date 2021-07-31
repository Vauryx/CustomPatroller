class Patroller 
{
    constructor() 
    {
      this.tokens = [];
      this.executePatrol = false;
      this.started = false;
      this.delay = game.settings.get("pathpatroller", "patrolDelay") || 2500;
      this.pathCoords = [];
      this.pathsInUse = [];
      //this.justReset = [];
    }

    static get()
    {
        return new Patroller();
    }
    async patrolSetDelay(ms) {
        setTimeout(() => {
          this.executePatrol = true;
        }, ms);
      }

    startPatrol()
    {   
        //console.log("Starting patrols...")
        this.mapTokensAndPaths();
        this.patrolSetDelay(this.delay);
        canvas.app.ticker.add(this.doPatrol);
    }

    async resetPathIndex()
    {
        this.mapTokensAndPaths;
        let resetToRandomNode = game.settings.get("pathpatroller", "resetToRandomNode") || false;
        let patrolPath;
        for (let token of this.tokens)
        {
            if (this.pathCoords != undefined)
            {
               let  pathName = token.tokenDocument.document.getFlag("pathpatroller", "patrolPath");
                let pathID = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName))[0].id;
                patrolPath = this.pathCoords.filter((coordSet) => 
                {
                    if(coordSet.patrolPath.includes(pathID))
                    {
                        return coordSet;
                    }
                });
            }
            if(resetToRandomNode)
            {
                await token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", Number(Math.floor(Math.random() * patrolPath.length)));
            }
            else
            {
                await token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", 0);
            }           
        }
        
    }
    
    stopPatrol()
    {
        canvas.app.ticker.remove(this.doPatrol);
    }

    async doPatrol()
    {
        if (_patrol.executePatrol && !game.paused && !game.combat?.started && _patrol.started && _patrol.pathCoords[0] != undefined) 
        {
            _patrol.executePatrol = false;
            _patrol.patrolSetDelay(_patrol.delay);
            let updates = [];
            let pathName = "";
            let pathID = "";
            let patrolPath = [];
            let patrolPathGroup = [];
            let isMultiPath = false;
            var currentPathIndex = 0;
            let name = "";
            let id = "";
            let nextPathID = "";
            for (let token of _patrol.tokens) 
            {
                name = token.tokenDocument.data.name;
                id = token.tokenDocument.id;
                //console.log("Patroller Log For: " + name + " - " + id +" -------------------------------");
               // if(_patrol.justReset.includes(id))
               // {
                //    console.log("Just reset!");
                //    currentPathIndex = 0;
               // } 
              //  else
              //  {
               //     console.log("Have not reset!");
               //     currentPathIndex = Number(token.tokenDocument.document.getFlag("pathpatroller", "pathIndex")); 
               // }
                currentPathIndex = await Number(token.tokenDocument.document.getFlag("pathpatroller", "pathIndex")); 
                if (token.tokenDocument._controlled) 
                {
                    continue;
                }
                if (_patrol.pathCoords != undefined)
                {
                    pathName = token.tokenDocument.document.getFlag("pathpatroller", "patrolPath");

                    if(token.tokenDocument.document.getFlag("pathpatroller", "multiPath"))
                    {
                        isMultiPath = true;
                        patrolPathGroup = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName));
                    }
                    
                    pathID = token.tokenDocument.document.getFlag("pathpatroller", "pathID");
                    patrolPath = _patrol.pathCoords.filter((coordSet) => 
                    {
                        if(coordSet.patrolPath.includes(pathID))
                        {
                            return coordSet;
                        }
                    });
                }
                
                //console.log("token: ");
                //console.log(token);
                //console.log("Just Reset List: ");
                //console.log(_patrol.justReset);
                //console.log(name + " is moving to node " + (currentPathIndex) + " of path {" + pathName + ", " + pathID + "}");
                //console.log("patrolPath: ");
                //console.log(patrolPath);
                //console.log(pathName + " - " + pathID +" at node " + (currentPathIndex) + " is ");
                //console.log(patrolPath[currentPathIndex]);
                    //console.log(name + " is moving from {x: " + token.tokenDocument.data.x + ", y: " + token.tokenDocument.data.y + "} to {x: " 
                    //+ (patrolPath[currentPathIndex].x) + ", y: " + (patrolPath[currentPathIndex].y) + "}");
                 updates.push({
                    _id: token.tokenDocument.document.id,
                    x: patrolPath[currentPathIndex].x,
                    y: patrolPath[currentPathIndex].y,
                });
                if (currentPathIndex >= patrolPath.length-1)
                {
                    //console.log("Finished path! Resetting node progress --");
                    currentPathIndex = 0;
                // console.log("adding token to justReset...");
                // _patrol.justReset.push(id);
                    if(isMultiPath)
                    {
                    // console.log("Multi-path flag detected --")
                    // console.log("PatrolPathGroup: ");
                    // console.log(patrolPathGroup);
                        let nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                    // console.log("Randomly picking next pathIndex: " + nextPatrolPathIndex);
                        
                        if(patrolPathGroup.length > 1)
                        {
                        //   console.log("Multiple paths found --")
                        //  console.log("pathInUse: " + pathID);
                        //  console.log("nextPatrolPathIndex before loop: " + nextPatrolPathIndex);
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                        //   console.log("next path id before loop: " + nextPathID);
                            let infiniteCatch = 0;
                            while((pathID == patrolPathGroup[nextPatrolPathIndex].id 
                                    || _patrol.pathsInUse.includes(nextPathID)) && infiniteCatch < (patrolPathGroup.length*2))
                            {
                            //  if(pathID == patrolPathGroup[nextPatrolPathIndex].id)
                            //  {
                            //     console.log(pathID + " is what this token is currently using! Picking new path --");
                            // }
                            //  else if(_patrol.pathsInUse.includes(nextPathID))
                            //  {
                            //       console.log(nextPathID + " is being used! Picking new path --");
                            //      console.log("Curernt paths in use: ");
                            //      console.log(_patrol.pathsInUse);
                            //   }
                                
                                nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                                nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                                //console.log("new nextPatrolPathIndex: " + nextPatrolPathIndex);
                            // console.log("new nextPathID: " + nextPathID);
                                infiniteCatch +=1;
                            }
                        // console.log("Picked new path --");
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                            //console.log("next path id after loop: " + nextPathID);
                        // console.log("nextPatrolPathIndex after loop: " + nextPatrolPathIndex);
                        }

                        //console.log("Changing " + _patrol.pathsInUse[_patrol.pathsInUse.findIndex((pathID) => {return pathID == id})] + " - to - " + nextPathID + " in pathsInUse array");
                    // console.log("Current paths in use: ");
                    // console.log(_patrol.pathsInUse);
                    // console.log("Freeing up path for use by other patrollers...");
                        let pathIndexToRemove = _patrol.pathsInUse.indexOf(pathID);
                    //  console.log("Removing pathsInUse Index: " + pathIndexToRemove); 
                        _patrol.pathsInUse.splice(pathIndexToRemove, 1);
                    //  console.log("Updated pathsInUse: ");
                    //   console.log(_patrol.pathsInUse);
                    //   console.log("locking new path from use...");
                        _patrol.pathsInUse.push(patrolPathGroup[nextPatrolPathIndex].document.id);
                    //   console.log("New pathsInUse: ");
                    //   console.log(_patrol.pathsInUse);

                    //    console.log("Settign pathID flag to: " + patrolPathGroup[nextPatrolPathIndex].document.id);
                    await  token.tokenDocument.document.setFlag("pathpatroller", "pathID", patrolPathGroup[nextPatrolPathIndex].document.id);
                    }
                    
                }
                else
                {
                    currentPathIndex += 1;
                    //console.log("removing token from justReset...");
                // _patrol.justReset.splice( _patrol.justReset.indexOf(id));
                }
                
                //console.log("Updates pushed: ");
                //console.log(updatesPushed);
               // console.log("Updating pathIndex Flag: " + currentPathIndex);
               await token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", Number(currentPathIndex));
                
            }
            
            canvas.scene.updateEmbeddedDocuments("Token", updates);
            
        }

    }

    mapTokensAndPaths() 
    {
        console.log("Mapping tokens");   
        this.pathsInUse = [];  
        this.tokens = [];
        //this.justReset = [];
        canvas.tokens.placeables.filter((t) => t.document.getFlag("pathpatroller", "makePatroller")).forEach((t) => {
            this.tokens.push({tokenDocument: t});

            let pathID = t.document.getFlag("pathpatroller", "pathID");
            this.pathsInUse.push(pathID);
            //console.log(t.name + " using path wiht id " + pathID);
            

        });
       // console.log("paths in use: ");
       // console.log(this.pathsInUse);

       // console.log("Mapping Paths");
        this.pathCoords = [];
        canvas.drawings.placeables.filter((d) => d.data.text.includes("Path")).forEach((path)=> {
            let pathPoints = this.polygonToGlobal(path);
            for(let currPointIndex = 0; currPointIndex < pathPoints.length-1; currPointIndex+=2)
            {
                this.pathCoords.push({"patrolPath": path.id, "x":pathPoints[currPointIndex], "y" : pathPoints[currPointIndex+1]});
            }
        });
        
    }

    polygonToGlobal(drawing) 
    {
        //console.log("Converting polygon points to Global Co-ords...");
        let globalCoords = [];
        if (drawing.data.points.length != 0) 
        {
        drawing.data.points.forEach((point) => {
            globalCoords.push(point[0] + (drawing.x-50), point[1] + (drawing.y-50));
        });
        } 
        else 
        {
        globalCoords = [
            drawing.x,
            drawing.y,
            drawing.x + drawing.width,
            drawing.y,
            drawing.x + drawing.width,
            drawing.y + drawing.height,
            drawing.x,
            drawing.y + drawing.height,
        ];
        }
        return globalCoords;
    }
    
}