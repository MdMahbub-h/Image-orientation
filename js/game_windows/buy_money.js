let BuyMoney = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function BuyMoney()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {
    let button_close = new CustomButton(game_data['scene'], 550, -250, this.handler_close, 'common1', 'icon_close', 'icon_close', 'icon_close', this);
    this.add(button_close);

    let res = game_data['utils'].generate_string({
		'scene_id': 'shop', 'item_id': '1', 'phrase_id': '1', 'values': [], 'base_size': 60
	});
    let temp = new Phaser.GameObjects.Text(this.scene, 0, -250, res['text'], { ...game_data['styles']['title'], fontFamily:"font1", fontSize: res['size'], align: 'center' });
	temp.setOrigin(0.5);
    this.add(temp);
    this.title = temp;

    this.money_pt = params['money_pt'];
	let pts = [{x:-370, y:0}, {x:-120, y:0}, {x:130, y:0}, {x:380, y:0}];
	this.shop_list = [];
    this.shop_list = game_data['shop'].filter(function(el, index, arr){
        return (el['type'] == 'money');
    });

    this.shop_list.sort((a,b) => (a.amount < b.amount) ? -1 : ((b.amount < a.amount) ? 1 : 0));

    for (let i = 0; i < this.shop_list.length && i < pts.length; i++) {
		let _item = new BuyMoneyItem(this.scene);
		_item.x = pts[i].x;
		_item.y = pts[i].y;		
		this.add(_item);
		
		_item.init({'item_info': this.shop_list[i], 
						'free': false,
						'no': String(i+1),
						'icon': 'money_' + String(i+1),
						'money_pt': this.money_pt,
						'holder': this
					});	
		
		_item.emitter.on('EVENT', this.handler_event, this);	
	};	


    this.no_ads_cont = new Phaser.GameObjects.Container(this.scene, -30, -50)
	this.add(this.no_ads_cont)
	temp = new Phaser.GameObjects.Image(this.scene, 30, 320, 'common1', 'panel2');
	temp.scaleX = 1.2;
	// temp.setScale(0.65)
	// temp.scaleY = 0.5
	this.no_ads_cont.add(temp);

	str_obj = {'scene_id': 'game_windows', 'item_id': 'buy_money', 'phrase_id': 'tip', 'values': [], 'base_size': 20}
	res = game_data['utils'].generate_string({
		'scene_id': 'game_windows',
		'item_id': 'buy_money',
		'phrase_id': 'tip',
		'values': [],
		'base_size': 28
	});
	temp = new Phaser.GameObjects.Text(this.scene, -45, 320, res['text'], {
		...game_data['styles']['light_text2'],
		fontFamily: 'font1',
		fontSize: res['size'],
		wordWrap: {'width': 300}
	});			
	temp.setOrigin(0, 0.5);
	this.no_ads_cont.add(temp);
	this.no_ads_txt = temp
	temp = new Phaser.GameObjects.Image(this.scene, temp.x - 55, 320, 'common1', 'no_ads');
	temp.setScale(0.8);
	this.no_ads_cont.add(temp);
	this.no_ads_ico = temp

	let total_payments = game_data['user_data']['payments']['total'];
	this.no_ads_cont.setVisible(total_payments === 0);
},

handler_event(params) {  
	switch (params['event']) {
		case 'shop_click':
			this.no_buy = false;
			break;
		case 'window_close': 
			this.close_window(params)
			break;
		default:
			this.emitter.emit('EVENT', params);
			break;
	}
	
},


handler_close(params) {
	this.close_window();
},

close_window(params) {
	this.emitter.emit("EVENT", {'event': 'window_close'});
},

});