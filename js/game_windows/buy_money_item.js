let BuyMoneyItem = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,

	initialize:

	function BuyMoneyItem (scene)
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  
	this.holder = params['holder'];
	this.item_info = params['item_info'];
	this.icon = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', params['icon']);
	this.money_pt = params['money_pt'];	
	this.allow_buy = true;
	
	this.bg = new CustomButton(this.scene, 0, 0, this.handler_buy, 'common1', 'panel5', 'panel5', 'panel5', this);
    this.add(this.bg);	
	this.add(this.icon);

	
	let txt = new Phaser.GameObjects.Text(this.scene, 0, -130, this.item_info['amount'], {fontFamily:"font1", fontSize: 45, color:'#f6caa0', stroke: '#886D13', strokeThickness: 8});				
	txt.setOrigin(0.5);
	this.add(txt);

	this.button_buy = new CustomButton(this.scene, 0, 130, this.handler_buy, 'common1', 'btn_play2', 'btn_play2', 'btn_play2', this);
	this.button_buy.setScale(0.8)
    this.add(this.button_buy);	
	
	let button_txt = new Phaser.GameObjects.Text(this.scene, 0, 0, this.item_info['price'], {...game_data['styles']['light_text'], fontFamily:"font1", fontSize: 40});				
	button_txt.setOrigin(0.5);
	button_txt.x = this.button_buy.x;
	button_txt.y = this.button_buy.y - 1;
	this.add(button_txt);
	button_txt.text = button_txt.text + " $";

},


handler_buy(params) {
	if (this.allow_buy) {
		this.allow_buy = false;
		this.emitter.emit('EVENT', {'event': 'shop_click'});
		setTimeout(() => {this.allow_buy = true;}, 2000);

			game_data['utils'].purchase({'item_info': this.item_info}, payment_info => {
				if ('success' in payment_info && payment_info['success']) {				
					game_request.request({'update_purchase': true, 'item_info': this.item_info}, res => {	
						if (this.scene) this.display_add_money();
					});
				}
				else {
					this.emitter.emit('EVENT', {'events': [{'event': 'window_close', 'immediate': true}, 
													{'event': 'show_window', 'window_id': 'purchase_failed', 'center_pt': this.center_pt}
					]});
				}			
			});
		}
},

display_add_money() {
	let pt = new Phaser.Geom.Point(this.icon.x, this.icon.y);
	pt = game_data['utils'].toGlobal(this, pt);
	setTimeout(() => {
		game_data['audio_manager'].sound_event({'event': 'sound_event','play': true, 'sound_name': 'coin_add'});
	},600);
	game_data['utils'].fly_items({'amount': 5,						
								'holder': this.holder,
								'item_atlas': 'common1',
								'item_name': 'money_ico',
								'pt_start': pt,
								'pt_end': this.money_pt	
								}, 
	() => {	
		if (this.scene) {
			this.emitter.emit('EVENT', {'event': 'update_money'});
			this.emitter.emit('EVENT', {'event': 'window_close'});
		}
	});
},


handler_close(params) {  
	this.close_window(params)
},

close_window(params) {  
	this.emitter.emit('EVENT', {'event': 'window_close'});
},	

});