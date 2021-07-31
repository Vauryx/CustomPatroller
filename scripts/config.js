Hooks.once('init', async function() {
    console.log("Registering Custom Patroller game settings...");
    game.settings.register("pathpatroller", "patrolDelay", {  
        name: "Patrol Delay",                  
        hint: "Set how slow the patrollers will walk",               
        scope: "world",                                     
        config: true,                                      
        type: Number,
        range: {
        min: 500,
        max: 10000,
        step: 100,
        },
        default: 2500,
        onChange: value => 
        { // A callback function which triggers when the setting is changed
            window.location.reload();
        }                             
    });

    game.settings.register("pathpatroller", "resetToRandomNode", {
      name: "Reset to random ndoe?",
      hint: "On path or token update, reset path index to 0 or random node?",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    libWrapper.register("pathpatroller","Token.prototype.animateMovement", _patrollerAnimateMovement, "OVERRIDE")
});

Hooks.on("renderTokenConfig", (app, html, data) => {
    if (!game.user.isGM) return;
    let toggleHTML = `<div class="form-group">
      <label>Patroller: </label>
      <input type="checkbox" name="flags.pathpatroller.makePatroller" checked={{flags.pathpatroller.makePatroller}}>
      <label>Use multiple paths?: </label>
      <input type="checkbox" name="flags.pathpatroller.multiPath" checked={{flags.pathpatroller.multiPath}}>
      </div>
      <div class="form-group">
      <label>Patrol Path: </label>
      <input type="text" name="flags.pathpatroller.patrolPath" value={{flags.pathpatroller.patrolPath}}>
      <label> Path Index: </label>
      <input type="text" name="flags.pathpatroller.pathIndex" value={{flags.pathpatroller.pathIndex}}>
      </div>
    `;
    const lockrotation = html.find("input[name='lockRotation']");
    const formGroup = lockrotation.closest(".form-group");
    formGroup.after(toggleHTML);
    html.find("input[name ='flags.pathpatroller.makePatroller']")[0].checked = app.object.getFlag("pathpatroller", "makePatroller") || false;
    html.find("input[name ='flags.pathpatroller.multiPath']")[0].checked = app.object.getFlag("pathpatroller", "multiPath") || false;
    html.find("input[name = 'flags.pathpatroller.patrolPath']")[0].value = app.object.getFlag("pathpatroller", "patrolPath") || "";
    html.find("input[name = 'flags.pathpatroller.pathIndex']")[0].value = app.object.getFlag("pathpatroller", "pathIndex") || 0;
    html.find($('button[name="submit"]')).click(app.object, saveTokenConfigPT);
  });

async function saveTokenConfigPT(event) {
    let html = this.offsetParent;
    let makePatroller = html.querySelectorAll("input[name ='flags.pathpatroller.makePatroller']")[0].checked;
    let pathName = html.querySelectorAll("input[name ='flags.pathpatroller.patrolPath']")[0].value;
    let multiPath = html.querySelectorAll("input[name ='flags.pathpatroller.multiPath']")[0].checked;
    let patrolPathIndex = html.querySelectorAll("input[name ='flags.pathpatroller.pathIndex']")[0].value;
    let pathGroup = canvas.drawings.placeables.filter((d) => d.data.text.includes(pathName));
    let pathID = "";
    if (pathGroup[0] != undefined)
    {
      pathID = pathGroup[0].id;
    }
    
    console.log("path id saved: " + pathID);
    await event.data.setFlag("pathpatroller", "makePatroller", makePatroller);
    await event.data.setFlag("pathpatroller", "patrolPath", pathName);
    await event.data.setFlag("pathpatroller", "multiPath", multiPath);
    await event.data.setFlag("pathpatroller", "pathIndex", Number(patrolPathIndex));
    await event.data.setFlag("pathpatroller", "pathID", pathID);
    _patrol.mapTokensAndPaths();
}

Hooks.on("getSceneControlButtons", (controls, b, c) => {
    if (!_patrol) _patrol = Patroller.get();
    controls.find((c) => c.name == "token").tools.push(
        {
            active: _patrol.started,
            icon: "fas fa-walking",
            name: "startPatrolling",
            title: "Start Patrolling",
            onClick: (toggle) => {
              _patrol.started = toggle;
              _patrol.executePatrol = true;
              //console.log(_patrol.started);
            },
            toggle: true,
        }
      );
  });

  Hooks.on("createDrawing", () => {
    if(game.user.isGM)
    {
        _patrol.mapTokensAndPaths();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("updateDrawing", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokensAndPaths();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("deleteDrawing", () => {
    if(game.user.isGM) {
        _patrol.mapTokensAndPaths();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("createToken", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokensAndPaths();
    }
  });

  
  Hooks.on("deleteToken", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokensAndPaths();
    }
  });
Hooks.once('ready', async function() {

});
