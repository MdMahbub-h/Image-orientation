let phaser_game;
let files_preloaded = false;
let game = null;
let landscape = loading_vars['orientation'] == 'landscape';
let is_localhost = location.hostname == '127.0.0.1' || location.hostname == 'localhost' || loading_vars.net_id == 'localhost';
let allow_rewarded_ads = false;
let allow_intersitial_ads = false;
let temp_user_data = null;
let paused = false;
let allow_resume_timer = true;
let allow_pause_timer = true;

window.onload = function() {
	initialize(function(){
		let gameConfig = get_game_config();
		game_request = new GameRequest();
		game_request.request({'get_game_info': true}, function(params) {
			if ('user_data' in params) {
				temp_user_data = params['user_data'];
			}
			if (!('unpaused' in game_data)) game_data['unpaused'] = 1;
			gameConfig['scene'] = mainGame;
			phaser_game = new Phaser.Game(gameConfig);
			window.focus();	
		});
								
	});

	let elem = document.getElementById('preload');
	if (elem) elem.style.display = 'none';
	
}	


class mainGame extends Phaser.Scene{
	constructor(){
		super("MainGame");
	}

	preload(){	
		this.load.image('preload_bar', 'assets/preload_bar.png');
		this.load.image('preload_bg', 'assets/preload_bg.png');
		this.load.image('preload_bg2', 'assets/preload_bg2.png');
		this.load.once('complete', this.preload_files, this);
	}

	preload_files(on_complete){
		let preload_sounds = [];
		for (let i = 0; i < preload_sounds.length; i++) {
			this.load.audio(preload_sounds[i], 'assets/audio/' + preload_sounds[i] + '.mp3');
		}

		this.load.atlas("common1", "assets/common1.png", "assets/common1.json");
		this.load.image("tut_1", "./assets/tut_1.png");
		this.load.image("tut_2", "./assets/tut_2.png");
		this.load.image("frame", "./assets/frame.png");
		this.load.image("rope", "./assets/rope.png");
		this.load.image("back", "./assets/bgs/back.jpg");
		this.load.script('levels', "assets/levels/levels.js");
		if (loading_vars['js_combined']) { 
			this.load.script('all', "bundle.js");
		}
		else {
			this.load.script('main_game', "js/game.js");
			this.load.script('social_api', "js/game_utilities/social_api.js");
			this.load.script('game_utils', "js/game_utilities/game_utils.js");
			this.load.script('custom_button', "js/game_utilities/custom_button.js");
			this.load.script('audio_manager', "js/game_utilities/audio_manager.js");
			this.load.script('loading_overlay', "js/game_utilities/loading_overlay.js");
			this.load.script('graphics_manager', "js/game_utilities/graphics_manager.js");
			this.load.script('test_ad_manager', "js/game_utilities/test_ad_manager.js");
			this.load.script('game_play', "js/game_play/game_play.js");
			this.load.script('stage_panel', "js/game_play/stage_panel.js");
			this.load.script('hint_panel', "js/game_play/hint_panel.js");
			this.load.script('timer_panel', "js/game_play/timer_panel.js");
			this.load.script('game_map', "js/game_map/game_map.js");
			this.load.script('game_windows', "js/game_windows/game_windows.js");
			this.load.script('buy_money', "js/game_windows/buy_money.js");
			this.load.script('buy_money_item', "js/game_windows/buy_money_item.js");
			this.load.script('level_failed', "js/game_windows/level_failed.js");
			this.load.script('level_complete', "js/game_windows/level_complete.js");
			this.load.script('options', "js/game_windows/options.js");
			this.load.script('select_language', "js/game_windows/select_language.js");
			this.load.script('quit', "js/game_windows/quit.js");
            this.load.script("purchase_success", "js/game_windows/purchase_success.js");
            this.load.script("purchase_failed", "js/game_windows/purchase_failed.js");
            this.load.script("info", "js/game_windows/info.js");
					
		}
		this.load.xml('language_xml', 'assets/xml/language.xml');
		this.load.on('progress', value => {
			this.set_loading_progress(Math.floor(value * 100));	
			if (Math.round(value * 100) == 100)
			this.load.off('progress');	
		});
		this.load.once('complete', () => {						
			files_preloaded = true;
			this.create_game();
		});		
		this.load.start();	
	}
	
	set_loading_progress(val) {
		if (this.load_progress_cont) {
			this.load_progress_txt.text = String(val) + '%';
			this.load_progress_bar.scaleX = val / 100;
		}
		else {
			this.load_progress_cont = new Phaser.GameObjects.Container(this, loading_vars['W']/2, loading_vars['H']/2);
			this.add.existing(this.load_progress_cont);
			this.load_progress_txt = new Phaser.GameObjects.Text(this, 0, -25, String(val) + '%', {fontFamily:"font1", fontSize: 40, color:"#f4ec60", stroke: '#07404e', strokeThickness: 3});
			this.load_progress_txt.setOrigin(0.5);
			this.load_progress_cont.add(this.load_progress_txt);
			this.load_progress_bar = new Phaser.GameObjects.Image(this, 0, 19, 'preload_bar');
			this.load_progress_bg = new Phaser.GameObjects.Image(this, 0, 20, 'preload_bg');
			this.load_progress_bg2 = new Phaser.GameObjects.Image(this, 0, 20, 'preload_bg2');
			this.load_progress_bar.setOrigin(0, 0.5);
			this.load_progress_bar.x = -this.load_progress_bg.width / 2 + 5;
			this.load_progress_bar.scaleX = 0.01;
			this.load_progress_cont.add(this.load_progress_bg);
			this.load_progress_cont.add(this.load_progress_bar);
			this.load_progress_cont.add(this.load_progress_bg2);
		}
	}

	create_game() {	
		game_data['scene'] = this;
		if (temp_user_data) {
			update_object(game_data['user_data'], temp_user_data);
			temp_user_data = null;
		}
		game = new Game(this);	
		game.prepare_game();				
	}
	
	update(time, delta){
		if (game) game.update(time, delta);
	}
}

function update_object(obj1, obj2) {
	for (let prop in obj2) {
		obj1[prop] = obj2[prop];			  
	}		
}

function initialize(on_complete) {
	if (loading_vars['net_id'] === 'y') {
		YAPI.startGame()
		.then(params => {
			let { id } = params;
			loading_vars['user_id']	= id;
			allow_rewarded_ads = true;
			allow_intersitial_ads = true;
			on_complete();
		})
		.catch(e => {
			console.log(e);
		});
	}
	else { // localhost version
		loading_vars['user_id']	= '0';
		allow_rewarded_ads = true;
		allow_intersitial_ads = true;
		on_complete();
	}
}

function get_game_config() {
	loading_vars['default_W'] = parseInt(loading_vars['W']);
	loading_vars['default_H'] = parseInt(loading_vars['H']);
	loading_vars['extra_W'] = 0;
	loading_vars['extra_H'] = 0;
	let base_ratio = loading_vars['W'] / loading_vars['H'];
	let def_w = parseInt(loading_vars['W']);
	let def_h = parseInt(loading_vars['H']);
	let ratio = window.innerWidth / window.innerHeight;
	if (loading_vars['mobile'] && window.innerWidth < window.innerHeight) ratio = window.innerHeight / window.innerWidth;
	if (is_localhost) ratio = base_ratio;
	if (loading_vars['W'] < loading_vars['H'] * ratio) {
	  loading_vars['W'] = parseInt(loading_vars['H'] * ratio);
	  loading_vars['extra_W'] = loading_vars['W'] - def_w;
	  loading_vars['extra_H'] = loading_vars['H'] - def_h;
	}
	let mobile_device = loading_vars['mobile'];
	let config = {
	  type: Phaser.WEBGL,
	  parent: 'phaser_game',
	  width: loading_vars['W'],
	  height: loading_vars['H'],
	  backgroundColor: 0x000000,
		  clearBeforeRender: loading_vars['mobile'] ? false : true,
		   render: {
			  powerPreference: 'high-performance'
		   }
	};
	if (mobile_device) {
		config['scale'] = {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
		}
	}
	else {
		config['scale'] = {
			autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
		}
		
		config['scale'].mode = Phaser.Scale.FIT;
		config['fullscreenTarget'] = 'phaser_game';
	}
	return config;
  }

function pause() {
	game_data['unpaused'] = 0;
	if (game_data['audio_manager']) game_data['audio_manager'].update_volume();
	if (game_data['game_root']) game_data['game_root'].block_interface();
	paused = true;
	if (game_data.scene) game_data.scene.game.input.enabled = false;
	if (game_data && game_data['game_play']) {
		game_data['game_play'].pause_timer();
	}
	if (game_data['game_windows'].game_window && game_data['game_windows'].game_window.pause_timer && typeof game_data['game_windows'].game_window.pause_timer === 'function') {
		game_data['game_windows'].game_window.pause_timer();
	}
	console.log('pause');
}

function resume() {
	game_data['unpaused'] = 1;
	if (game_data['audio_manager']) game_data['audio_manager'].update_volume();
	if (game_data['game_root']) game_data['game_root'].unblock_interface();
	paused = false;
	if (game_data.scene) game_data.scene.game.input.enabled = true;
	if (game_data && game_data['game_play'] && !game_data['game_play'].is_paused() && !(game_data.game_windows && game_data.game_windows.game_window)) {
		game_data['game_play'].resume_timer();
	}
	if (game_data['game_windows'].game_window && game_data['game_windows'].game_window.resume_timer && typeof game_data['game_windows'].game_window.resume_timer === 'function') {
		game_data['game_windows'].game_window.resume_timer();
	}
	console.log('resume');
}