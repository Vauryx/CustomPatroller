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
                let pathName = token.tokenDocument.document.getFlag("pathpatroller", "patrolPath");
                let patrolPathGroup = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName));
                let patrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                let pathID = patrolPathGroup[patrolPathIndex].document.id;
                patrolPath = this.pathCoords.filter((coordSet) => 
                {
                    if(coordSet.patrolPath.includes(pathID))
                    {
                        return coordSet;
                    }
                });
                if(resetToRandomNode)
                {
                    await token.tokenDocument.document.setFlag("pathpatroller", "pathID", pathID);
                    await token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", Number(Math.floor(Math.random() * patrolPath.length)));
                }
                else
                {
                    await token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", 0);
                }       
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
                isMultiPath = false;
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
                if(patrolPath[currentPathIndex] != undefined)
                {
                    updates.push({
                        _id: token.tokenDocument.document.id,
                        x: patrolPath[currentPathIndex].x,
                        y: patrolPath[currentPathIndex].y,
                    });
                }
                 
                if (currentPathIndex >= patrolPath.length-1)
                {
                    currentPathIndex = 0;
                    if(isMultiPath)
                    {
                        let nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                        if(patrolPathGroup.length > 1)
                        {
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                            let infiniteCatch = 0;
                            while((pathID == patrolPathGroup[nextPatrolPathIndex].id || _patrol.pathsInUse.includes(nextPathID)) && infiniteCatch < (patrolPathGroup.length*2))
                            {
                                nextPatrolPathIndex = Math.floor(Math.random() * patrolPathGroup.length);
                                nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                                infiniteCatch +=1;
                            }
                            nextPathID = patrolPathGroup[nextPatrolPathIndex].document.id;
                        }
                        let pathIndexToRemove = _patrol.pathsInUse.indexOf(pathID);
                        _patrol.pathsInUse.splice(pathIndexToRemove, 1);
                        _patrol.pathsInUse.push(patrolPathGroup[nextPatrolPathIndex].document.id);
                        await  token.tokenDocument.document.setFlag("pathpatroller", "pathID", patrolPathGroup[nextPatrolPathIndex].document.id);
                    }
                    
                }
                else
                {
                    currentPathIndex += 1;
                }
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