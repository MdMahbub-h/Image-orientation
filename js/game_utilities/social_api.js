class SocialApi{
	constructor() {		
			
	}

	make_share(_type, on_complete) {		
		if (is_localhost) {
			console.log('make_share', _type);
			on_complete({'success': true});
		}
	}

	create_wall_post(params, on_complete) {
		on_complete({'success': false});
	}
	
	show_invite() {
		
	}

	get_game_size() {
		return {'W': window.innerWidth, 'H': window.innerHeight - 20};
	}
	

	set_game_size() {
		let canvas = document.querySelector("canvas");	
		let windowWidth;
		let windowHeight;
		
		if ('scene' in game_data && game_data['scene'].scale.isFullscreen) {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
		}
		else {
			let size = this.get_game_size();
			windowWidth = size['W'];
			windowHeight = size['H'];
		}
		
		let windowRatio = windowWidth / windowHeight;
		let gameRatio = phaser_game.config.width / phaser_game.config.height;
		if(windowRatio < gameRatio){
			canvas.style.width = windowWidth + "px";
			canvas.style.height = (windowWidth / gameRatio) + "px";
		}
		else{
			canvas.style.height = windowHeight + "px";
			canvas.style.width = (windowHeight * gameRatio) + "px";
		}
	}
	
	show_interstitial_ad(on_complete = () => {}) {
		console.log('show_interstitial_ad');
		if (game_data['test_ad']) {
			pause();
			game_data.test_ad_manager.call_ad({type:'interstitial'}, () => {
				resume();
				on_complete();
			})
		}
		else {
			on_complete();
		}
		
	}
	
	show_rewarded_ad(on_complete) {
		console.log('show_rewarded_ad');
		if (game_data['test_ad']) {
			pause();
			game_data.test_ad_manager.call_ad({type:'rewarded'}, () => {
				resume();
				on_complete({ success: true });
			});
		}
		else {
			on_complete({ success: true });
		}
	}
	
	happy_moment(value) {
		console.log('happy_moment');
	}

	game_play_start(value) {
		console.log('game_play_start');
	}

	game_play_stop(value) {
		console.log('game_play_stop');
	}

	update_score(value) {
		console.log('social api update score', value);
	}

	update_level(value) {
		console.log('social api update level', value);
	}

	update_leaderboard({ type, amount }) {
		console.log('update_leaderboard', type, amount);
	}

	purchase(obj, on_complete) {
		on_complete({'success': true, 'item_info': obj['item_info']});
	}

}

class YourNetApi extends SocialApi{
	constructor() {
		 super({});
	}

	purchase(obj, on_complete) {
		if (navigator.onLine) {
			let item_info = obj['item_info'];

			TestApi.purchaseAsync({
				itemID: item_info['item_id'],
			  }).then( (purchase)=> {
				console.log(purchase);
				on_complete({'success': true, 'item_info': obj['item_info']});
			}).catch((err)=>{
				console.log('Error: ' + err.message);
				on_complete({'success': false});
			});
		}
		else
			on_complete({'success': false});
	}
	
	show_invite() {
		TestApi.InviteCall();
	}

	create_wall_post(params, on_complete) {
		TestApi.WallPostTestCall();
	}
	
	make_share(_type) {
		TestApi.ShareCall();
	}

	show_interstitial_ad() {
		TestApi.InterstitialTestCall();
		console.log('show_interstitial_ad');
	}
	
	show_rewarded_ad(on_complete) {
		TestApi.RewardedTestCall()
		.then(() => {
			console.log('show_rewarded_ad');
			on_complete({ success: true });
		})
		.catch(e => {
			on_complete({ success: false });
		});
	}

	happy_moment(value) {
		console.log('happy_moment');
	}
}

class Y extends SocialApi {
	constructor() {
		super({});
   	}

	show_interstitial_ad() {
		YAPI.InterstitialTestCall();
		console.log('show_interstitial_ad');
	}
	
	show_rewarded_ad(on_complete) {
		YAPI.RewardedTestCall()
		.then(() => {
			console.log('show_rewarded_ad');
			on_complete({ success: true });
		})
		.catch(e => {
			on_complete({ success: false });
		});
	}

	purchase(obj, on_complete) {
		if (navigator.onLine) {
			let item_info = obj['item_info'];

			YAPI.purchaseAsync({
				itemID: item_info['item_id'],
			  }).then( (purchase)=> {
				console.log(purchase);
				on_complete({'success': true, 'item_info': obj['item_info']});
			}).catch((err)=>{
				console.log('Error: ' + err.message);
				on_complete({'success': false});
			});
		}
		else
			on_complete({'success': false});
	}
}

class DefaultApi extends SocialApi{
	constructor() {		
		 super({});		 
	}
	
	init(on_complete) {
		on_complete({'user_id': '0'});
	}
}


