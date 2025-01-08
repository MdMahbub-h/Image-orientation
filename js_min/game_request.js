class GameRequest{constructor(){this.game_data_exists=!1,this.emitter=new Phaser.Events.EventEmitter}init(){this.game_data_exists=!0}get_time(){return(new Date).getTime()}request(a,e){"use_server"in loading_vars&&loading_vars.use_server||this.local_request(a,(a=>{this.update_user_data(a,e)}))}update_user_data(a,e){let _;for(_ in a)_ in game_data.user_data&&(game_data.user_data[_]=a[_]);this.save_user_data(),e(a)}save_user_data(){is_localhost?localStorage.setItem(loading_vars.game_id+"_user_data",JSON.stringify(game_data.user_data)):"y"===loading_vars.net_id&&YAPI.setItem(loading_vars.game_id+"_user_data",JSON.stringify(game_data.user_data))}local_request(a,e){"get_game_info"in a&&this.get_game_info_local(a,e),"level_failed"in a&&this.level_failed_local(a,e),"buy_level_continue"in a&&this.buy_level_continue_local(a,e),"set_options"in a&&this.set_options_local(a,e),"select_language"in a&&this.select_language_local(a,e),"update_purchase"in a&&this.update_purchase_local(a,e),"level_complete"in a&&this.level_complete_local(a,e),"buy_booster"in a&&this.buy_booster_local(a,e)}buy_booster_local(a,e){let _=a.booster_id,t=game_data.user_data.money,s=game_data.boosters[_];t>=s?(t-=s,e({success:!0,money:t,price:s})):e({success:!1})}level_complete_local(a,e){let _=a.star_collected,t=a.level_id,s=game_data.user_data.levels_passed,d=game_data.user_data.money,r=game_data.level_complete_prize,l={};t-1 in s&&1===s[t-1]||(_?(s[t-1]=1,l.happy_moment=!0,d+=r,l.first_complete=!0):s[t-1]=0),l.success=!0,l.levels_passed=s,l.money=d,e(l)}update_purchase_local(a,e){let _=a.item_info,t=_.amount;"money"==_.type?game_data.user_data.money+=t:_.id,this.update_payments_obj(a.item_info),e({success:!0,payments:game_data.user_data.payments,money:game_data.user_data.money})}update_payments_obj(a){game_data.user_data.payments.total+=1}select_language_local(a,e){game_data.user_data.lang=a.lang,e({success:!0,lang:a.lang})}set_options_local(a,e){game_data.user_data.sound=a.sound,game_data.user_data.music=a.music,e({success:!0})}buy_level_continue_local(a,e){let _=!1,t=game_data.user_data.money,s=game_data.continue_level;t>=s&&(_=!0,t-=s),e({success:_,money:t})}update_current_resourse_local(a,e){let _=!1,t=game_data.user_data.current_resourse;"current_resourse"in a&&(t=a.current_resourse,_=!0),e({success:_,current_resourse:t})}buy_item_local(a,e){let _=a.type,t=a.id,s=game_data.user_data.money,d=game_data.user_data.money_resourses,r=game_data.user_data.ad_resourses,l=game_data.user_data.current_resourse,u=game_data.user_data.ad_watched,i=!1;if("money"===_){let a=game_data.shop.money.find((a=>a.id===t));a&&s>=a.price&&(i=!0,s-=a.price,d.push(t),l=t)}else if("ad"===_){let a=game_data.shop.ad.find((a=>a.id===t));a&&(!(a.id in u)||a.price>=u[a.id])&&(i=!0,a.id in u||(u[a.id]=0),u[a.id]++,a.price===u[a.id]&&(l=t,r.push(t)))}e({success:i,money:s,id:t,money_resourses:d,current_resourse:l,ad_watched:u,ad_resourses:r})}level_failed_local(a,e){e({success:!0,new_score:!1,new_stage:!1})}get_game_info_local(a,e){if(is_localhost){let a=localStorage.getItem(loading_vars.game_id+"_user_data");if(!a||"clear_storage"in game_data&&game_data.clear_storage)game_data.new_user=!0,game_data.user_data=local_user_data;else if(a=JSON.parse(a),a){game_data.new_user=!1,game_data.user_data=a;for(let e in local_user_data)e in a||(game_data.user_data[e]=local_user_data[e])}else game_data.new_user=!0,game_data.user_data=local_user_data}else if("y"===loading_vars.net_id){let a=YAPI.getItem(loading_vars.game_id+"_user_data");if(!a||"clear_storage"in game_data&&game_data.clear_storage)game_data.new_user=!0,game_data.user_data=local_user_data;else if(a=JSON.parse(a),a){game_data.new_user=!1,game_data.user_data=a;for(let e in local_user_data)e in a||(game_data.user_data[e]=local_user_data[e])}else game_data.new_user=!0,game_data.user_data=local_user_data}else game_data.new_user=!0,game_data.user_data=local_user_data;let _,t=this.get_day_id(),s="new_user"in game_data&&game_data.new_user;"user_id"in game_data.user_data||(_=this.generate_user_id(),game_data.user_data.user_id=_),_=game_data.user_data.user_id,"start_day_id"in game_data.user_data||(game_data.user_data.start_day_id=t),s&&game_data.new_lang&&(game_data.user_data.lang=game_data.new_lang),"session_id"in game_data.user_data||(game_data.user_data.session_id=0),game_data.user_data.session_id++,e({success:!0,session_id:loading_vars.game_id+"_"+loading_vars.net_id+"_"+_+"_"+game_data.user_data.session_id,user_id:_,day_id:t,new_user:s,platform_data:game_data,user_data:game_data.user_data})}update_language(){}get_day_id(){return parseInt((new Date).getTime()/864e5)-17336}generate_user_id(){let a=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){let _=(a+16*Math.random())%16|0;return a=Math.floor(a/16),("x"==e?_:3&_|8).toString(16)}))}}