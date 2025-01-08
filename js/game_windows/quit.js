let Quit = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Quit()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {
	let temp;
	let res;
	this.paid_replay = false;
	this.level_id = params['level_id'];
	this.duel = params['duel'];
	this.money_pt = params['money_pt'];
	this.score = params['score'];
	this.currentStageAdsWatched = params['currentStageAdsWatched'];
	this.currentStage = params['currentStage'];

	temp = {'scene_id': 'game_windows', 'item_id': 'quit', 'phrase_id': '1', 'values': []}
	game_data['graphics_manager'].get_window('info', this.handler_close, [{ handler: this.handler_no }], this, temp, true);
	this.button_play = this.buttons[0];
    this.button_play.y = 60;
	this.button_close.setVisible(false);
    let question_ico = new Phaser.GameObjects.Image(this.scene, 0, -65, 'common1', 'question');
    question_ico.scale = 0.75;
	this.add(question_ico);
    this.question_ico = question_ico;

    res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'quit', 'phrase_id': '3', 'values': [], 'base_size': 45});
	temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { ...game_data['styles']['light_text'], fontFamily:"font1", fontSize: res['size'], align: 'center' });
	temp.setOrigin(0.5);
	this.button_play.add(temp);
    this.button_play.scale = 0.9;

    this.button_left = new CustomButton(game_data['scene'], 0, 140, this.handler_yes, 'common1'
	,'btn_red', 'btn_red', 'btn_red', this, null, null, 1);
    res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'quit', 'phrase_id': '2', 'values': [], 'base_size': 45});
    temp = new Phaser.GameObjects.Text(this.scene, 0, 0, res['text'], { ...game_data['styles']['light_text'], fontFamily:"font1", fontSize: res['size'], align: 'center', stroke: '#e83258' });
	temp.setOrigin(0.5);
	this.button_left.add(temp);
	this.add(this.button_left);
    this.button_left.scale = 0.8;
    this.each(el => el.y += 40);
},

handler_no() {
    this.close_window();
},

handler_yes() {
    this.emitter.emit('EVENT', {'event': 'level_quit'});
    this.close_window();
},

handler_close(params) {
	if (!this.closed) {
		this.closed = true;
		this.close_window();
	}
},

close_window(event = {}) {
	game_data['utils'].hide_tip();
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	
});