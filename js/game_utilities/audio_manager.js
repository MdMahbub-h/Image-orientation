class AudioManager {
    constructor(_scene) {		
        this.scene = game_data['scene'];
    }
	
	init() {
		this.audio_library = {};
		this.playing_sounds = [];
		this.sound_id = 0;
		this.unpaused = 1;
		this.play_first_map = true;
	}
	
	sound_event(sound_obj) {
		if ('preload_sounds' in sound_obj)
			this.preload_sounds();		
		
		if ('preload_sound' in sound_obj)
			this.preload_sound(sound_obj);
		
		if ('play' in sound_obj)
			this.play_sound(sound_obj);
			
		if ('stop' in sound_obj)
			this.stop_sound_type(sound_obj);
				
		if ('stop_all' in sound_obj)
			this.stop_audio();	
	}

	preload_sounds() {
		let i = 0;
		let loader = new Phaser.Loader.LoaderPlugin(this.scene);
		let allowed = [];
		let dir_url = game_data['urls']['audio'];
		for (i = 0; i < game_data['preload_sounds'].length; i++) {
			let sound_name = game_data['preload_sounds'][i];
			if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine)) {
				allowed.push(sound_name);
				loader.audio(sound_name, dir_url + sound_name + '.mp3');
			}
		}
		loader.once('complete', () => {
			for (i = 0; i < allowed.length; i++) {
				let sound_name = allowed[i];
				if (this.scene.cache.audio.exists(sound_name)) {
					let sound = this.scene.sound.add(sound_name);
					this.audio_library[sound_name] = {};
					this.audio_library[sound_name]['sound'] = sound;		
				}
			}	
			loader.destroy();
		}, this);
		loader.start();
	}

	preload_sound(sound_obj) {
		let sound_name = sound_obj['sound_name'];
		if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine)) {
			let dir_url = game_data['urls']['audio'];
			let loader = new Phaser.Loader.LoaderPlugin(this.scene);
			loader.audio(sound_name, dir_url + sound_name + '.mp3');
			loader.once('complete', () => {
				if (this.scene.cache.audio.exists(sound_name)) {
					let sound = this.scene.sound.add(sound_name);
					this.audio_library[sound_name] = {};
					this.audio_library[sound_name]['sound'] = sound;		
					
				}
				loader.destroy();
			});
			loader.start();
		}
	}
		
		
	play_sound(sound_obj) {
		let sound;
		let sound_name = sound_obj['sound_name'];			
		let audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
		sound_obj['audio_kind'] = audio_kind;
		let vol = game_data['user_data'][audio_kind] * this.unpaused;
		let config = {'volume':vol};
		if ((sound_name in this.audio_library && 'sound' in this.audio_library[sound_name]) 
			|| this.scene.cache.audio.exists(sound_name)) {
			
			if (sound_name in this.audio_library && 'sound' in this.audio_library[sound_name])
				sound = this.audio_library[sound_name]['sound'];
			else {
				sound = this.scene.sound.add(sound_name);
			} 
			if (sound) {
				if ('loop' in sound_obj)
					this.play_with_fade(sound_obj, sound); 
				else
					sound.play(config);
				this.add_playing_sound(sound_obj, sound);
			}
		}
		else if (!(sound_name in this.audio_library) && (is_localhost || navigator.onLine) ) {	
			if ('loop' in sound_obj && this.play_first_map && !('map' in sound_obj)) {
				this.play_first_map = false;
			}													
			let dir_url = game_data['urls']['audio'];
			let loader = new Phaser.Loader.LoaderPlugin(this.scene);
			loader.audio(sound_name, dir_url + sound_name + '.mp3');
			loader.once('complete', () => {
				if (this.scene.cache.audio.exists(sound_name)) {
					sound = this.scene.sound.add(sound_name);
					if (sound) {
						this.audio_library[sound_name] = {};
						this.audio_library[sound_name]['sound'] = sound;					
						if ('loop' in sound_obj) {
							if (this.play_first_map || !('map' in sound_obj))
								this.play_with_fade(sound_obj, sound); 
						}
						else sound.play(config);
						this.add_playing_sound(sound_obj, sound);
					}
				}
				loader.destroy();
			});
			loader.start();
		}
		
	}
	 
	update_volume() {
		let sound_obj;
		let audio_kind;
		if ('unpaused' in game_data) this.unpaused = game_data['unpaused'];
		for (let i = 0; i < this.playing_sounds.length; i++) {
			sound_obj = this.playing_sounds[i];
			audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
			if (sound_obj['sound'].isPlaying) sound_obj['sound'].setVolume(game_data['user_data'][audio_kind] * this.unpaused);
		}		
	}

	play_with_fade(sound_obj, sound) {
		let vol = 0;
		if (sound_obj['audio_kind'] in game_data['user_data']) vol = game_data['user_data'][sound_obj['audio_kind']] * this.unpaused;
		if (sound_obj['audio_kind'] == 'music') {
			sound.play({'volume':0, 'loop':true});
			let tweenObject = {val: 0};
			let _delay = 0;
			if (this.delay) _delay = this.delay;
			game_data['scene'].tweens.add({
				targets: tweenObject,
				val: vol,
				delay: _delay,
				duration: 1000,
				ease: "Linear",
				callbackScope: this,
				onUpdate: (tween, target) => {
					if (sound.isPlaying) sound.setVolume(target.val * this.unpaused);
				},
				onComplete: () => {
					if (sound.isPlaying) sound.setVolume(game_data['user_data'][sound_obj['audio_kind']] * this.unpaused);
				}
			});
			this.delay = 1000;
		}
		else sound.play({'volume':vol, 'loop':true});
		
	}

	stop_with_fade(sound_obj) {
		let sound = sound_obj['sound'];
		let vol = 0;
		if (sound_obj['audio_kind'] in game_data['user_data']) vol = game_data['user_data'][sound_obj['audio_kind']] * this.unpaused;
		if (sound_obj['audio_kind'] == 'music') {
			let tweenObject = {val: vol};
			game_data['scene'].tweens.add({
				targets: tweenObject,
				val: 0,
				duration: 1000,
				ease: "Linear",
				callbackScope: this,
				onUpdate: (tween, target) => {
					if (sound.isPlaying) sound.setVolume(target.val * this.unpaused);
				},
				onComplete: () => {
					sound.stop();
				}
			});
		}
		else {
			if (sound_obj['audio_type'] == 'ambience') {
				sound.off('stop');
				sound.stop(); 
				
				if (game_data['preload_sounds'].indexOf(sound_obj['sound_name']) < 0) {
					delete this.audio_library[sound_obj['sound_name']];
					setTimeout(() => {
						if (sound) sound.destroy();
						if (this.scene.cache.audio.exists(sound_obj['sound_name'])) this.scene.cache.audio.remove(sound_obj['sound_name']);	
					}, 10);
					
				}
			}
			else sound.stop();
		}
	}
	
	
	add_playing_sound(sound_obj, sound) {
		this.sound_id++;
		let sound_id = this.sound_id;
		let sound_type = ('sound_type' in sound_obj) ? sound_obj['sound_type'] : 'default';				
		let audio_kind = ('audio_kind' in sound_obj) ? sound_obj['audio_kind'] : 'sound';
		let audio_type = ('audio_type' in sound_obj) ? sound_obj['audio_type'] : 'sound';
		
		this.playing_sounds.push({
			'sound_type': sound_type,
			'audio_kind': audio_kind,
			'audio_type': audio_type,
			'sound': sound,
			'sound_id': sound_id,
			'sound_name': sound_obj['sound_name'],
			'loop': ('loop' in sound_obj)
		});

		if (audio_kind == 'sound' && !('loop' in sound_obj) && (audio_type != 'ambience')) {
			sound.once('stop', () => {
				for (let i = 0; i < this.playing_sounds.length; i++)
					if (this.playing_sounds[i]['sound_id'] == sound_id) {
						let obj = this.playing_sounds[i];
						this.playing_sounds.splice(i, 1);
						break;
					}			
			});
		}

		if (audio_type == 'ambience') {
			sound.once('stop', () => {
				for (let i = 0; i < this.playing_sounds.length; i++)
					if (this.playing_sounds[i]['sound_id'] == sound_id) {
						let obj = this.playing_sounds[i];
						let vol = game_data['user_data'][sound_obj['audio_kind']] * this.unpaused;
						obj['sound'].play({'volume':vol});
						break;
					}			
			});
		}
	}
	
	stop_sound_type(sound_obj) {
		let i;
		let obj;
		let sound_type = ('sound_type' in sound_obj) ? sound_obj['sound_type'] : 'default';
		let timeout = ('timeout' in sound_obj && sound_obj['timeout'] > 0) ? sound_obj['timeout'] : -1;
			
		for (i = 0; i < this.playing_sounds.length; i++) {				
			obj = this.playing_sounds[i];
			if (obj['sound_type'] == sound_type) 
				this.stop_sound(obj, timeout)
		}			
	}	
	
	stop_sound(obj, timeout) {
		let i;
		let sound_id = obj['sound_id'];			
		if (!(timeout > 0)) {
			this.stop_with_fade(obj);	
		}

		for (i = 0; i < this.playing_sounds.length; i++)
			if (this.playing_sounds[i]['sound_id'] == sound_id) {
				let obj = this.playing_sounds[i]
				this.playing_sounds.splice(i, 1);
				break;
			}			
	}
	
	try_destroy_sound(obj) {
		if (obj['sound_name'] in this.audio_library) {
			this.stop_with_fade(obj);
			obj = null;
		}
		else if (obj['sound']) {
				let s = obj['sound_name'];
				obj['sound'] = null;
				obj = null;
				s = null;
		}
		
	}
	
	stop_audio() {
		let obj;
		while (this.playing_sounds.length) {					
			obj = this.playing_sounds.pop();
			obj['sound'].off('stop');
			this.try_destroy_sound(obj)
		}
		
	}		
	
	init_loading(_loading_sprite) {
			
	}	

}