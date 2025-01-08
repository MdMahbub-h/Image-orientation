let phaser_game,files_preloaded=!1,game=null,landscape="landscape"==loading_vars.orientation,is_localhost="127.0.0.1"==location.hostname||"localhost"==location.hostname||"localhost"==loading_vars.net_id,allow_rewarded_ads=!1,allow_intersitial_ads=!1,temp_user_data=null,paused=!1,allow_resume_timer=!0,allow_pause_timer=!0;window.onload=function(){initialize((function(){let a=get_game_config();game_request=new GameRequest,game_request.request({get_game_info:!0},(function(e){"user_data"in e&&(temp_user_data=e.user_data),"unpaused"in game_data||(game_data.unpaused=1),a.scene=mainGame,phaser_game=new Phaser.Game(a),window.focus()}))}));let a=document.getElementById("preload");a&&(a.style.display="none")};class mainGame extends Phaser.Scene{constructor(){super("MainGame")}preload(){this.load.image("preload_bar","assets/preload_bar.png"),this.load.image("preload_bg","assets/preload_bg.png"),this.load.image("preload_bg2","assets/preload_bg2.png"),this.load.once("complete",this.preload_files,this)}preload_files(a){let e=[];for(let a=0;a<e.length;a++)this.load.audio(e[a],"assets/audio/"+e[a]+".mp3");this.load.atlas("common1","assets/common1.png","assets/common1.json"),this.load.image("tut_1","./assets/tut_1.png"),this.load.image("tut_2","./assets/tut_2.png"),this.load.image("frame","./assets/frame.png"),this.load.image("rope","./assets/rope.png"),this.load.image("back","./assets/bgs/back.jpg"),this.load.script("levels","assets/levels/levels.js"),loading_vars.js_combined?this.load.script("all","bundle.js"):(this.load.script("main_game","js/game.js"),this.load.script("social_api","js/game_utilities/social_api.js"),this.load.script("game_utils","js/game_utilities/game_utils.js"),this.load.script("custom_button","js/game_utilities/custom_button.js"),this.load.script("audio_manager","js/game_utilities/audio_manager.js"),this.load.script("loading_overlay","js/game_utilities/loading_overlay.js"),this.load.script("graphics_manager","js/game_utilities/graphics_manager.js"),this.load.script("test_ad_manager","js/game_utilities/test_ad_manager.js"),this.load.script("game_play","js/game_play/game_play.js"),this.load.script("stage_panel","js/game_play/stage_panel.js"),this.load.script("hint_panel","js/game_play/hint_panel.js"),this.load.script("timer_panel","js/game_play/timer_panel.js"),this.load.script("game_map","js/game_map/game_map.js"),this.load.script("game_windows","js/game_windows/game_windows.js"),this.load.script("buy_money","js/game_windows/buy_money.js"),this.load.script("buy_money_item","js/game_windows/buy_money_item.js"),this.load.script("level_failed","js/game_windows/level_failed.js"),this.load.script("level_complete","js/game_windows/level_complete.js"),this.load.script("options","js/game_windows/options.js"),this.load.script("select_language","js/game_windows/select_language.js"),this.load.script("quit","js/game_windows/quit.js"),this.load.script("purchase_success","js/game_windows/purchase_success.js"),this.load.script("purchase_failed","js/game_windows/purchase_failed.js"),this.load.script("info","js/game_windows/info.js")),this.load.xml("language_xml","assets/xml/language.xml"),this.load.on("progress",(a=>{this.set_loading_progress(Math.floor(100*a)),100==Math.round(100*a)&&this.load.off("progress")})),this.load.once("complete",(()=>{files_preloaded=!0,this.create_game()})),this.load.start()}set_loading_progress(a){this.load_progress_cont?(this.load_progress_txt.text=String(a)+"%",this.load_progress_bar.scaleX=a/100):(this.load_progress_cont=new Phaser.GameObjects.Container(this,loading_vars.W/2,loading_vars.H/2),this.add.existing(this.load_progress_cont),this.load_progress_txt=new Phaser.GameObjects.Text(this,0,-25,String(a)+"%",{fontFamily:"font1",fontSize:40,color:"#f4ec60",stroke:"#07404e",strokeThickness:3}),this.load_progress_txt.setOrigin(.5),this.load_progress_cont.add(this.load_progress_txt),this.load_progress_bar=new Phaser.GameObjects.Image(this,0,19,"preload_bar"),this.load_progress_bg=new Phaser.GameObjects.Image(this,0,20,"preload_bg"),this.load_progress_bg2=new Phaser.GameObjects.Image(this,0,20,"preload_bg2"),this.load_progress_bar.setOrigin(0,.5),this.load_progress_bar.x=-this.load_progress_bg.width/2+5,this.load_progress_bar.scaleX=.01,this.load_progress_cont.add(this.load_progress_bg),this.load_progress_cont.add(this.load_progress_bar),this.load_progress_cont.add(this.load_progress_bg2))}create_game(){game_data.scene=this,temp_user_data&&(update_object(game_data.user_data,temp_user_data),temp_user_data=null),game=new Game(this),game.prepare_game()}update(a,e){game&&game.update(a,e)}}function update_object(a,e){for(let s in e)a[s]=e[s]}function initialize(a){"y"===loading_vars.net_id?YAPI.startGame().then((e=>{let{id:s}=e;loading_vars.user_id=s,allow_rewarded_ads=!0,allow_intersitial_ads=!0,a()})).catch((a=>{console.log(a)})):(loading_vars.user_id="0",allow_rewarded_ads=!0,allow_intersitial_ads=!0,a())}function get_game_config(){loading_vars.default_W=parseInt(loading_vars.W),loading_vars.default_H=parseInt(loading_vars.H),loading_vars.extra_W=0,loading_vars.extra_H=0;let a=loading_vars.W/loading_vars.H,e=parseInt(loading_vars.W),s=parseInt(loading_vars.H),t=window.innerWidth/window.innerHeight;loading_vars.mobile&&window.innerWidth<window.innerHeight&&(t=window.innerHeight/window.innerWidth),is_localhost&&(t=a),loading_vars.W<loading_vars.H*t&&(loading_vars.W=parseInt(loading_vars.H*t),loading_vars.extra_W=loading_vars.W-e,loading_vars.extra_H=loading_vars.H-s);let i=loading_vars.mobile,o={type:Phaser.WEBGL,parent:"phaser_game",width:loading_vars.W,height:loading_vars.H,backgroundColor:0,clearBeforeRender:!loading_vars.mobile,render:{powerPreference:"high-performance"}};return i?o.scale={mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY}:(o.scale={autoCenter:Phaser.Scale.CENTER_HORIZONTALLY},o.scale.mode=Phaser.Scale.FIT,o.fullscreenTarget="phaser_game"),o}function pause(){game_data.unpaused=0,game_data.audio_manager&&game_data.audio_manager.update_volume(),game_data.game_root&&game_data.game_root.block_interface(),paused=!0,game_data.scene&&(game_data.scene.game.input.enabled=!1),game_data&&game_data.game_play&&game_data.game_play.pause_timer(),game_data.game_windows.game_window&&game_data.game_windows.game_window.pause_timer&&"function"==typeof game_data.game_windows.game_window.pause_timer&&game_data.game_windows.game_window.pause_timer(),console.log("pause")}function resume(){game_data.unpaused=1,game_data.audio_manager&&game_data.audio_manager.update_volume(),game_data.game_root&&game_data.game_root.unblock_interface(),paused=!1,game_data.scene&&(game_data.scene.game.input.enabled=!0),!game_data||!game_data.game_play||game_data.game_play.is_paused()||game_data.game_windows&&game_data.game_windows.game_window||game_data.game_play.resume_timer(),game_data.game_windows.game_window&&game_data.game_windows.game_window.resume_timer&&"function"==typeof game_data.game_windows.game_window.resume_timer&&game_data.game_windows.game_window.resume_timer(),console.log("resume")}