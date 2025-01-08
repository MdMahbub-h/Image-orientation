let SelectLanguage = new Phaser.Class({
 
	Extends: Phaser.GameObjects.Container,   

	initialize:

	function SelectLanguage()
    {
        this.scene = game_data['scene'];
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);        
        this.emitter = new Phaser.Events.EventEmitter();
    },


init(params) {  	
	this.create_assets();	
},	

create_assets() {
	let langs = game_data['langs'];
	let button_lang;	
	let button_lang_on;
	let button_lang_off;
	let dx = 150;
	
	this.buttons_lang = [];
	
	for (let i = 0; i < langs.length; i++) {
		button_lang = new Phaser.GameObjects.Container(this.scene, -(langs.length - 1) / 2 * dx +  i * dx, 0);
		this.add(button_lang);
		
		button_lang_on = new Phaser.GameObjects.Image(this.scene, 0, 0, 'common1', 'lang_' + langs[i]);
		button_lang_on.setOrigin(0.5, 0.5);
		button_lang.add(button_lang_on);
		
		button_lang_off = new CustomButton(this.scene, 0, 0, () => {
            this.handler_language_click(langs[i]);
        }, 'common1', 'lang_' + langs[i], 'lang_' + langs[i], 'lang_' + langs[i], this);
		button_lang.add(button_lang_off);
        button_lang_off.scale = 0.65;
		this.buttons_lang.push({'lang': langs[i].toUpperCase(), 'button_on': button_lang_on, 'button_off': button_lang_off});
	}
	
	this.update_buttons();
	this.update_language();
},

update_buttons() {  
	let i;
	let lang = game_data['user_data']['lang'].toUpperCase();
	
	for (i = 0; i < this.buttons_lang.length; i++) {
		this.buttons_lang[i]['button_on'].visible = (lang == this.buttons_lang[i]['lang']);
		this.buttons_lang[i]['button_off'].visible = !(lang == this.buttons_lang[i]['lang']);		
	}
},

update_language() {  

},

handler_language_click(_params) {  
	let i;
	let lang;
	for (i = 0; i < this.buttons_lang.length; i++) {		
		if (_params.toUpperCase() == this.buttons_lang[i]['lang']) {			
			lang = this.buttons_lang[i]['lang'];
			game_data['user_data']['lang'] = lang.toLowerCase();
			this.update_buttons();
			this.update_language();
			this.emitter.emit("EVENT", {'event': 'update_language'});
			
			game_request.request({'select_language': true, 'lang': lang.toLowerCase()}, function(res){});
			this.handler_close();
		}
	}	
},

handler_close(params) {  
	this.close_window();
},

close_window(params) {  
	this.emitter.emit("EVENT", {'event': 'window_close'});
},

});