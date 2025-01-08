let LevelComplete = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function LevelComplete()
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
	this.money_pt = params['money_pt'];
	this.score = params['score'];
	this.currentStageAdsWatched = params['currentStageAdsWatched'];
	this.currentStage = params['currentStage'];
	this.first_complete = params['first_complete'];

	temp = {'scene_id': 'game_windows', 'item_id': 'level_failed', 'phrase_id': '1', 'values': []}
	game_data['graphics_manager'].get_window('info', this.handler_close, [{ handler: this.handler_cancel }], this, temp, true);
	this.button_play = this.buttons[0];
	this.button_close.setVisible(false);
	this.back.y = 200;
	this.title.y = 20;
	this.button_play.y = 320;

	res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'level_failed', 'phrase_id': '3', 'values': [], 'base_size': 45});
	temp = new Phaser.GameObjects.Text(this.scene, 0, -2, res['text'], { ...game_data['styles']['light_text'], fontFamily:"font1", fontSize: res['size'], align: 'center' });
	temp.setOrigin(0.5);
	this.button_play.add(temp);

	this.button_play.y += 20;
	this.each(el => el.y -= 100);

	let star = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common1', 'star_unactive');
    this.add(star);

	let icon = new Phaser.GameObjects.Image(this.scene, 0, 20, 'common1', 'star_active');
	this.add(icon);
	icon.alpha = 0;
	this.anim_star({ icon }, 400)

    res = game_data['utils'].generate_string({'scene_id': 'game_windows', 'item_id': 'complete_phrase', 'phrase_id': Phaser.Math.Between(1,12), 'values': [], 'base_size': 38});	
	this.phrase = new Phaser.GameObjects.Text(this.scene, 0, star.y + 70, res['text'], { ...game_data['styles']['title'], fontFamily:"font1", fontSize: res['size'] });
	this.phrase.setOrigin(0.5);
	this.add(this.phrase);

	if (this.first_complete) {
		let prize_txt = new Phaser.GameObjects.Text(this.scene, 0, this.phrase.y + 60, `+${game_data['level_complete_prize']}`, { ...game_data['styles']['title'], fontFamily:"font1", fontSize: res['size'] });
		prize_txt.setOrigin(1, 0.5);
		this.add(prize_txt);

		let money_ico = new Phaser.GameObjects.Image(this.scene, prize_txt.x + 28, this.phrase.y + 60, 'common1', 'money_ico').setScale(0.77);
		this.add(money_ico);

		this.money_ico = money_ico;
	}
},

anim_star(obj, delay) {
	let icon = obj['icon'];
	setTimeout(() => {
		if (this.scene) {
			let dx = icon.x;
			let dy = icon.y;
			let d_angle = icon.angle;
			icon.y -= 350;
			let sign = (Math.random() < 0.5 ? 1 : -1);
			icon.angle = -300 * sign;
			icon.x += (Math.random() * 200 + 200) * sign;
			let start_pt = {'x': icon.x, 'y': icon.y};
			let end_pt = {'x': dx, 'y': dy};
			let mid_pt = {'x': dx + 100 * sign, 'y': dy - 50};
			let dur = 600;

			let emitter = this.scene.add.particles(0, 0, 'common1', {
				frame: 'star_active',
				follow: icon,
				lifespan: 1000,
				blendMode: 'ADD',
				alpha: { start: 1, end: 0.2 },
				scale: { start: 0.6, end: 0 },
				speed: { min: -200, max: 200 },
				quantity: 4,
				gravityY: -50,
				rotate: { onEmit: ()=> { return Math.random()*360; } },
			});
			this.add(emitter);

			game_data['utils'].bezier(start_pt, mid_pt, end_pt, icon, dur, 'Sine.easeOut', this, ()=>{
				if (this.scene) {
					setTimeout(() => {
						emitter.destroy();
					}, 1200);
				}
			}, null, 0, emitter);
			game_data['scene'].tweens.add({targets: icon, alpha: 1, duration: 100});
			game_data['scene'].tweens.add({targets: icon, angle: d_angle - 360, duration: dur});
			setTimeout(() => {
				if (this.scene && !this.is_closed) game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'get_star'});
			}, dur - 100);
		}

	}, delay);
},

handler_cancel() {
	game_request.request({
		'level_failed': true,
		'global_score': this.score,
		'levels_passed': this.currentStage
	}, params => {
		if (this.first_complete) {
			let pt = new Phaser.Geom.Point(this.money_ico.x, this.money_ico.y);
			pt = game_data['utils'].toGlobal(this, pt);
			game_data['utils'].fly_items({'amount': 3,						
				'holder': game_data['money_holder'],
				'item_atlas': 'common1',
				'item_name': 'money_ico',
				'pt_start': pt,
				'pt_end': this.money_pt	
				}, 
			() => {
				game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'coin_add'});
				this.emitter.emit('EVENT', {'event': 'update_money'});
			});
		}
		
		if (params['new_score'] && 'global_score' in params) game_data['utils'].update_score(params['global_score']);
		if (params['new_stage'] && 'levels_passed' in params) game_data['utils'].update_level(params['levels_passed']);
		this.emitter.emit('EVENT', {'event': 'destroy_level'});
		this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'first_complete': this.first_complete});

		game_data['utils'].remove_level_from_cache(this.level_id);	
		
		game_data['utils'].game_play_stop();
		this.handler_close();
	});
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