let Info = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Info()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {
    this.close_callback = params['close_callback'];
    let temp = {'scene_id': 'game_windows', 'item_id': 'info', 'phrase_id': '1', 'values': []}
	game_data['graphics_manager'].get_window('info', null, [{ handler: this.handler_close, type: 'big' }], this, temp, true);
	this.button_play = this.buttons[0];
    this.button_play.setScale(0.65);
    this.button_play.y = 160;
    // this.title.y += 30;

    res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'info', 'phrase_id': '3', 'values': [], 'base_size': 55});
    let button_txt = new Phaser.GameObjects.Text(this.scene, 0, -3, res['text'], {...game_data['styles']['light_text'], fontFamily:"font1", fontSize: res['size']});
    button_txt.setOrigin(0.5);
    this.button_play.add(button_txt);

    this.tut_cont = new Phaser.GameObjects.Container(this.scene, 0, -10);
    this.add(this.tut_cont);

	let tut_1 = new Phaser.GameObjects.Image(this.scene, 0, 0, 'tut_1');
	this.tut_cont.add(tut_1);

    let tut_2 = new Phaser.GameObjects.Image(this.scene, -27, -56, 'tut_2').setAngle(180);
	this.tut_cont.add(tut_2);
    this.tut_2 = tut_2;

    this.tap = new Phaser.GameObjects.Sprite(this.scene, 0, -50, 'common1', 'tap').setScale(0.5).setAngle(-45).setAlpha(0);
    this.tut_cont.add(this.tap);

    this.tutorial_anim();

    let btn_comp = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'btn_comp').setAlpha(0);
	this.add(btn_comp);
    this.btn_comp = btn_comp;
    
},

anim_tap() {
    if (this.scene) this.scene.tweens.add({
        targets: [this.tap],
        ease: 'Sine.easeInOut',
        duration: 150,
        alpha: 1,
        yoyo:true,
        onComplete: () => {
        }
      });
},

tutorial_anim() {
    clearTimeout(this.tut_tid);
    this.anim_tap();
    if (this.scene) this.scene.tweens.add({
        targets: [this.tut_2],
        ease: 'Back.easeOut',
        delay: 400,
        duration: 600,
        angle: "+=45",
        onComplete: () => {
            this.anim_tap();
            if (this.scene) this.scene.tweens.add({
                targets: [this.tut_2],
                ease: 'Back.easeOut',
                delay: 500,
                duration: 600,
                angle: "+=45",
                onComplete: () => {
                    if (this.scene) this.scene.tweens.add({
                        targets: [this.btn_comp],
                        ease: 'Sine.easeInOut',
                        duration: 150,
                        alpha: 1,
                        onComplete: () => {
                        }
                      });
                    this.tut_tid = setTimeout(() => {
                        this.btn_comp.setAlpha(0)
                        this.tut_2.setAngle(180);
                        this.tutorial_anim();
                    }, 1200);
                }
              });
        }
      });
},


handler_close(params) {
	this.close_window();
},

close_window(params) {
    clearTimeout(this.tut_tid);
    this.close_callback();
	this.emitter.emit("EVENT", {'event': 'window_close'});
},

});