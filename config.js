let game_data = {
    'clear_storage': false, // if set true the progress resets
    'test_ad': true, // if set false test ad overlay will no appear
    'dev_mode': false, // if set true some features will be enabled
    'allow_shop': true, // if set false shop will be disabled
    'ads': {'interstitial': { // configuration of ads
        'event_mult': {
            'level_lost': 1, 'level_win': 0.3,
            'game_start': 0, 'level_start': 0
        }
    },
    'rewarded': {}
    },
    'langs': ['en', 'fr', 'de', 'es', 'it'], // languages presented in the game
    'new_lang': 'en', // if user open game for the first time english will be passed as language
    'styles': { // different styles used for the text
		'light_text': {fontSize: 30, color:'#fff', stroke: '#356e1e', strokeThickness: 5},
		'panel_text': {fontSize: 30, color:'#641a1b', stroke: '#fff', strokeThickness: 3},
		'purp_text': {fontSize: 30, color:'#fff', stroke: '#561e6e', strokeThickness: 5},
		'red_text': {fontSize: 30, color:'#fff', stroke: '#e4114d', strokeThickness: 5},
		'light_text2': {fontSize: 30, color:'#fff', stroke: '#441b0e', strokeThickness: 5},
		'title': { fontSize: 30, color:'#fff5de', stroke: '#40190e', strokeThickness: 5}
	},
    'urls': { // path urls object
		'audio': 'assets/audio/',
        'levels': 'assets/levels/'
	},
    'allowed_ads': 1, // how many attempts are there to continue the game by watching ads
    'shop': [ // shop config
        {'id': 'money_1', 'type': 'money', 'amount': 30, 'price': 0.99},
        {'id': 'money_2', 'type': 'money', 'amount': 130, 'price': 3.99},
        {'id': 'money_3', 'type': 'money', 'amount': 330, 'price': 9.99},
        {'id': 'money_4', 'type': 'money', 'amount': 660, 'price': 19.99}
    ],
    'required_stars': {
        '20': 15, // 15 stars to pass after 21 level
        '40': 30, // 30 stars to pass after 41 level
        '60': 45, // 45 stars to pass after 61 level
        '80': 60, // 60 stars to pass after 81 level
        '100': 75, // 75 stars to pass after 101 level
    },
    'continue_level': 10, // how much user should pay if he or she wants to continue a level
    'default_time': 100, // if time is not assigned in the level config this value is used
    'level_complete_prize': 3, // level complete prize set only for the first completion
    'boosters': {
        'hint': 3 // hint price
    },
    // user data object. If saved data exists then here it will be stored.
    // Otherwise, local_user_data will be stored here
    'user_data': {}
}

let local_user_data = {
    'sound': 1, // if 0 sound will be disabled
    'music': 1, // if 0 music will be disabled
    'levels_passed': [], // array to save progress
    'money': 20, // user money, 50 by default
    'lang': 'en', // select language
    'payments': {'total': 0}, // payments info
}