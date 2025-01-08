let TestAdManager = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function TestAdManager(scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
		this.create_assets();
	},

	create_assets() {
        this.default_overlay = new Phaser.GameObjects.Image(this.scene, 0, 0, 'dark_overlay');
		this.default_overlay.setOrigin(0,0);
		this.default_overlay.alpha = 1;
		this.add(this.default_overlay);
		this.default_overlay.setInteractive();

        this.value_txt = new Phaser.GameObjects.Text(this.scene, loading_vars['W'] / 2, loading_vars['H'] / 2, '5', {fontFamily:"font2", fontSize: 90, color:'#fff'});
        this.value_txt.setOrigin(0.5);
        this.add(this.value_txt);

        this.desc_txt = new Phaser.GameObjects.Text(this.scene, loading_vars['W'] / 2, this.value_txt.y + 70, 'Test desc', {fontFamily:"font2", fontSize: 45, color:'#fff'});
        this.desc_txt.setOrigin(0.5);
        this.add(this.desc_txt);
        this.setVisible(false);
	},

    call_ad(params, on_complete = () => {}) {
        this.setVisible(true);
        let { type } = params;
        let res = game_data['utils'].generate_string({'scene_id': 'test_ad', 'item_id': type, 'phrase_id': '1', 'values': [], 'base_size': 45});
        this.desc_txt.setText(res['text']);
        this.desc_txt.setFontSize(res['size']);

        let obj = {val: 5};
        this.value_txt.setText(obj['val']);
        game_data['scene'].tweens.add({
            targets: obj,
            val: 0,
            duration: obj['val'] * 1000,
            onUpdate: () => {
                this.value_txt.setText(Math.ceil(obj['val']));
            },
            onComplete: () => {
                this.setVisible(false);
                on_complete();
            }
        });
    }

});
