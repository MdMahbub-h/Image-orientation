let GamePlay = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GamePlay (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
        this.level_active = false;
        this.level_fail = false;
        this.allow_click = true;
        this.currentStageAdsWatched = 0;
        this.angles = [45, 90, 135, 180, 225, 270, 315];
        this.level_stage = 0;
        this.circle_imgs = [];
        this.test_texts = [];
        
	},

	init(params) {
        game_data['game_play'] = this;
        this.game_engine = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.add(this.game_engine);

        this.piece_container = new Phaser.GameObjects.Container(this.scene, 200, 100).setScale(0.7);
        this.game_engine.add(this.piece_container);

        this.reveal_back = new Phaser.GameObjects.Image(this.scene, 200, 100, 'rope').setScale(0.7).setOrigin(0).setVisible(false);
        this.game_engine.add(this.reveal_back);
        if (game_data['rich_fx']) this.reveal_back.fx = this.reveal_back.postFX.addReveal(0.1, 1, 0);

        this.frame_container = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.game_engine.add(this.frame_container);

        
        let rope1 = new Phaser.GameObjects.Image(this.scene, 1100, 100, 'rope').setOrigin(0.5).setAngle(-90);
        this.frame_container.add(rope1);

        let rope2 = new Phaser.GameObjects.Image(this.scene, 175, 100, 'rope').setOrigin(0.5).setAngle(-90);
        this.frame_container.add(rope2);

        let frame = new Phaser.GameObjects.Image(this.scene, loading_vars['W'] / 2, loading_vars['H'] / 2 - 20, 'frame').setOrigin(0.5);
        this.frame_container.add(frame);

        this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
        this.add(this.moving_holder);

        this.stage_panel = new StagePanel(game_data['scene']);
        this.stage_panel.x = loading_vars['W'] / 2;
        this.stage_panel.y = loading_vars['H'] * 0.93;
        this.stage_panel.init();
        this.game_engine.add(this.stage_panel);
        this.stage_panel.emitter.on('EVENT', this.handler_event, this);
        

        this.timer_panel = new TimerPanel(game_data['scene']);
        this.timer_panel.x = 1230;
        this.timer_panel.y = 400;
        this.timer_panel.init({ 'moving_holder': this.moving_holder });
        this.game_engine.add(this.timer_panel);
        this.timer_panel.emitter.on('EVENT', this.handler_event, this);
        
        if (game_data['dev_mode']) {
            this.test_win = new CustomButton(this.scene, 50, 680, () => {
                if (this.allow_click) this.check_win(true);
            }, 'common1', 'btn_level', 'btn_level', 'btn_level', this, null, null, 1);
            this.add(this.test_win);

            let txt = new Phaser.GameObjects.Text(this.scene, 0, 0, `Win`, { ...game_data['styles']['panel_text'], fontFamily:"font1", fontSize: 40, align: 'center' });
            txt.setOrigin(0.5);
            this.test_win.add(txt);
        }

        this.hint_panel = new HintPanel(game_data['scene']);
        this.hint_panel.x = loading_vars['W'] * 0.96;
        this.hint_panel.y = loading_vars['H'] * 0.93;
        this.hint_panel.init({ 'moving_holder': this.moving_holder });
        this.game_engine.add(this.hint_panel);
        this.hint_panel.emitter.on('EVENT', this.handler_event, this);

        this.info_btn = new CustomButton(this.scene, loading_vars['W'] * 0.905, 45, () => {this.handler_info()}, 'common1', 'btn_que', 'btn_que', 'btn_que', this, null, null, 1);
        this.add(this.info_btn);

        this.wnd_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0,'dark_overlay');
		this.wnd_overlay.setOrigin(0,0);
		this.wnd_overlay.alpha = 0.01;
		game_data['scene'].add.existing(this.wnd_overlay);
		this.wnd_overlay.setInteractive();
		this.wnd_overlay.visible = false;

        this.bringToTop(this.moving_holder);
    },

    handler_info(close_callback = () => {}) {
        this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'info', 'close_callback': close_callback});
    },

    block_interface() {
		console.log('block')
		if (this.wnd_overlay) this.wnd_overlay.visible = true;
	},

	unblock_interface() {
		console.log('unblock')
		if (this.wnd_overlay) this.wnd_overlay.visible = false;
	},

    is_paused() {
        return this.timer_panel.is_paused();
    },

    pause_timer() {
        this.timer_panel.pause_timer();
        if (this.level_active) {
            this.timer_panel.pause_timer();
        }
    },

    resume_timer() {
        if (this.level_active) {
            this.timer_panel.resume_timer();
        }
    },

    level_failed() {
        this.level_fail = true;
        this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'level_failed', 'currentStageAdsWatched': this.currentStageAdsWatched});
    },

    level_quit() {
        game_request.request({'level_failed': true }, params => {
            this.destroy_level();
            game_data['utils'].check_ads('level_lost');
            this.emitter.emit('EVENT', {'event': 'show_scene', 'scene_id': 'MAP', 'failed': true});
            game_data['utils'].game_play_stop();
            
        });
    },

    continue_game() {
        this.level_fail = false;
        this.tictac_played = false;
        this.allow_click = true;
        this.timer_panel.continue_game();
        this.restart_timer();
        this.check_win();
    },

    update(time, delta) {
        if (this.level_active && !paused) {

        }
    },

    show_overlay() {
        this.default_overlay.visible = true;
    },

    hide_overlay() {
        this.default_overlay.visible = false;
    },

    start_level(_params) {
        this.level_id = _params['level_id'];
        game_data['utils'].game_play_start();
        game_data['current_scene'] = 'GAME_PLAY';
        this.level_active = true;
        if (game_data['new_user'] && this.level_id === 1) {
            this.handler_info(() => {
                this.update_manager({to_increment_stage: false});
            });
        }
        else {
            this.update_manager({to_increment_stage: false});
        }
        
        
    },

    start_game_play() {
        this.restart_timer();
    },

    restart_timer() {
        this.timer_panel.restart_timer();
        if (game_data['unpaused'] === 0) {
            this.pause_timer();
        }
    },

    update_manager(params) {
        this.level_stage = 0;
        this.blocks = [];
        this.blocksState = {
            count: 0
        };
        
        this.level_data = levels[this.level_id - 1];
        // if time is not assigned then default time will be used
        if (!('time' in this.level_data)) this.level_data['time'] = game_data['default_time'];

        this.stage_panel.start_level(this.level_data);
        this.timer_panel.start_level(this.level_data);
        this.startPuzzle(this.level_data, true);
    },

    startPuzzle (level_data, first_start = false) {
        let pictures = level_data['pictures'];
        let points = level_data['points'];
        let key = pictures[this.level_stage];
        key = `level${this.level_id}_${key}`;
        this.allow_click = false;
        
        if (!this.back) {
            this.back = new Phaser.GameObjects.Image(this.scene, 0, 0, key).setOrigin(0);
            this.piece_container.add(this.back);
            this.back.setInteractive();
            if (game_data['dev_mode']) {
                this.back.on('pointerdown', (pointer, x, y) => {
                    console.log(`{x: ${Math.floor(x)}, y: ${Math.floor(y)}, radius: 60},`)
                    // { x: 60, y: 60, radius: 40 }
                });
            }
        }
        else {
            this.reveal_back.setVisible(true).setTexture(this.back.frame.texture.key);
            if (game_data['rich_fx']) {
                this.reveal_back.fx.progress = 1;
                game_data['scene'].tweens.add({
                    targets: this.reveal_back.fx,
                    // progress: 1,
                    progress: 0,
                    repeatDelay: 1000,
                    hold: 1000,
                    // yoyo: true,
                    // repeat: -1,
                    duration: 2000,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.reveal_back.setVisible(false);
                    }
                });
            }
            else {
                this.reveal_back.alpha = 1;
                game_data['scene'].tweens.add({
                    targets: [this.reveal_back],
                    ease: 'Sine.easeInOut',
                    duration: 1000,
                    alpha: 0,
                    onComplete: () => {
                        this.reveal_back.setVisible(false);
                    }
                });
                    
            }

            this.back.setTexture(key);
        }

        this.test_texts.forEach(txt => {
            txt.destroy();
        });
        this.test_texts = [];

        this.circle_imgs.forEach(img => {
            img.circle.destroy();
            img.destroy();
        });
        this.circle_imgs = [];
        
        this.txts = this.scene.add.group();

        setTimeout(() => {game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'spin'});}, 1000)
        points[this.level_stage].forEach(({ x, y, radius }, i) => {

            let img = new Phaser.GameObjects.Image(this.scene, 0, 0, key).setOrigin(0);
            this.circle_imgs.push(img);
            this.piece_container.add(img);

            const ox = 0 + (x / img.width);
            const oy = 0 + (y / img.height);
            img.setOrigin(ox, oy);
            img.setPosition(img.width * ox, img.height * oy);
            let target_angle = Phaser.Utils.Array.GetRandom(this.angles);
            this.scene.tweens.add({
                targets: [img],
                ease: 'Back.easeInOut',
                duration: 2000,
                delay: 1500,
                angle: Phaser.Utils.Array.GetRandom([360,720,1080,1440,1800]) + target_angle,
                onComplete: () => {
                    circle.allow_click = true;
                    this.allow_click = true;
                    if (first_start && i === 0) this.start_game_play();
                }
              });

            let pt = game_data['utils'].toGlobal(this.piece_container, new Phaser.Geom.Point(x,y));
            let circle = this.scene.add.graphics({fillStyle: { color: 0x000, alpha: 0 }}).setPosition(pt.x, pt.y).fillCircle(0, 0, radius);
            let circ = new Phaser.Geom.Circle(0, 0, radius);
            circle.setInteractive({hitArea: circ,
                hitAreaCallback: Phaser.Geom.Circle.Contains,
                useHandCursor: true });
            
            circle.on('pointerdown', () => {
                let duration = 350;
                let perc = this.timer_panel.get_current_perc();
                let level_time = this.level_data['time'] * 1000
                if (perc * level_time > duration) {
                    if (circle.allow_click && this.allow_click) {
                    
                        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'piece_switch'});
                        circle.allow_click = false;
                        this.scene.tweens.add({
                            targets: [img],
                            ease: 'Back.easeOut',
                            duration: duration,
                            angle: "+=45",
                            onComplete: () => {
                                circle.allow_click = true;
                                this.check_win();
                            }
                          });
                    }
                }
            }, this);
            img.circle = circle;
            img.setMask(circle.createGeometryMask());
            let txt_info = new Phaser.GameObjects.Text(this.scene, img.x, img.y, `x:${x},\ny:${y},\nradius:${radius}`, { ...game_data['styles']['panel_text'], fontFamily:"font1", fontSize: 20, align: 'center' });
            txt_info.setOrigin(0.5);
            this.piece_container.add(txt_info);
            this.test_texts.push(txt_info);
            if (!game_data['dev_mode']) txt_info.setVisible(false);
            this.txts.add(txt_info);
        });


    },

    check_win(forced=false) {
        let is_completed = this.circle_imgs.every(img => img.angle === 0);
        if (is_completed || forced) {
            this.allow_click = false;
            if ((this.level_stage + 1) in this.level_data['pictures']) {
                this.test_texts.forEach(txt => {
                    txt.destroy();
                });
                this.circle_imgs.forEach(img => {
                    img.circle.destroy();
                    img.destroy();
                });
                this.level_stage++;
                this.stage_panel.update_panel(this.level_stage);
                this.startPuzzle(this.level_data);
                game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'stage_complete'});
            }
            else {
                this.level_stage++;
                this.stage_panel.update_panel(this.level_stage);
                this.level_complete();
            }
        }
    },

    handler_event(params) {
        switch (params['event']) {
            case 'level_failed':
                this.level_failed();
                break;
            case 'check_win':
                this.check_win();
                break;
            case 'pause_timer':
                this.pause_timer();
                break;
            case 'resume_timer':
                this.resume_timer();
                break;
            default:
                this.emitter.emit('EVENT', params);
            break;
        }
    },

    level_complete() {
        clearTimeout(this.clear_tid);
        this.remove_countdown_tween();
        this.timer_panel.level_complete();
        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'level_complete'});
        this.tictac_played = false;
        game_data['utils'].check_ads('level_win');
        this.confetti_anim();
        this.scene.time.addEvent({
            delay: 1500,
            callbackScope: this,
            callback: function() {
                this.stop_confetti();
            }
        });
        game_request.request({'level_complete': true, 'level_id': this.level_id, 'star_collected': true}, res => {
            if (res && res['success']) {
                game_data['game_map'].update_levels({'passed_id': this.level_id});
                if (res['happy_moment']) game_data['utils'].happy_moment();
                this.emitter.emit('EVENT', {
                    'event': 'show_window',
                    'window_id': 'level_complete',
                    'level_id': this.level_id,
                    'first_complete': res['first_complete']
                });
            }
        });
    },

    confetti_anim() {
        this.confetti_time = game_request.get_time();
        let shape = new Phaser.Geom.Rectangle(0, -50, loading_vars['W'], -20);
        let emitter = this.scene.add.particles(0, 0, 'common1', {
            frame: { frames: [ 'con1', 'con2', 'con3',  'con4', 'con5', 'con6']},
            alpha: { start: 1, end: 0.7 },
            scaleX: { start: 1.2, end: -1 },
            scaleY: { start: 1, end: 0.8 },
            speed: { min: -100, max: 100 },
            lifespan: 3500,
            gravityY: 250,
            rotate: { onEmit: ()=> { return Math.random()*360; } },
            onUpdate: (particle) => {
                return particle.angle + 1
                },
            blendMode: 'NORMAL',
            emitZone: { type: 'random', source: shape },
        });
        game_data['moving_holder'].add(emitter);
        this.confetti_emitter = emitter;
    },

    stop_confetti() {
        let now = game_request.get_time();
        let timeout = 10;
        if (now - this.confetti_time < 2000) timeout = now - this.confetti_time;
        if (timeout < 0) timeout = 10;
        setTimeout(() => {
            if (this.confetti_emitter) {
                this.confetti_emitter.stop();
                setTimeout(() => {
                    if (this.confetti_emitter) this.confetti_emitter.destroy();
                }, 2800);
            }
        }, timeout);
    },

    rewarded_ad_watched() {
        this.currentStageAdsWatched++;
    },

    destroy_level() {
        this.back.destroy();
        this.back = null;
        this.level_active = false;
        this.level_fail = false;
        this.tictac_played = false;
        this.currentStageAdsWatched = 0;
        this.timer_panel.destroy_level();
        this.remove_countdown_tween();
        this.stage_panel.destroy_level();
        this.circle_imgs.forEach(img => {
            img.circle.destroy();
            img.destroy();
        });
        
    },

    remove_countdown_tween() {
        this.timer_panel.remove_countdown_tween();
    },

    update_language() {

    }
});