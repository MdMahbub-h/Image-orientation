let HintPanel = new Phaser.Class({

	Extends: Phaser.GameObjects.Container,

	initialize:

	function HintPanel()
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
	},

	init(params) {
        this.moving_holder = params['moving_holder'];
        this.btn_hint = new CustomButton(this.scene, 0, 0, () => {
            if (game_data['game_play'].allow_click) this.handler_hint();
        }, 'common1', 'btn_level', 'btn_level', 'btn_level', this, null, null, 1);
        this.add(this.btn_hint);
        let ico = new Phaser.GameObjects.Image(this.scene, 0, 0,'common1', 'hint').setScale(0.65);
        this.btn_hint.add(ico);

        this.price_cont = new Phaser.GameObjects.Container(this.scene, -40, 20);
        this.add(this.price_cont);
        ico = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'money_ico').setScale(0.9);
        this.price_cont.add(ico);

        this.hint_price = new Phaser.GameObjects.Text(this.scene, -3, -3, game_data['boosters']['hint'], {fontFamily:"font2", fontSize: 30, color:'#a86233', stroke: '#ffe1a1', strokeThickness: 3});
        this.hint_price.setOrigin(0.5);
        this.price_cont.add(this.hint_price);
	},

    start_level(level_data) {

        
    },

    handler_hint() {
        if (game_data['user_data']['money'] >= game_data['boosters']['hint']) {
            let candidates = game_data['game_play'].circle_imgs.filter(img => img.angle !== 0).filter(img => img.circle.allow_click);
            
            if (candidates.length) {
                game_request.request({'buy_booster': true, 'booster_id': 'hint'}, res => {
                    if (res['success']) {
                        game_data['audio_manager'].sound_event({'play': true, 'sound_name': 'hint'});
                        this.emitter.emit('EVENT', {'event': 'update_money'});
                        let candidate = Phaser.Utils.Array.GetRandom(candidates);
                        candidate.circle.allow_click = false;
                        // this.pause_timer();
                        this.emitter.emit('EVENT', {'event': 'pause_timer'});
                        let pt_start = new Phaser.Geom.Point(this.btn_hint.x, this.btn_hint.y);
                        pt_start = game_data['utils'].toGlobal(this.btn_hint.parentContainer, pt_start);
                        let pt_end = game_data['utils'].toGlobal(candidate.parentContainer, new Phaser.Geom.Point(candidate.x, candidate.y));
                        let pt1 = new Phaser.Geom.Point((2 * pt_start.x + pt_end.x) / 3, pt_start.y - 200);
                        let pt2 = new Phaser.Geom.Point((pt_start.x + 2 * pt_end.x) / 3, pt_end.y + 200);	
                        this.create_emitter_hint(pt_start, pt1, pt2, pt_end, () => {
                            this.scene.tweens.add({
                                targets: [candidate],
                                ease: 'Back.easeOut',
                                duration: 350,
                                angle: 0,
                                onComplete: () => {
                                    candidate.circle.allow_click = true;
                                    this.emitter.emit('EVENT', {'event': 'check_win'});
                                    this.emitter.emit('EVENT', {'event': 'resume_timer'});
                                    // this.check_win();
                                    // game_data['game_play'].resume_timer();
                                }
                              });                
                        });
                    }
                    else {
                        console.log('no money')
                        if (game_data['allow_shop'])
                            this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money'});
                        else {
                            let pt = game_data['utils'].toGlobal(game_data['game_map'].user_money, new Phaser.Geom.Point(0, 0));
                            game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'shop', 'phrase_id': '1', 'values': []});
                        }
                        
                    }
                    
                });
            }
            else {
                console.log('no candidates')
            }
        }
        else {
            if (game_data['allow_shop'])
                this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money'});
            else {
                let pt = game_data['utils'].toGlobal(game_data['game_map'].user_money, new Phaser.Geom.Point(0, 0));
                game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'shop', 'phrase_id': '1', 'values': []});
            }
            console.log('no money')
        }
        
    },

    create_emitter_hint(pt_start, pt1, pt2, pt_end, on_complete = () => {}) {
		let timeout = 10;
		// let key = hint_elem ? 'light_star' : 'particle10'
		let key = 'particle16';
		
        timeout = 450;
        let curve = new Phaser.Curves.CubicBezier(pt_start, pt1, pt2, pt_end);
        // key = Math.random() < 0.5 ? 'light_star' : 'particle10';
        key = Math.random() < 0.5 ? 'particle15' : 'particle16';
        let prtcl = game_data['scene'].add.particles(0,0,'common1', {
            frame: key,
            scale: { start: 1.5, end: 0.3 },
            // scale: { start: 0.7, end: 0.3 },
            speed: { min: -15, max: 15 },
            frequency: 25,
            maxParticles: 20, //30 , 25
            blendMode: 'ADD',
            emitZone: { type: 'edge', source: curve, quantity: 20, yoyo: false }
        });
        let prtcl2;
        this.moving_holder.add(prtcl);
        setTimeout(() => {
            // key = Math.random() < 0.5 ? 'particle11' : 'particle12' 
            key = Math.random() < 0.5 ? 'particle15' : 'particle16' 
            prtcl2 = game_data['scene'].add.particles(0,0,'common1', {
                frame: key,
                scale: { start: 1.5, end: 0.3 },
                // scale: { start: 0.7, end: 0.3 },
                speed: { min: -15, max: 15 },
                frequency: 25,
                maxParticles: 18,
                blendMode: 'ADD',
                emitZone: { type: 'edge', source: curve, quantity: 18, yoyo: false }
            });
            this.moving_holder.add(prtcl2);
        }, 20);

        setTimeout(() => {
            on_complete();
        }, timeout);
		
	},

    destroy_level() {
        // this.panels.forEach(panel => panel.destroy());
    }


});
