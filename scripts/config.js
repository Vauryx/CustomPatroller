Hooks.once('init', async function() {
    console.log("Registering Custom Patroller game settings...");
    game.settings.register("custompatroller", "patrolDelay", {  
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
        default: 2500                                 
    });
    libWrapper.register("custompatroller","Token.prototype.animateMovement", _patrollerAnimateMovement, "OVERRIDE")
});

Hooks.on("renderTokenConfig", (app, html, data) => {
    if (!game.user.isGM) return;
    let toggleHTML = `<div class="form-group">
    <label>Patroller: </label>
    <input type="checkbox" name="flags.custompatroller.makePatroller" {{checked flags.custompatroller.makePatroller}}>
    <label>Patrol Path: </label>
    <input type="text" name="flags.custompatroller.patrolPath" {{value flags.custompatroller.patrolPath}}>
    <label>Path Index: </label>
    <input type="number" enabled="false" name="flags.custompatroller.pathIndex" {{value flags.custompatroller.pathIndex}}>
  </div>
  `;
  const lockrotation = html.find("input[name='lockRotation']");
    const formGroup = lockrotation.closest(".form-group");
    formGroup.after(toggleHTML);
    html.find("input[name ='flags.custompatroller.makePatroller']")[0].checked = app.object.getFlag("custompatroller", "makePatroller") || false;
    html.find("input[name = 'flags.custompatroller.patrolPath']")[0].value = app.object.getFlag("custompatroller", "patrolPath") || "";
    html.find("input[name = 'flags.custompatroller.pathIndex']")[0].value = app.object.getFlag("custompatroller", "pathIndex") || "";
    html.find($('button[name="submit"]')).click(app.object, saveTokenConfigPT);
  });

async function saveTokenConfigPT(event) {
    let html = this.offsetParent;
    let makePatroller = html.querySelectorAll("input[name ='flags.custompatroller.makePatroller']")[0].checked;
    await event.data.setFlag("custompatroller", "makePatroller", makePatroller);
    _patrol.mapTokens();
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
        _patrol.mapTokens();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("updateDrawing", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokens();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("deleteDrawing", () => {
    if(game.user.isGM) {
        _patrol.mapTokens();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("createToken", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokens();
        _patrol.resetPathIndex();
    }
  });
  
  Hooks.on("deleteToken", () => {
    if(game.user.isGM) 
    {
        _patrol.mapTokens();
        _patrol.resetPathIndex();
    }
  });
Hooks.once('ready', async function() {

});
