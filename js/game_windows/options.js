let Options = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function Options()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {
	if (game_data['current_scene'] === 'GAME_PLAY') params['with_exit'] = true;
	this.buttons = [];

	this.button_music = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.button_music);	
	this.button_music_on = new CustomButton(this.scene, 0, 0, this.handler_music, 'common1', 'btn_music_on', 'btn_music_on', 'btn_music_on',  this);
	this.button_music.add(this.button_music_on);	 
	this.button_music_off = new CustomButton(this.scene, 0, 0, this.handler_music, 'common1', 'btn_music_off', 'btn_music_off', 'btn_music_off', this);
	this.button_music.add(this.button_music_off);
	this.buttons.push(this.button_music);
	 
	this.button_sound = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.button_sound);		
	this.button_sound_on = new CustomButton(this.scene, 0, 0, this.handler_sound, 'common1', 'btn_sound_on', 'btn_sound_on', 'btn_sound_on', this);
	this.button_sound.add(this.button_sound_on);
	this.button_sound_off = new CustomButton(this.scene, 0, 0, this.handler_sound, 'common1', 'btn_sound_off', 'btn_sound_off', 'btn_sound_off', this);
	this.button_sound.add(this.button_sound_off);
	this.buttons.push(this.button_sound);

	this.button_language = new Phaser.GameObjects.Container(this.scene, 0, 0); 
	this.add(this.button_language);
	this.update_button_language();
	this.buttons.push(this.button_language);

	if (params['with_exit']) {
		this.button_home = new Phaser.GameObjects.Container(this.scene, 0, 0); 
		this.add(this.button_home);

		let button_home =  new CustomButton(this.scene, 0, 0, this.handler_home, 'common1', 'btn_home_back', 'btn_home_back', 'btn_home_back', this);
		this.button_home.add(button_home);
		this.buttons.push(this.button_home);
	}

	let total = this.buttons.length;
	for (let i = 0; i < total; i++) {
		this.buttons[i].x = (i - (total - 1) / 2) * 200;
		this.buttons[i].y = 0;
	}
	this.update_buttons();
},

handler_home() {
	this.emitter.emit("EVENT", {'events': [{'event': 'window_close'}, {'event': 'show_window', 'window_id': 'quit'}]});
},

update_button_language() {	
	let lang = game_data['user_data']['lang'].toLowerCase();
	lang = '';	
	this.button_language.removeAll(true);	
			
	let button_content =  new CustomButton(this.scene, 0, 0, this.handler_language, 'common1', lang + 'btn_lang', lang + 'btn_lang', lang + 'btn_lang', this);
	this.button_language.add(button_content);
	
},

handler_language(params) {
	this.emitter.emit("EVENT", {'events': [{'event': 'window_close'}, {'event': 'show_window', 'window_id': 'select_language'}]});
},

update_buttons() {
	this.button_music_on.visible = game_data['user_data']['music'] == 1;
	this.button_music_off.visible = game_data['user_data']['music'] == 0;
	
	this.button_sound_on.visible = game_data['user_data']['sound'] == 1;
	this.button_sound_off.visible = game_data['user_data']['sound'] == 0;
	
	let total = this.buttons.length;
	for (let i = 0; i < total; i++) {
		this.buttons[i].x = (i - (total - 1) / 2) * 200;
		this.buttons[i].y = 0;
	}
},

handler_music(params) { 	
	game_data['user_data']['music'] = 1 - game_data['user_data']['music'];
	this.update_buttons();
	game_request.request({
		'set_options': true,
		'sound': game_data['user_data']['sound'] ,
		'music': game_data['user_data']['music']}, function(){});
	game_data['audio_manager'].update_volume();
},

handler_sound(params) {	
	game_data['user_data']['sound'] = 1 - game_data['user_data']['sound'];
	this.update_buttons();
	game_request.request({
		'set_options': true,
		'sound': game_data['user_data']['sound'] ,
		'music': game_data['user_data']['music']}, function(){});
	game_data['audio_manager'].update_volume();
},

handler_replay() {

},

handler_close(params) {  
	this.close_window();
},

close_window(event = {}) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	
});