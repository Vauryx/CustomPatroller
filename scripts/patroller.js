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

    resetPathIndex()
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
                token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", Number(Math.floor(Math.random() * patrolPath.length)));
            }
            else
            {
                token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", 0);
            }           
        }
        
    }
    
    stopPatrol()
    {
        canvas.app.ticker.remove(this.doPatrol);
    }

    doPatrol()
    {
        if (_patrol.executePatrol && !game.paused && !game.combat?.started && _patrol.started && _patrol.pathCoords[0] != undefined) 
        {
            //console.log("doing patrol...");
           // console.log(_patrol.pathCoords);
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
                currentPathIndex = Number(token.tokenDocument.document.getFlag("pathpatroller", "pathIndex")); 
                if (token.tokenDocument._controlled) 
                {
                    continue;
                }
                if (_patrol.pathCoords != undefined)
                {
                   //console.log(token);
                    //console.log(_patrol.pathCoords);
                    pathName = token.tokenDocument.document.getFlag("pathpatroller", "patrolPath");
                    
                    //console.log(currentPathIndex);
                    if(token.tokenDocument.document.getFlag("pathpatroller", "multiPath"))
                    {
                        isMultiPath = true;
                        patrolPathGroup = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName));
                    }
                    
                    pathID = token.tokenDocument.document.getFlag("pathpatroller", "pathID");
                    //console.log(pathID);
                    patrolPath = _patrol.pathCoords.filter((coordSet) => 
                    {
                        if(coordSet.patrolPath.includes(pathID))
                        {
                            return coordSet;
                        }
                    });
                    //console.log(patrolPath);
                }
                //console.log("Patroller Log: ");
                //console.log(token);
                //console.log(patrolPath);
                //console.log(pathName + " at node " + (currentPathIndex) + " is ");
                //console.log(patrolPath[currentPathIndex]);
                //console.log(name + " is moving to node " + (currentPathIndex) + " of path {" + pathName + ", " + pathID + "}");
                if( token.tokenDocument.data.x == (patrolPath[currentPathIndex].x-50) && token.tokenDocument.data.y == (patrolPath[currentPathIndex].y-50))
                {
                    currentPathIndex = Number(currentPathIndex + 1);
                    if(currentPathIndex >= patrolPath.length-1)
                    {
                        currentPathIndex = 0;
                       
                    }
                    else
                    {
                        currentPathIndex = currentPathIndex;
                    }
                }
                //console.log(name + " is moving from {x: " + token.tokenDocument.data.x + ", y: " + token.tokenDocument.data.y + "} to {x: " 
                    //+ (patrolPath[currentPathIndex].x-50) + ", y: " + (patrolPath[currentPathIndex].y-50) + "}");
                //console.log(pathName + " has a length of " + patrolPath.length);
                
                updates.push({
                    _id: token.tokenDocument.document.id,
                    x: patrolPath[currentPathIndex].x-50,
                    y: patrolPath[currentPathIndex].y-50,
                });
              //  console.log(updates);
                //console.log("path being used: " + pathInUse);
                if (currentPathIndex >= patrolPath.length-1)
                {
               //     console.log("resetting to first node");
                    currentPathIndex = 0;
                    if(isMultiPath)
                    {
                        //patrolPathGroup.forEach((patrolPath) => {
                            //console.log(patrolPath.id);
                        //});
                        console.log(patrolPathGroup);
                        let nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                        if(patrolPathGroup.length > 1)
                        {
                            console.log("pathInUse: " + pathID);
                            console.log("nextPatrolPathIndex: " + nextPatrolPathIndex);
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                            console.log("next path id before loop: " + nextPathID);
                            while(pathID == patrolPathGroup[nextPatrolPathIndex].id 
                                    || _patrol.pathsInUse.includes(nextPathID))
                            {
                                nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                                nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                            }
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                            console.log("next path id after loop: " + nextPathID);
                        }
                        //console.log(name + "next path index: " + nextPatrolPathIndex + " - Curernt index: " + pathInUse);
                        _patrol.pathsInUse[_patrol.pathsInUse.findIndex((pathID) => {return pathID == id})] = nextPathID;
                        //console.log(_patrol.pathsInUse);
                        token.tokenDocument.document.setFlag("pathpatroller", "pathID", patrolPathGroup[nextPatrolPathIndex].id);
                        //currentPathIndex +=1;

                    }
                    
                }
                else
                {
               //     console.log("updating to next node");
                    currentPathIndex += 1;
                }
                //console.log("Next node: " + currentPathIndex);
                //console.log("Next path: " + token.tokenDocument.document.getFlag("pathpatroller", "pathID"));
                token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", Number(currentPathIndex));
                
            }
            
            canvas.scene.updateEmbeddedDocuments("Token", updates);
            
        }

    }

    mapTokensAndPaths() 
    {
        console.log("Mapping tokens");   
        this.pathsInUse = [];  
        this.tokens = [];
        canvas.tokens.placeables.filter((t) => t.document.getFlag("pathpatroller", "makePatroller")).forEach((t) => {
            this.tokens.push({tokenDocument: t});

            let pathID = t.document.getFlag("pathpatroller", "pathID");
            this.pathsInUse.push(pathID);
            console.log(t.name + " using path wiht id " + pathID);
            

        });
        console.log("tokens using paths: ");
        console.log(this.pathsInUse);
        
 
        console.log("Mapping Paths");
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
            globalCoords.push(point[0] + drawing.x, point[1] + drawing.y);
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