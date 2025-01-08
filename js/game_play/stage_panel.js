let StagePanel = new Phaser.Class({

	Extends: Phaser.GameObjects.Container,

	initialize:

	function StagePanel()
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
	},

	init(params) {
        this.stage_shine = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'luchi');
		this.add(this.stage_shine);
		this.stage_shine.visible = false;
	},

    start_level(level_data) {
        let pictures = level_data['pictures'];
        this.panels = [];
        let x = -90;
        for (let i = 0; i < pictures.length; i++) {
            let panel = new Phaser.GameObjects.Image(this.scene, x, 0, 'common1', 'panel_2');
            this.panels.push(panel);
            this.add(panel);
            
            let no = new Phaser.GameObjects.Text(this.scene, x - 1, 0, i+1, { ...game_data['styles']['panel_text'], fontFamily:"font1", fontSize: 50, align: 'center' });
            no.setOrigin(0.5);
            this.add(no);
            panel.no = no;
            x += 90;
        }
        x -= 90;
        this.x = loading_vars['W'] / 2 - x / 2 + 90 / 2;
        this.update_panel();
        
    },

    update_panel(current_stage = 0) {

        for (let i = 0; i < this.panels.length; i++) {
            let panel = this.panels[i];
            if (i < current_stage) {
                panel.setFrame('panel_3');
                panel.no.text = '';
            }
            else if (i === current_stage) {
                panel.setFrame('panel_1');
                if (i !== 0) {
                    this.stage_shine.scale = 0.1;
                    this.stage_shine.visible = true;
                    this.stage_shine.x = panel.x;
                    this.stage_shine.y = panel.y;
            
                    game_data['scene'].tweens.add({targets: this.stage_shine, scale: 2, yoyo: true, duration: 600});
                    game_data['scene'].tweens.add({targets: this.stage_shine, angle: 360, duration: 1000, onComplete: ()=>{
                        this.stage_shine.angle = 0;
                        this.stage_shine.visible = false;
                    }});
                }

            }
            else if (i > current_stage) {
                
            }
        }
    },

    destroy_level() {
        this.panels.forEach(panel => panel.destroy());
    }


});
