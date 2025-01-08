let CustomButton = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function CustomButton (scene, _x, _y, _click, _atlas, _out, _over, _down, _context, _handler_over = null, _handler_out = null, _scale = 1)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
		this.click = _click;
		this.handler_over = _handler_over;
		this.handler_out = _handler_out;
		this.was_down = false;
		this.text = null;
		this.out = new Phaser.GameObjects.Image(this.scene, 0, 0, _atlas, _out);
		this.over = new Phaser.GameObjects.Image(this.scene, 0, 0, _atlas, _over);
		this.down = new Phaser.GameObjects.Image(this.scene, 0, 0, _atlas, _down);
		this.out.setScale(_scale);
		this.over.setScale(_scale);
		this.down.setScale(_scale);
		this.add(this.out);
		this.add(this.over);
		this.add(this.down);
		this.x = _x;
		this.y = _y;
		this.out.setInteractive({useHandCursor: true});
		this.set_out();
		this.out.on('pointerdown', () => this.set_down() );
		this.out.on('pointerover', () => {
			this.set_over();
			if (this.handler_over) this.handler_over.apply(_context, arguments); 
		});
		this.out.on('pointerout', () => { 
			this.set_out();
			if (this.handler_out) this.handler_out.apply(_context, arguments); 
		});
		
		this.out.on('pointerup', () => {
			if (this.was_down) {
				this.set_over(false); 
				this.click.apply(_context, arguments); 
				this.was_down = false;
			}
			
		});
	},

	set_handler(_click) {
		this.click = _click;
	},

	set_over(with_sound = true) {
		this.over.visible = true;
		this.down.visible = false;
		if (with_sound) game_data['audio_manager'].sound_event({'play': true,  'sound_name': 'button_over'});
	},
	set_out() {
		this.over.visible = false;
		this.down.visible = false;
		this.was_down = false;
	},
	set_down() {
		this.over.visible = false;
		this.down.visible = true;
		this.was_down = true;
		game_data['audio_manager'].sound_event({'play': true,  'sound_name': 'button_click'});
	},
	addText(_val) {
		if (this.text) this.destroy();
		this.text = _val;
		this.text.setOrigin(0.5);
		this.add(this.text);
	},
	setText(_val) {
		if (this.text) 
			this.text.setText(_val);

	}

  
});
