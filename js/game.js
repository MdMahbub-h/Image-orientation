class Game {
	constructor(_scene) {
		this.scene = _scene;
		game_data['game_root'] = this;
	}

	get_social_api() {	
		let socialApi;	
		// example of initializing api of the test net
		if (loading_vars['net_id'] == 'your_net_id') socialApi = new YourNetApi();
		// example of initializing api of the Y net
		else if (loading_vars['net_id'] == 'y') socialApi = new Y();
		// default localhost api
		else socialApi = new DefaultApi();
		return socialApi;
	}	

	prepare_game() {
		game_data['socialApi'] = this.get_social_api();
		game_data['utils'] = new GameUtils();
		game_data['audio_manager'] = new AudioManager(game_data['scene']);	
		this.bg_holder = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		game_data['scene'].add.existing(this.bg_holder);
		let bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'back');
		game_data.bg = bg;
		bg.setOrigin(0, 0);
		this.bg_holder.add(bg);
		this.create_main_game();
	}

	update(time, delta){
		if (game_data['current_scene'] === 'GAME_PLAY' && this.game_play) this.game_play.update(time, delta);
	}

	create_main_game(){
		game_data['rich_fx'] = true;
		try {
			let arr = game.scene.renderer.supportedExtensions;
			if (arr.length < 20) game_data['rich_fx'] = false;
			//one of this affected:
			//EXT_color_buffer_half_float, OES_texture_float, OES_texture_float_linear, 
			//OES_texture_half_float, OES_texture_half_float_linear, WEBGL_color_buffer_float
		}
		catch (e) {
			game_data['rich_fx'] = false;
		}
		// game_data['rich_fx'] = false;
		game_data['utils'].init(game_data['scene']);	
		game_data['utils'].emitter.on('EVENT', this.handler_event, this);
		game_data['graphics_manager'] = new GraphicsManager();
		game_data['graphics_manager'].init(game_data['scene']);
		window.addEventListener("resize", function(){
			game_data['socialApi'].set_game_size();			
		});
		game_data.scene.game.events.addListener(Phaser.Core.Events.PAUSE, this.onPause, this)
		game_data.scene.game.events.addListener(Phaser.Core.Events.RESUME, this.onResume, this)
		game_data['audio_manager'].init();

		this.game_map = new GameMap(game_data['scene']);		
		this.game_play = new GamePlay(game_data['scene']);
		this.game_windows = new GameWindows(game_data['scene']);
		this.game_play.visible = false;
		game_data['money_holder'] = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		game_data['options_holder'] = new Phaser.GameObjects.Container(game_data['scene'], 0, 0);
		
		game_data['scene'].add.existing(this.game_map);
		game_data['scene'].add.existing(this.game_play);
		game_data['scene'].add.existing(game_data['money_holder']);
		game_data['scene'].add.existing(game_data['options_holder']);	

		game_data['scene'].add.existing(this.game_windows);
		let moving_holder = new Phaser.GameObjects.Container(game_data['scene'], 0,0);
		game_data['scene'].add.existing(moving_holder);
		game_data['moving_holder'] = moving_holder;

		game_data['test_ad_manager'] = new TestAdManager(game_data['scene']);
		game_data['scene'].add.existing(game_data['test_ad_manager']);
		
		this.wnd_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.wnd_overlay.setOrigin(0,0);
		this.wnd_overlay.alpha = 0.01;
		game_data['scene'].add.existing(this.wnd_overlay);
		this.wnd_overlay.setInteractive();
		this.wnd_overlay.visible = false;
		game_data['utils'].init_loading();
		game_data['utils'].add_loading();
		game_data['utils'].load_xmls_preloaded(() => {
				this.game_map.visible = false;
				this.game_map.init({});	
				this.start_game();	
				this.game_map.visible = true;
		});
		this.start_music();
	}

	block_interface() {
		console.log('block')
		if (this.wnd_overlay) this.wnd_overlay.visible = true;
	}

	unblock_interface() {
		console.log('unblock')
		if (this.wnd_overlay) this.wnd_overlay.visible = false;
	}

	onFocus(params) {
		console.log('onFocus', params)
	}

	onPause(params) {
		// console.log('onPause', new Date().getTime())
		pause();
	}

	onResume() {
		// console.log('onResume', new Date().getTime())
		resume();
	}

	onHidden(params) {
		console.log('onHidden', params)
	}

	onVisible(params) {
		console.log('onVisible', params)
	}


	start_music() {
		let id = 1;
		game_data['audio_manager'].sound_event({'play': true, 'loop': true, 'sound_type': 'music', 'sound_name': 'free_main' + id, 'audio_kind': 'music', 'map': true});
	}

	start_game() {
		game_data['start_timestamp'] = game_data['utils'].get_time()
		game_data['utils'].init_tips();
		this.game_map.emitter.on('EVENT', this.handler_event, this);
        game_data['current_scene'] = 'MAP';
		this.game_map.setVisible(true);
		this.game_play.setVisible(false);
		setTimeout(() => {
			game_data['socialApi'].set_game_size();	
			setTimeout(() => { game_data['scene'].scale.refresh(); }, 1000);
			this.show_map({'init': true});	
		}, 250);
		
		this.game_windows.init({});
		this.game_windows.emitter.on('EVENT', this.handler_event, this);
		this.game_play.init();
		this.game_play.emitter.on('EVENT', this.handler_event, this);
		
		setTimeout(() => {
			game_data['utils'].remove_loading();
		}, 2000);
	}


	handler_event(params) {
	  switch (params['event']) {
		  	case 'show_scene': 
			  this.show_scene(params)
			break;
			case 'start_level':
				this.start_level(params);
				break;
			case 'show_window':
				this.show_window(params);
				break;
			case 'window_closed': 
				if (!params['pending_length']) {
					game_data['utils'].resume_tip();
				}
				break;
			case 'window_shown': 
				
				break;
			case 'update_money':
				this.game_map.update_money();
				break;
			case 'update_language':
				this.game_play.update_language();
				this.game_map.update_language();
				game_data['utils'].update_language();
				break;
			case 'continue_game':
				this.game_play.continue_game();
				break;
			case 'rewarded_ad_watched':
				this.game_play.rewarded_ad_watched();
				break;
			case 'level_quit':
				this.game_play.level_quit();
				break;
			case 'destroy_level':
				this.game_play.destroy_level();
				break;
	  default:
		//console.log('Unknown event=',params['event'])
		break;
		}
	}

	show_window(params) {
		if (!('money_pt' in params)) params['money_pt'] = this.game_map.get_money_pt();
		this.game_windows.show_window(params);
	}
	
	show_scene(params) {
		game_data['utils'].hide_tip();
		game_data['current_scene'] = params['scene_id'];
		switch (params['scene_id']) {
			case 'GAMEPLAY':
				this.show_gameplay(params);
				break;
			case 'MAP':
				this.show_map(params);
				break;
			default:
				console.log('Unknown scene_id=',params['scene_id'])
				break;
		}
	}

	show_gameplay(params) {
		game_data['is_gameplay'] = true;
		game_data['current_scene'] = 'GAMEPLAY';
	}

	start_level(params) {
		let level_id = params['level_id'];
		// game_data['utils'].add_loading();
		game_data['utils'].get_level(level_id, res => {
			if ('success' in res && res['success']) {
				this.game_play.setVisible(true);
				this.game_map.setVisible(false);
				game_data['current_scene'] = 'GAMEPLAY';
				this.game_play.start_level(params);
			}
			else {
				console.log('failed to load', res);
			}
			// game_data['utils'].remove_loading();
		});	

	}
	
	show_map(params) {
		this.game_map.visible = true;
		this.game_play.visible = false;
		game_data['current_scene'] = 'MAP';
		this.game_map.show_map(params);
		game_data['is_gameplay'] = false;
	}
}