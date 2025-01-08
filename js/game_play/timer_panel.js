let TimerPanel = new Phaser.Class({

	Extends: Phaser.GameObjects.Container,

	initialize:

	function TimerPanel()
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
	},

	init(params) {
        this.time_obj = {};
        this.attr = {};
        this.moving_holder = params['moving_holder'];

        this.progress_bar = new Phaser.GameObjects.Container(this.scene, 0, 0); 
        this.progress_bar.angle = -90;
        this.progress_bar_top = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'video_reward_progressbar1');
        this.progress_bar_bg = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'video_reward_progressbar2');
        this.progress_bar_line = new Phaser.GameObjects.Image(this.scene, 4 - this.progress_bar_top.width / 2, -1.4, 'common1', 'video_reward_progressbar3');
        this.progress_bar_line.setOrigin(0,0.5);

        this.progress_bar_line2 = new Phaser.GameObjects.Image(this.scene, 4 - this.progress_bar_top.width / 2, -1.4, 'common1', 'video_reward_progressbar3');
        this.progress_bar_line2.setOrigin(0,0.5);
        this.progress_bar_line2.setTintFill(0xd23333);
        this.progress_bar_line2.setVisible(false);

        this.progress_bar.max_scale = (this.progress_bar_bg.width - 8) / this.progress_bar_line.width
        this.progress_bar_line.scaleX = this.progress_bar.max_scale;
        this.progress_bar_line.scaleY =  1.2;

        this.progress_bar_line2.scaleX = this.progress_bar.max_scale;
        this.progress_bar_line2.scaleY =  1.2;
        
        this.progress_bar.add(this.progress_bar_bg);
        this.progress_bar.add(this.progress_bar_line);
        this.progress_bar.add(this.progress_bar_line2);
        this.progress_bar.add(this.progress_bar_top);

        this.add(this.progress_bar);

        game_data['scene'].tweens.add({
            targets: this.progress_bar_line2,
            alpha: 0,
            yoyo: true,
            repeat: -1,
            duration: 450,
            ease: 'Sine.easeInOut',
        });
	},

    start_level(level_data) {
        this.level_data = level_data;
        
    },

    continue_game() {
        this.progress_bar_line2.setVisible(false);
        game_data['scene'].tweens.add({
            targets: this.progress_bar_line,
            scaleX: this.progress_bar.max_scale,
            duration: 450,
            ease: 'Sine.easeInOut',
        });
        game_data['scene'].tweens.add({
            targets: this.progress_bar_line2,
            scaleX: this.progress_bar.max_scale,
            duration: 450,
            ease: 'Sine.easeInOut',
        });
    },

    restart_timer() {
        this.time_obj = {
            val: this.progress_bar.max_scale
        }
        this.countdown_tween = game_data['scene'].tweens.add({targets:this.time_obj, val: 0, duration: this.level_data['time'] * 1000,
            onComplete: () => {
                this.allow_click = false;
                // this.level_failed();
                this.emitter.emit('EVENT', {'event': 'level_failed'});
                this.progress_bar_line2.setVisible(false);
            },
            onUpdate: () => {
                this.progress_bar_line.scaleX = this.time_obj.val;
                this.progress_bar_line2.scaleX = this.time_obj.val;
                let perc = this.time_obj.val / this.progress_bar.max_scale;
                if (perc <= 0.15 && !this.tictac_played) {
                    game_data['audio_manager'].sound_event({'play': true,  'sound_name': 'tic-tac'});
                    this.tictac_played = true;
                    this.progress_bar_line2.setVisible(true);
        
                }
            }
        });
    },

    level_complete() {
        game_data['scene'].tweens.add({
            targets: this.progress_bar_line,
            scaleX: this.progress_bar.max_scale,
            duration: 450,
            ease: 'Sine.easeInOut',
        });
        game_data['scene'].tweens.add({
            targets: this.progress_bar_line2,
            scaleX: this.progress_bar.max_scale,
            duration: 450,
            ease: 'Sine.easeInOut',
        });
        this.progress_bar_line2.setVisible(false);
    },

    remove_countdown_tween() {
        try {
            if (this.countdown_tween) {
                this.countdown_tween.pause();
                this.countdown_tween.remove();
            }
        }
        catch(err) {

        }
    },

    pause_timer() {
        try {
            if (this.countdown_tween) {
                this.countdown_tween.pause();
            }
        }
        catch(err) {
        }
    },

    resume_timer() {
        try {
            this.attr['paused'] = false;
            if (this.countdown_tween) {
                this.countdown_tween.resume();
            }
        }
        catch(err) {
        }
    },

    get_current_perc() {
        return this.time_obj.val / this.progress_bar.max_scale;
    },

    is_paused() {
        return this.attr && this.attr['paused'];
    },

    destroy_level() {
        this.progress_bar_line.scaleX = this.progress_bar.max_scale;
        this.progress_bar_line2.scaleX = this.progress_bar.max_scale;
        this.progress_bar_line2.setVisible(false);
    }


});
