let GameWindows = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GameWindows (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },

init(params) {
	game_data['game_windows'] = this;
	this.game_window = null;
	this.overlay_bmd = null;
	this.wind_id = '';
	this.create_dark();
	this.allow_overlay_click = true;
	this.pending_windows = [];	

	this.window_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.window_holder);	

	this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.moving_holder);

	this.allow_window_close	= false;
},

create_dark() {
	this.dark = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
	this.dark.setOrigin(0);
	this.dark.alpha = 0.8;
	this.add(this.dark);
	this.dark.setInteractive();
	this.dark.visible = false;
	this.dark.on('pointerup', ()=> {this.dark_click()}, this);
	this.dark.on('pointerdown', () => {
		this.dark.has_down = true;
		setTimeout(() => {
			this.dark.has_down = false;
		}, 200);
	}, this);

	this.dark.has_down = false;
},

dark_click(external = false) {
	if (external && this.wind_id == 'options') external = false;
	if (this.game_window && this.allow_overlay_click && (this.dark.has_down || external)) {
		this.allow_overlay_click = false;
		this.dark.has_down = false;
		this.game_window.handler_close({'overlay': true});
	}
},

show_window(params, timeout = 0) {
	let id = params['window_id'];
	let allow = this.no_muliple_window();
	let use_push = true;
	if (params && allow) {
		if (this.game_window || this.before_create || (this.suspened && this.suspened != id)) {
			if (use_push) this.pending_windows.push(params);
			else this.pending_windows.unshift(params);
		}
		else {
			this.before_create = true;
			setTimeout(() => {
				this.before_create = false;
				this.display_window(params);
			}, timeout);
		}
	}
	else {
		this.destroy_window();
	}
},

suspend_windows(suspend_exception = 'no_exception') {
	this.suspened = suspend_exception;
},

resume_windows() {
	this.suspened = false;
	if (this.pending_windows.length && !this.game_window) {
		let _params = this.pending_windows.shift();
		this.show_window(_params, 100);
	}
},

no_muliple_window(wnd_id) {
	if (this.wind_id == wnd_id) return false;
	else {
		for (let params of this.pending_windows) {
			if (params['window_id'] == wnd_id) return false;
		}
	}
	return true;
},

display_window(params) {
	let appear_type = 'center';
	if (this.game_window) {
		this.close_window({'immediate': true});		
	}
	
	let window_id = params['window_id'];	
	this.wind_id = window_id;
	switch (window_id) {
		case 'buy_money':
			this.game_window = new BuyMoney();
		break;
		case 'options':
			this.game_window = new Options();
		break;
		case 'select_language':
			this.game_window = new SelectLanguage();
		break;
		case 'level_failed':
			this.game_window = new LevelFailed();
		break;
		case 'level_complete':
			this.game_window = new LevelComplete();
		break;
		case 'purchase_success':
			this.game_window = new PurchaseSuccess(this.scene);
		break;
		case 'purchase_failed':
			this.game_window = new PurchaseFailed(this.scene);
		break;
		case 'select_language':
			this.game_window = new SelectLanguage(this.scene);
		break;
		case 'quit':
			this.game_window = new Quit(this.scene);
		break;
		case 'info':
			this.game_window = new Info(this.scene);
		break;
		case 'example_window':
			this.game_window = new ExampleWindow(this.scene);
		break;
	/*  */
	}	
	if (this.game_window) {
		params['moving_holder'] = this.moving_holder;
		if (!this.dark.visible) {
			this.dark.alpha = 0.01;
			this.dark.visible = true;
		}
		this.game_window.init(params);
		this.window_holder.add(this.game_window);	
		let dy = -15;
		let center_pt = ('center_pt' in params && params['center_pt']) ? params['center_pt'] : new Phaser.Geom.Point(loading_vars['W'] / 2, loading_vars['H'] / 2 + dy);
		if (!('immediate' in params))
			this.display_smooth(center_pt, appear_type);
		else {
			this.dark.alpha = 0.8;
			this.game_window.x = center_pt.x;
			this.game_window.y = center_pt.y;
			if (this.game_window && this.game_window.window_shown) this.game_window.window_shown();
		}	
		this.allow_window_close	= true;
		this.game_window.emitter.on('EVENT', this.handler_event, this);
		
		game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'window_open'});

		this.allow_overlay_click = false;
		if (window_id !== 'level_failed') {
			setTimeout(() => {
				this.allow_overlay_click = true;
			}, 500);
		}
		game_data.game_play.pause_timer();
		this.emitter.emit('EVENT', {'event': 'window_shown'});
	}
	else console.log('NO window:', window_id)
},

display_smooth(center_pt, appear_type) {			
	game_data['scene'].tweens.add({targets: this.dark, alpha: 0.8, duration: 200});
	if (appear_type == 'center') {				
		this.game_window.x = center_pt.x;
		this.game_window.y = center_pt.y - 1000;
		game_data['scene'].tweens.add({targets: this.game_window, y: center_pt.y + 20, ease: 'Sine.easeOut', duration: 350, onComplete: () => {
			game_data['scene'].tweens.add({targets: this.game_window, y: center_pt.y, duration: 70});
		}});  
	}
},

handler_event(params) {
	if ('events' in params) {		
		let arr = params['events'];		
		while (arr.length) {
			obj = arr.shift();			
			this.handler_event(obj);
		}
	}
	else {
		switch (params['event']) {
			case 'window_close':
				this.close_window(params);
				break;
			case 'show_window':
				this.show_window(params);
				break;
			default:
				this.emitter.emit('EVENT', params);
				break;
		}
	}
},

create_default_overlay(params) {
	this.allow_destroy_overlay = false;
	if (this.default_overlay == null) {
		this.default_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.default_overlay.setOrigin(0,0);
		this.default_overlay.alpha = 0.8;
        this.default_overlay.setInteractive();

		this.default_overlay.on('pointerup', () => {
			if (this.game_window && this.allow_overlay_click) {
				this.allow_overlay_click = false;
				this.game_window.handler_close({'overlay': true});	
			}
		});	
	}
	this.overlay_holder.add(this.default_overlay);
},


close_window(params = null) {
	let _id = this.wind_id;
	if (this.allow_window_close) {
		this.allow_window_close = false;
		if (this.game_window.prize_mod) {
			game_data['prize_mod'] = false;
		}
		if (params && 'immediate' in params) {
			if (this.wind_id == _id) this.destroy_window();			
		}
		else {
			let dx = this.game_window.x
			if (!this.pending_windows.length) game_data['scene'].tweens.add({targets: this.dark, alpha: 0.01, delay: 300, duration: 200});
			game_data['scene'].tweens.add({targets: this.game_window, x: dx - 30, duration: 70, onComplete: () => {
				game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'window_open'});
				game_data['scene'].tweens.add({targets: this.game_window, x: dx + 1000, duration: 250, onComplete: () => {
					if (this.wind_id == _id)	this.destroy_window();	
				}}); 
			}}); 	
		}
	}
	 
},

destroy_window(block_resume = false) {
	if (this.game_window) this.game_window.destroy();
	if (this.pending_windows && this.pending_windows.length && this.pending_windows[0] && this.pending_windows[0]['window_id']) {
		
	}
	else {
		game_data.game_play.resume_timer();
	}
	this.wind_id = '';
	this.window_holder.removeAll(true);
	this.moving_holder.removeAll(true);

	if (this.overlay_bmd) {
		this.overlay_bmd.destroy();
		this.overlay_bmd = null;
	}
	if (this.suspened || !this.pending_windows.length) this.dark.visible = false;
	this.allow_overlay_click = true;
	this.game_window = null;
	this.emitter.emit('EVENT', {'event': 'window_closed', 'pending_length': this.pending_windows.length});

	if (this.pending_windows.length) {
		let _params = this.pending_windows.shift();
		this.show_window(_params);
	}
	else if (!block_resume) game_data['utils'].resume_tip();
	
}
});


