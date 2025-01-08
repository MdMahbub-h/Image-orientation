let GameMap = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function GameMap (scene)
	{
		this.scene = game_data['scene'];
		Phaser.GameObjects.Container.call(this, scene, 0, 0);        
		this.emitter = new Phaser.Events.EventEmitter();
		this.game_started = 0;
		this.params = {
			'items_per_page': 20
		}
	},


init(params) {
	game_data['game_map'] = this;
	this.create_assets();
},

reset_music() {
	game_data['audio_manager'].sound_event({'stop_all': true});	
	game_data['audio_manager'].sound_event({
		'play': true, 'loop': true, 'sound_type': 'music',
		'sound_name': 'music_map', 'audio_kind': 'music',
		'map': true
	});	
},

show_map(obj = {}) {
	if (!obj['first_complete']) this.update_money();
	if (obj['init']) game_data['utils'].check_ads('game_start');
},

handler_options(params) {	
	this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'options'});
},

get_money_pt() {
	return game_data['utils'].toGlobal(game_data['game_map'], 
				new Phaser.Geom.Point(game_data['game_map'].container_user_money.x, game_data['game_map'].container_user_money.y));
},

update_language() {
},

create_assets() {
	this.button_options = new CustomButton(this.scene, loading_vars.W - 50, 40, this.handler_options, 'common1', 'btn_options', 'btn_options', 'btn_options', this, null, null, 1);
	game_data['options_holder'].add(this.button_options);

	this.container_user_money = new Phaser.GameObjects.Container(this.scene, 120, 50);
	game_data['money_holder'].add(this.container_user_money);
	this.user_money = new CustomButton(this.scene, 0, 0, this.handler_buy_money, 'common1', 'panel4', 'panel4', 'panel4', this);
	this.container_user_money.add(this.user_money);
	this.user_money_coin = new Phaser.GameObjects.Image(this.scene, -45, -2, 'common1', 'money_ico');
	this.container_user_money.add(this.user_money_coin);
	this.user_money_txt = new Phaser.GameObjects.Text(this.scene, 30, -5, '', {
		fontFamily:"font2", fontSize: 30, color:'#a86233', stroke: '#ffe1a1', strokeThickness: 3});
	this.user_money_txt.setOrigin(0.5);
	this.container_user_money.add(this.user_money_txt);

	this.create_levels();
	this.update_money();
	let { items_per_page } = this.params;
	this.current_page = Math.floor(game_data['user_data']['levels_passed'].length/items_per_page);
	if (this.current_page < 0) this.current_page = 0;
	if (this.current_page > this.total_pages - 1) this.current_page = this.total_pages - 1;

	this.btn_left = new CustomButton(this.scene, loading_vars.W * 0.1, loading_vars['H'] * 0.53, () => {
		this.handler_left();
	}, 'common1', 'btn_play1', 'btn_play1', 'btn_play1', this, null, null, 0.85);
	this.btn_left.scaleX = -1;
	this.add(this.btn_left);

	this.btn_right = new CustomButton(this.scene, loading_vars.W * 0.9, loading_vars['H'] * 0.53, () => {
		this.handler_right();
	}, 'common1', 'btn_play1', 'btn_play1', 'btn_play1', this, null, null, 0.85);
	this.add(this.btn_right);

	this.update_levels();
	this.update_buttons();
},

update_buttons() {
	this.btn_left.setVisible(true);
	this.btn_right.setVisible(true);

	if (this.current_page === 0) this.btn_left.setVisible(false);
	if (this.current_page === this.total_pages - 1) this.btn_right.setVisible(false);
	this.pages.forEach(page => page.setVisible(false));
	
	this.pages[this.current_page].setVisible(true);

	let page_requered_stars = game_data['utils'].page_requered_stars(this.current_page);

	let lock_vis = page_requered_stars > 0;
	this.pages[this.current_page].items_group.setAlpha(lock_vis ? 0.5 : 1);

},

handler_right() {
	this.current_page++;
	if (this.current_page > this.total_pages - 1) this.current_page = this.total_pages - 1;
	this.update_buttons();
	
},

handler_left() {
	this.current_page--;
	if (this.current_page < 0) this.current_page = 0;
	this.update_buttons();
},

create_levels() {
	this.level_items = [];
	let coords = [
		{x: 0, y: 0}, {x: 140, y: 0}, {x: 280, y: 0}, {x: 420, y: 0}, {x: 560, y: 0},
		{x: 0, y: 140}, {x: 140, y: 140}, {x: 280, y: 140}, {x: 420, y: 140}, {x: 560, y: 140},
		{x: 0, y: 280}, {x: 140, y: 280}, {x: 280, y: 280}, {x: 420, y: 280}, {x: 560, y: 280},
		{x: 0, y: 420}, {x: 140, y: 420}, {x: 280, y: 420}, {x: 420, y: 420}, {x: 560, y: 420},
	];
	let { items_per_page } = this.params;
	let levels_total = levels.length;
	let total_pages = Math.ceil(levels_total / items_per_page);
	this.total_pages = total_pages;
	this.pages = [];
	let level_id = 1;
	
	
	for (let i = 0; i < total_pages; i++) {
		let page = new Phaser.GameObjects.Container(this.scene, loading_vars['W'] / 2 - 280, 180);
		this.add(page);
		page.items_group = this.scene.add.group();
		this.pages.push(page);

		let _items_per_page = items_per_page;
		if ((i+1) * items_per_page > levels_total) _items_per_page = levels_total - i * items_per_page

		for (let j = 0; j < _items_per_page; j++) {
			let { x, y } = coords[j];
			let id = level_id;
			let level_item = new CustomButton(this.scene, x, y, () => {
				this.handler_play(id, level_item);
			}, 'common1', 'btn_level', 'btn_level', 'btn_level',  this, null, null, 1);
			page.add(level_item);
			page.items_group.add(level_item);
			level_item.id = id;

			let level_no = new Phaser.GameObjects.Text(this.scene, 0, -5, level_id, {fontFamily:"font2", fontSize: 45, color:'#ffffff'});
			level_no.setOrigin(0.5);
			level_item.add(level_no);
			level_id++;

			
			let star = new Phaser.GameObjects.Image(this.scene, 0, -55, 'common1', 'star_unactive');
			star.scale = 0.8;
			level_item.add(star);
			level_item.star = star;
			this.level_items.push(level_item);
		}
	}
	
},

update_levels() {
	let levels_passed = game_data['user_data']['levels_passed'];
	this.level_items.forEach(item => {
		let texture;
		if ((item.id - 1) in levels_passed && levels_passed[item.id - 1] === 1) {
			texture = 'star_active';
		}
		else {
			texture = 'star_unactive';
		}
		if (texture) {
			item.star.setTexture('common1', texture);
			item.star.setVisible(true);
		}
		else {
			item.star.setVisible(false);
		}
	});
	
},

new_score() {
},

handler_buy_money() {
	if (game_data['allow_shop'])
		this.emitter.emit('EVENT', {'event': 'show_window', 'window_id': 'buy_money'});
	else {
		let pt = game_data['utils'].toGlobal(this.user_money, new Phaser.Geom.Point(0, 0));
		game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_tip', 'item_id': 'tip', 'phrase_id': 'money', 'values': []});
	}
},

update_money() {
	this.user_money_txt.setText(game_data['user_data']['money']);
},

handler_play(id, level_item) {
	this.start_level(id, level_item);
},

update() {
	
},

start_level(level_id, level_item) {
	let passed = game_data['utils'].get_passed_amount();
	if (loading_vars['demo_mode'] && passed >= 3 && level_id > 3) {
		let pt = game_data['utils'].toGlobal(level_item, new Phaser.Geom.Point(0, 0));
		game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_map', 'item_id': 'demo', 'phrase_id': '1', 'values': []});
	}
	else {
		if (game_data['utils'].is_level_available(level_id) || game_data['dev_mode']) {
			game_data['utils'].check_ads('level_start');
			this.emitter.emit('EVENT', {'event': 'start_level', 'level_id': level_id});
			this.game_started++;
		}
		else {
			let pt = game_data['utils'].toGlobal(level_item, new Phaser.Geom.Point(0, 0));
			game_data['utils'].show_tip({'pt': pt, 'scene_id': 'game_map', 'item_id': 'level_inavailable', 'phrase_id': '1', 'values': []});
		}
	}

}
});