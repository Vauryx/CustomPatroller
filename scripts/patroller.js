class Patroller 
{
    constructor() 
    {
      this.tokens = [];
      this.executePatrol = false;
      this.started = false;
      this.delay = game.settings.get("pathpatroller", "patrolDelay") || 2500;
      this.pathCoords = [];
      this.currentPathIndex = 0;
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
        this.mapTokens();
        this.patrolSetDelay(this.delay);
        canvas.app.ticker.add(this.doPatrol);
    }

    resetPathIndex()
    {
        this.mapTokens;
        for (let token of this.tokens)
        {
            token.tokenDocument.setFlag("pathpatroller", "pathIndex", 0);
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
            _patrol.executePatrol = false;
            _patrol.patrolSetDelay(_patrol.delay);
            let updates = [];
            let pathName = "";
            let pathID = "";
            let patrolPath = [];
            let currentPathIndex = 0;
            for (let token of _patrol.tokens) 
            {
                if (token.tokenDocument._controlled) 
                {
                    continue;
                }
                if (_patrol.pathCoords != undefined)
                {
                    //console.log(token);
                    //console.log(_patrol.pathCoords);
                    pathName = token.tokenDocument.document.getFlag("pathpatroller", "patrolPath");
                    currentPathIndex = token.tokenDocument.document.getFlag("pathpatroller", "pathIndex") ?? 0;
                    //console.log(currentPathIndex);
                    pathID = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName))[0].id;
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
                
                updates.push({
                    _id: token.tokenDocument.document.id,
                    x: patrolPath[currentPathIndex].x,
                    y: patrolPath[currentPathIndex].y,
                });
                //console.log(updates);
                canvas.scene.updateEmbeddedDocuments("Token", updates);
                //console.log("Current Path Index: " + currentPathIndex);
                if (currentPathIndex >= patrolPath.length-1)
                {
                    currentPathIndex = 0;
                }
                else
                {
                    currentPathIndex += 1;
                }
                token.tokenDocument.document.setFlag("pathpatroller", "pathIndex", currentPathIndex);
            }
          }

    }
    mapTokens() {
        console.log("Mapping tokens");
        this.pathCoords = [];
        this.tokens = [];
        canvas.tokens.placeables.filter((t) => t.document.getFlag("pathpatroller", "makePatroller")).forEach((t) => {this.tokens.push({tokenDocument: t});});
        let paths = canvas.drawings.placeables.filter((d) => d.data.text.includes("Path"));
        //console.log(paths);
        if(paths[0] != undefined)
        {
            paths.forEach((path) => {
                let pathPoints = this.polygonToGlobal(path);
                for(let currPointIndex = 0; currPointIndex < pathPoints.length-1; currPointIndex+=2)
                {
                    this.pathCoords.push({"patrolPath": path.id, "x":pathPoints[currPointIndex], "y" : pathPoints[currPointIndex+1]});
                }
            });
            
        }
        //console.log(this.pathCoords);
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