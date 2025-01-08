let LevelFailed = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelFailed()
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

	temp = {'scene_id': 'game_windows', 'item_id': 'level_failed', 'phrase_id': '1', 'values': []}
	game_data['graphics_manager'].get_window('info', this.handler_close, [{ handler: this.handler_replay }], this, temp, true);
	this.button_play = this.buttons[0];
	this.button_close.setVisible(false);
	this.back.y = 200;
	this.title.y = 20;

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed', 'phrase_id': '2', 'values': [], 'base_size': 45});
	temp = new Phaser.GameObjects.Text(this.scene, 0, -5, res['text'], { ...game_data['styles']['light_text'], fontFamily:"font1", fontSize: res['size'], align: 'center' });
	temp.setOrigin(0, 0.5);
	temp.x = -temp.displayWidth/2 + 15;
	this.continue_txt = temp;
	this.button_play.add(temp);
	this.button_play.y = 120;

	let button_play2 = new CustomButton(game_data['scene'], 0, 220, this.handler_replay2, 'common1'
	,'btn_play2', 'btn_play2', 'btn_play2', this, null, null, 1);
	temp = new Phaser.GameObjects.Text(this.scene, 23, -5, game_data['continue_level'], { ...game_data['styles']['light_text'], fontFamily:"font1", fontSize: 45, align: 'center' });
	temp.setOrigin(0.5);
	button_play2.add(temp);
	this.continue_txt2 = temp;
	this.add(button_play2);
	this.button_play2 = button_play2;

	let button_close = new CustomButton(game_data['scene'], 0, 320, this.handler_cancel, 'common1'
	,'btn_red', 'btn_red', 'btn_red', this, null, null, 0.9);
	
	this.add(button_close);
	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed', 'phrase_id': '3', 'values': [], 'base_size': 45});
	temp = new Phaser.GameObjects.Text(this.scene, 0, -2, res['text'], { ...game_data['styles']['red_text'], fontFamily:"font1", fontSize: res['size'], align: 'center' });
	temp.setOrigin(0.5);
	button_close.add(temp);

	this.button_play.y += 20;
	button_play2.y += 20;
	button_close.y += 20;

	let ad_ico = new Phaser.GameObjects.Image(this.scene, this.continue_txt.x - 25, this.button_play.y - 3, 'common1', 'rewarded_ad2');
	this.add(ad_ico);

	apples_ico = new Phaser.GameObjects.Image(this.scene, this.continue_txt2.x + (-this.continue_txt2.displayWidth / 2) - 35, button_play2.y - 3, 'common1', 'money_ico');
	this.add(apples_ico);
	this.timer = {
		val: 10
	}
	this.timer_txt = new Phaser.GameObjects.Text(this.scene, 0, 65, this.timer.val, {fontFamily:"font2", fontSize: 50, color:'#a86233', stroke: '#ffe1a1', strokeThickness: 3});
	this.timer_txt.setOrigin(0.5);
	this.add(this.timer_txt);
	this.countdown_tween = game_data['scene'].tweens.add({targets:this.timer, val: 0, duration: this.timer.val * 1000,
	onComplete: () => {
		this.handler_cancel();
	},
	onUpdate: () => {
		this.timer_txt.setText(Math.ceil(this.timer.val));
	}
	});

	if (this.currentStageAdsWatched >= game_data['allowed_ads'] || !allow_rewarded_ads) {
		this.button_play.setVisible(false);
		ad_ico.setVisible(false);
		button_close.y = this.button_play2.y;
		this.button_play2.y = this.button_play.y;
		button_play2.y += 50;
		button_close.y += 50;
		this.title.y += 20;
		this.timer_txt.y += 20;
		apples_ico.y = this.button_play2.y - 3;
		button_close.setScale(1);
	}
	this.each(el => el.y -= 100);
},

handler_replay() {
	if (this.countdown_tween) this.countdown_tween.pause();
	game_data['utils'].show_rewarded_ad(res => {
		if (res['success']) {
			if (this.countdown_tween) {
				this.countdown_tween.pause();
				this.countdown_tween.remove();
			}
			this.handler_continue();
		}
		else {
			if (this.countdown_tween) {
				this.countdown_tween.resume();
			}
			// show_tip
			let pt = game_data['utils'].toGlobal(this.button_play, new Phaser.Geom.Point(0, 0));
			game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'shop', 'phrase_id': '2', 'forced': true, 'values': []});
		}
	})
},

handler_replay2() {
	game_request.request({'buy_level_continue': true}, res => {
		if ('success' in res && res['success']) {
			if (this.countdown_tween) {
				this.countdown_tween.pause();
				this.countdown_tween.remove();
			}
			let pt_start = game_data['game_map'].get_money_pt();
			let pt_end = game_data['utils'].toGlobal(this.button_play2, new Phaser.Geom.Point(0, 0));
			game_data['utils'].fly_items({
				'amount': 5,
				'holder': game_data['moving_holder'],
				'item_atlas': 'common1',
				'item_name': 'money_ico',
				'pt_start': pt_start,
				'pt_end':pt_end								
				}, 
			() => {

				game_data['audio_manager'].sound_event({'play': true,  'sound_name': 'add_star'});
				this.emitter.emit('EVENT', {'event': 'update_money'});
				this.emitter.emit('EVENT', {'event': 'continue_game_pay'});
				this.emitter.emit('EVENT', {'event': 'continue_game'});
				this.handler_close();
			});
		}
		else {
			if (game_data['allow_exchange']) {
				game_data['utils'].handler_exchange();
			}
			else {
				let pt = game_data['utils'].toGlobal(this.button_play2, new Phaser.Geom.Point(0, 0));
				game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'shop', 'phrase_id': '1', 'forced': true, 'values': []});
			}

		}
	});
},

handler_continue() {
	this.emitter.emit('EVENT', {'event': 'rewarded_ad_watched'});
	this.emitter.emit('EVENT', {'event': 'continue_game'});
	this.handler_close();
},

handler_cancel() {
	game_request.request({
		'level_failed': true
	}, params => {
		game_data['utils'].check_ads('level_lost');
		this.emitter.emit('EVENT', {'event': 'destroy_level'});
		this.emitter.emit('EVENT', {
			'event': 'show_scene',
			'scene_id': 'MAP',
			'failed': true});
		game_data['utils'].game_play_stop();
		this.handler_close();
	});
},

pause_timer() {
	if (this.countdown_tween) this.countdown_tween.pause();
},

resume_timer() {
	if (this.countdown_tween) this.countdown_tween.resume();
},

handler_close(params) {
	if (!this.closed) {
		this.closed = true;
		this.close_window();
		if (this.countdown_tween) {
			this.countdown_tween.pause();
			this.countdown_tween.remove();
		}
	}
	
},

close_window(event = {}) {
	game_data['utils'].hide_tip();
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	
});