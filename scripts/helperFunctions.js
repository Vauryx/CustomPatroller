
let _patrol;
Hooks.on("canvasReady",()=>{
  if(!game.user.isGM) return
  let patrolWasStarted = false
  if(_patrol) {
    _patrol.stopPatrol()
    patrolWasStarted = _patrol.started
  }
  _patrol = Patroller.get()
  _patrol.started=patrolWasStarted
 
  _patrol.stopPatrol()
  _patrol.startPatrol()
  console.log(_patrol);
})

async function _patrollerAnimateMovement(ray) {
    // Move distance is 10 spaces per second
    const s = canvas.dimensions.size;
    this._movement = ray;
    const speed = s * 10;
    const duration = this.document.getFlag("theyhearmewalkin", "makePatroller") && !this._controlled ? game.settings.get("theyhearmewalkin", "patrolDelay") : (ray.distance * 1000) / speed;
  
    // Define attributes
    const attributes = [
      { parent: this, attribute: 'x', to: ray.B.x },
      { parent: this, attribute: 'y', to: ray.B.y }
    ];
  
    // Determine what type of updates should be animated
    const emits = this.emitsLight;
    const config = {
      animate: game.settings.get("core", "visionAnimation"),
      source: this._isVisionSource() || emits,
      sound: this._controlled || this.observer,
      fog: emits && !this._controlled && (canvas.sight.sources.size > 0)
    }
  
    // Dispatch the animation function
    let animationName = `Token.${this.id}.animateMovement`;
    await CanvasAnimation.animateLinear(attributes, {
      name: animationName,
      context: this,
      duration: duration,
      ontick: (dt, anim) => this._onMovementFrame(dt, anim, config)
    });
  
    // Once animation is complete perform a final refresh
    if ( !config.animate ) this._animatePerceptionFrame({source: config.source, sound: config.sound});
    this._movement = null;
  }