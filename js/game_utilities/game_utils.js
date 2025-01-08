class GameUtils {
  constructor() {}

  init(scene) {
    this.scene = game_data["scene"];
    this.emitter = new Phaser.Events.EventEmitter();
    this.create_overlay();
  }

  create_overlay() {
    let rect = new Phaser.Geom.Rectangle(
      0,
      0,
      loading_vars["W"],
      loading_vars["H"]
    );
    let graphics = this.scene.add.graphics({
      fillStyle: { color: 0x000000, alpha: 1 },
    });
    graphics.fillRectShape(rect);
    graphics.generateTexture(
      "dark_overlay",
      loading_vars["W"],
      loading_vars["H"]
    );
    graphics.destroy();
  }

  init_loading() {
    this.loading_overlay = new LoadingOverlay(this.scene);
    this.scene.add.existing(this.loading_overlay);
    this.loading_overlay.visible = false;
    this.loading_overlay.alpha = 0;
    this.create_missclick();
  }

  create_missclick() {
    let config = {
      key: "mistake_anim",
      frames: this.scene.anims.generateFrameNames("common1", {
        prefix: "mistake_anim",
        end: 28,
        zeroPad: 4,
      }),
      repeat: 0,
      showOnStart: true,
      hideOnComplete: true,
    };
    this.scene.anims.create(config);
    this.mistake_anim = this.scene.add.sprite(-20, -20, "mistake_anim");
    this.mistake_anim.setOrigin(0.5, 0.8);
    this.global_missclick_down = null;
    this.global_missclick_up = null;
    this.global_missclick_holder = new Phaser.GameObjects.Container(
      this.scene,
      0,
      0
    );
    this.scene.add.existing(this.global_missclick_holder);
  }

  add_loading(on_complete = null, alpha = 1) {
    this.loading_overlay.visible = true;
    this.loading_overlay.start(alpha);
    game_data["loading_last_time"] = this.get_time();
    game_data["scene"].tweens.add({
      targets: this.loading_overlay,
      alpha: 1,
      duration: 100,
      onComplete: function () {
        if (on_complete) on_complete();
      },
    });
  }
  remove_loading(on_complete = null, quick = false) {
    let def_time = 1000;
    let timeout = this.get_time() - game_data["loading_last_time"];
    if (timeout < def_time) timeout = def_time - timeout;
    else if (timeout > def_time) timeout = 10;
    if (quick) timeout = 10;
    setTimeout(() => {
      game_data["scene"].tweens.add({
        targets: this.loading_overlay,
        alpha: 0,
        duration: 100,
        onComplete: () => {
          this.loading_overlay.visible = false;
          this.loading_overlay.stop();
        },
      });
      if (on_complete) on_complete();
    }, timeout);
  }

  assign_to_global_missclick(obj) {
    obj.on("pointerdown", (pointer) => {
      let _id = parseInt(Math.random() * 1000000);
      this.global_missclick_down = _id;
      if (this.global_missclick_up == null) this.global_missclick_up = _id;
    });
    obj.on("pointerup", (_pointer) => {
      if (
        _pointer &&
        this.mistake_anim &&
        this.global_missclick_up == this.global_missclick_down
      ) {
        this.make_global_missclick(_pointer);
      }
      this.global_missclick_up = null;
    });
  }
  make_global_missclick(pointer = null) {
    if (pointer == null) pointer = this.scene.input.activePointer;
    let pt = new Phaser.Geom.Point(pointer["worldX"], pointer["worldY"]);
    this.mistake_anim.x = pt.x;
    this.mistake_anim.y = pt.y;
    this.global_missclick_holder.add(this.mistake_anim);
    this.mistake_anim.play("mistake_anim");
    game_data["audio_manager"].sound_event({
      event: "sound_event",
      play: true,
      sound_name: "wrong_click",
    });
  }

  load_xmls_preloaded(on_complete) {
    setTimeout(() => {
      this.read_language();
      on_complete();
    }, 20);
  }

  is_map() {
    return game_data["current_scene"] === "MAP";
  }

  is_gameplay() {
    return game_data["current_scene"] === "GAMEPLAY";
  }

  read_language() {
    let i;
    let j;
    let game_text = {};
    let langs = game_data["langs"];
    let scene_id;
    let phrase_id;
    let item_id;
    let lang_id;
    let _lang;
    let language_xml = phaser_game.cache.xml.get("language_xml");

    let phrases = language_xml.getElementsByTagName("DYNAMIC_PHRASE");
    for (i = 0; i < phrases.length; i++) {
      scene_id = phrases[i].getAttributeNode("scene_id").textContent;
      item_id = phrases[i].getAttributeNode("item_id").textContent;
      phrase_id = phrases[i].getAttributeNode("phrase_id").textContent;

      if (!(scene_id in game_text)) game_text[scene_id] = {};
      if (!(item_id in game_text[scene_id])) game_text[scene_id][item_id] = {};
      if (!(phrase_id in game_text[scene_id][item_id]))
        game_text[scene_id][item_id][phrase_id] = {};

      for (j = 0; j < langs.length; j++) {
        lang_id = langs[j].toUpperCase();
        if (phrases[i].getElementsByTagName(lang_id)[0]) _lang = lang_id;
        else _lang = "EN";
        game_text[scene_id][item_id][phrase_id][lang_id] = {
          text: phrases[i]
            .getElementsByTagName(_lang)[0]
            .getElementsByTagName("TEXT")[0].textContent,
          size: parseInt(
            phrases[i]
              .getElementsByTagName(_lang)[0]
              .getElementsByTagName("SIZE")[0].textContent
          ),
        };
      }
    }

    game_data["language"] = game_text;
  }

  zeros(num) {
    let arr = [];
    for (let i = 0; i < num; i++) arr.push(0);
    return arr;
  }

  int_array(arr) {
    let res = [];
    for (let i = 0; i < arr.length; i++)
      if (arr[i] == "-") res.push(-1);
      else res.push(parseInt(arr[i]));
    return res;
  }

  empty_line(len) {
    let res = [];
    for (let i = 0; i < len; i++) res.push("-");
    return res;
  }

  fill_line(arr, val) {
    let res = [];
    for (let i = 0; i < arr.length; i++) res.push(arr[i] == "-" ? "-" : val);
    return res;
  }

  toLocal(container, pt) {
    let containers = [];
    let parent_contaiter = container;
    let holder;
    let new_pt;
    if (pt) new_pt = new Phaser.Geom.Point(pt.x, pt.y);
    else new_pt = new Phaser.Geom.Point(0, 0);

    while (parent_contaiter && parent_contaiter != this.scene) {
      containers.push(parent_contaiter);
      parent_contaiter = parent_contaiter.parentContainer;
    }

    while (containers.length > 0) {
      holder = containers.pop();
      new_pt.x = (new_pt.x - holder.x) / holder.scaleX;
      new_pt.y = (new_pt.y - holder.y) / holder.scaleY;
    }

    return new_pt;
  }

  toGlobal(container, pt) {
    let new_pt;
    if (pt) new_pt = new Phaser.Geom.Point(pt.x, pt.y);
    else new_pt = new Phaser.Geom.Point(0, 0);

    let parent_contaiter = container;
    while (parent_contaiter && parent_contaiter != this.scene) {
      new_pt.x = new_pt.x * parent_contaiter.scaleX + parent_contaiter.x;
      new_pt.y = new_pt.y * parent_contaiter.scaleY + parent_contaiter.y;
      parent_contaiter = parent_contaiter.parentContainer;
    }
    return new_pt;
  }

  fly_items(params, on_complete) {
    game_data["allow_fly"] = true;
    let i;
    let amount = params["amount"];
    let delay = 50;
    let func;

    for (i = 0; i < amount; i++) {
      func = i == amount - 1 ? on_complete : function () {};
      this.show_moving_item(params, delay * i, func);
    }
  }

  show_moving_item(params, delay, on_complete) {
    let item_atlas = params["item_atlas"];
    let item_name = params["item_name"];
    let holder = params["holder"];
    let pt_start = this.toLocal(holder, params["pt_start"]);
    let pt_end = this.toLocal(holder, params["pt_end"]);

    let item = new Phaser.GameObjects.Image(
      this.scene,
      0,
      0,
      item_atlas,
      item_name
    );
    item.x = pt_start.x;
    item.y = pt_start.y;
    if (holder && holder.scene) {
      holder.add(item);
      let temp_pt = this.toGlobal(holder, pt_start);
      let _x = loading_vars["W"] / 2;
      let _y = loading_vars["H"] / 2;
      if (temp_pt.y > _y) _y = loading_vars["H"] * 0.2;
      if (temp_pt.x > _x) _x = temp_pt.x;
      let pt_mid = new Phaser.Geom.Point(_x, _y);
      pt_mid = this.toLocal(holder, pt_mid);
      setTimeout(() => {
        game_data["utils"].bezier(
          pt_start,
          pt_mid,
          pt_end,
          item,
          500,
          "Sine.easeOut",
          this,
          () => {
            this.add_light_stars(params["pt_end"], holder, on_complete);
            item.destroy();
          }
        );
      }, delay);
    }
  }

  add_light_stars(_pt, holder, on_complete) {
    if (!("allow_fly" in game_data)) game_data["allow_fly"] = true;
    if (game_data["allow_fly"]) {
      let star_light;
      let diff_x;
      let diff_y;
      let radius = 30;
      let light_stars_number = 15;
      let pt = this.toLocal(holder, _pt);
      let func;

      for (let i = 0; i < light_stars_number; i++) {
        star_light = new Phaser.GameObjects.Image(
          this.scene,
          0,
          0,
          "common1",
          "light_star"
        );
        star_light.x = pt.x - (Math.random() - 0.5) * 20;
        star_light.y = pt.y - (Math.random() - 0.5) * 20;
        diff_x = 2 * radius * Math.random() - radius;
        diff_y =
          Math.sqrt(radius * radius - diff_x * diff_x) *
          (2 * Math.floor(2 * Math.random()) - 1);
        func = i == light_stars_number - 1 ? on_complete : null;
        this.move_light_star(
          star_light,
          new Phaser.Geom.Point(star_light.x + diff_x, star_light.y + diff_y),
          holder,
          func
        );
      }
    }
  }

  move_light_star(star_light, pt, holder, on_complete = null) {
    if (holder && holder.scene) holder.add(star_light);
    game_data["scene"].tweens.add({
      targets: star_light,
      x: pt.x,
      y: pt.y,
      duration: 100 + 150 * Math.random(),
      onComplete: function () {
        game_data["scene"].tweens.add({
          targets: star_light,
          alpha: 0,
          duration: 100,
          onComplete: function () {
            star_light.destroy();
            if (on_complete) {
              on_complete();
            }
          },
        });
      },
    });
  }
  bezier(
    start_pt,
    mid_pt,
    end_pt,
    item,
    _duration,
    _ease,
    scope,
    on_complete = null,
    extra_mid_pt = null,
    delay = 0,
    emitter = null,
    emitter_pos_mod = { x: 0, y: 0 }
  ) {
    let curve;
    let allow_stop_emitter = false;
    let stop_emitter_level = 0.9;
    if (emitter) {
      emitter.stop();
      allow_stop_emitter = true;
    }
    if (extra_mid_pt != null)
      curve = new Phaser.Curves.CubicBezier(
        start_pt,
        extra_mid_pt,
        mid_pt,
        end_pt
      );
    else curve = new Phaser.Curves.QuadraticBezier(start_pt, mid_pt, end_pt);
    item.bezier_val = 0;

    game_data["scene"].tweens.add({
      targets: item,
      bezier_val: 1,
      duration: _duration,
      delay: delay,
      ease: _ease,
      callbackScope: scope,
      onUpdate: function (tween, target) {
        let position = curve.getPoint(item.bezier_val);
        item.x = position.x;
        item.y = position.y;
        if (allow_stop_emitter && item.bezier_val > stop_emitter_level) {
          emitter.stop();
          allow_stop_emitter = false;
        } else if (emitter) {
          emitter.setPosition(
            item.x + emitter_pos_mod.x,
            item.y + emitter_pos_mod.y
          );
        }
      },
      onComplete: function () {
        item.x = end_pt.x;
        item.y = end_pt.y;

        if (allow_stop_emitter) emitter.stop();

        if (on_complete) on_complete();
      },
    });
    if (emitter) emitter.start();
  }

  init_tips() {
    this.tip_overlay = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.tip_overlay.visible = false;
    this.scene.add.existing(this.tip_overlay);
    this.tip_dark = new Phaser.GameObjects.Image(
      this.scene,
      0,
      0,
      "dark_overlay"
    );
    this.tip_dark.setOrigin(0, 0);
    this.tip_dark.alpha = 0.4;
    this.tip_overlay.add(this.tip_dark);

    this.tip_bg = new Phaser.GameObjects.Image(
      this.scene,
      0,
      0,
      "common1",
      "tip_bg"
    );
    this.tip_bg_origin = 0.04;
    this.tip_bg.setOrigin(this.tip_bg_origin, 0);
    this.tip_overlay.add(this.tip_bg);
    this.tip_dark.setInteractive();
    this.tip_dark.on("pointerup", this.hide_tip, this);
  }

  place_tip(type, bg, holder, _pt) {
    let origin = this.tip_bg_origin;
    let w = bg.displayWidth;
    let h = bg.displayHeight;
    let pt = this.toLocal(holder, _pt);
    let shift_mod_y = 8;
    let shift_mod_x = 4;
    if (type == "money_tip") {
      origin = this.money_tip_bg_origin;
      shift_mod_y = 5;
      shift_mod_x = 2;
    }
    let tx = pt.x;
    let ty = pt.y;
    let pos1 = pt.y < loading_vars["H"] - h ? "top" : "down";
    let pos2 = pt.x < loading_vars["W"] - w ? "left" : "right";
    let position = pos1 + "_" + pos2;
    let scaleX = Math.abs(bg.scaleX);
    let scaleY = Math.abs(bg.scaleY);
    if (position == "top_left") {
      tx += w * (0.5 - origin) + shift_mod_x;
      ty += h * 0.5 + shift_mod_y;
    }
    if (position == "top_right") {
      scaleX *= -1;
      tx -= w * (0.5 - origin) - shift_mod_x;
      ty += h * 0.5 + shift_mod_y;
    }
    if (position == "down_left") {
      scaleY *= -1;
      tx += w * (0.5 - origin) + shift_mod_x;
      ty -= h * 0.5 + shift_mod_y;
    }
    if (position == "down_right") {
      scaleX *= -1;
      scaleY *= -1;
      tx -= w * (0.5 - origin) - shift_mod_x;
      ty -= h * 0.5 + shift_mod_y;
    }
    bg.setScale(scaleX, scaleY);
    bg.x = pt.x;
    bg.y = pt.y;

    return { tx: tx, ty: ty };
  }

  show_tip(params, on_hide = null) {
    if (
      params["forced"] ||
      (!this.tip_showing && !game_data["game_windows"].game_window)
    ) {
      let holder = this.tip_overlay;
      holder.on_hide = on_hide;
      this.tip_showing = true;
      this.tip_hidable = false;
      let res;
      if (this.tip_text) this.tip_text.destroy();
      if (this.tip_img) this.tip_img.destroy();
      let txt_pos = this.place_tip("common", this.tip_bg, holder, params["pt"]);
      let tx = txt_pos.tx;
      let ty = txt_pos.ty;
      let style = {
        ...game_data["styles"]["light_text2"],
        fontFamily: "font1",
        fontSize: 24,
        align: "center",
        wordWrap: { width: 270 },
      };

      res = this.generate_string({
        scene_id: params["scene_id"],
        item_id: params["item_id"],
        phrase_id: params["phrase_id"],
        values: params["values"],
        base_size: 24,
      });
      style.fontSize = res["size"];
      this.tip_text = new Phaser.GameObjects.Text(
        this.scene,
        tx,
        ty,
        res["text"],
        style
      );
      this.tip_text.setLineSpacing(-5);
      this.tip_text.setOrigin(0.5);

      this.paused_tip = null;
      this.tip_overlay.add(this.tip_text);
      holder.alpha = 0;
      holder.visible = true;
      game_data["scene"].tweens.add({
        targets: holder,
        alpha: 1,
        duration: 150,
      });
      setTimeout(() => {
        this.tip_hidable = true;
      }, 150);
      if (this.tid_tip_auto_hide) clearTimeout(this.tid_tip_auto_hide);
      if (params["hide_timeout"])
        this.tid_tip_auto_hide = setTimeout(() => {
          this.hide_tip();
        }, params["hide_timeout"]);
    } else this.paused_tip = { params: params, on_hide: on_hide };
  }
  resume_tip() {
    if (this.paused_tip) {
      this.show_tip(this.paused_tip["params"], this.paused_tip["on_hide"]);
    }
  }
  hide_tip() {
    if (this.tip_hidable) {
      this.tip_hidable = false;
      let holder = this.tip_overlay;
      this.scene.tweens.add({
        targets: holder,
        alpha: 0,
        duration: 150,
        onComplete: () => {
          holder.visible = false;
          if (this.tip_text) this.tip_text.destroy();
          this.tip_text = null;
          if (holder.on_hide) holder.on_hide();
          holder.on_hide = null;
          this.tip_showing = false;
          this.resume_tip();
        },
      });
      if (this.tid_tip_auto_hide) clearTimeout(this.tid_tip_auto_hide);
    }
  }

  generate_string(params) {
    let i;
    let lang_id = game_data["user_data"]["lang"].toUpperCase();
    if (game_data["langs"].indexOf(game_data["user_data"]["lang"]) < 0)
      lang_id = "EN";
    let scene_id = params["scene_id"];
    let item_id = params["item_id"];
    let phrase_id = String(params["phrase_id"]);
    let base_size = params["base_size"];
    let res = {};
    let text_obj = {};
    try {
      text_obj = game_data["language"][scene_id][item_id][phrase_id][lang_id];
    } catch (e) {
      text_obj = { text: "missed_text", size: 0 };
      let msg = "no_text";
      let error = {
        stack: scene_id + " " + item_id + " " + phrase_id + " " + lang_id,
      };
      console.log(msg, error, error.stack);
    }
    res["size"] = base_size + text_obj["size"];

    let txt = text_obj["text"];
    if ("values" in params) {
      let values = params["values"];
      let output = txt;
      let pattern = /%val/;
      for (i = 0; i < values.length; i++) {
        output = output.replace(pattern, values[i]);
        if (output.indexOf("[") >= 0) {
          output = this.replace_correct_word(output, values[i], lang_id);
        }
      }
      txt = output;
    }
    let myPattern = /\\n/gi;
    txt = txt.replace(myPattern, "\n");
    res["text"] = txt;
    return res;
  }

  replace_correct_word(txt, val, lang_id) {
    let start_index;
    let ind;
    let ind1;
    let ind2;
    let str;
    let str_all;
    let correct_word;
    let arr;

    start_index = 0;
    ind = 0;
    ind1 = txt.indexOf("[", start_index);
    ind2 = txt.indexOf("]", start_index);
    if (ind1 >= 0 && ind2 >= 0 && ind2 > ind1) {
      str_all = txt.substr(ind1, ind2 - ind1 + 1);
      str = txt.substr(ind1 + 1, ind2 - ind1 - 1);
      arr = str.split(",");
    }

    correct_word = "";
    if (lang_id == "RU" && arr.length == 3) {
      if (val % 100 > 10 && val % 100 < 20) {
        correct_word = arr[2];
      } else {
        switch (val % 10) {
          case 0:
            correct_word = arr[2];
            break;
          case 1:
            correct_word = arr[0];
            break;
          case 2:
            correct_word = arr[1];
            break;
          case 3:
            correct_word = arr[1];
            break;
          case 4:
            correct_word = arr[1];
            break;
          case 5:
            correct_word = arr[2];
            break;
          case 6:
            correct_word = arr[2];
            break;
          case 7:
            correct_word = arr[2];
            break;
          case 8:
            correct_word = arr[2];
            break;
          case 9:
            correct_word = arr[2];
            break;
        }
      }
    } else if (arr.length == 2) {
      correct_word = val == 1 ? arr[0] : arr[1];
    }

    if (correct_word.length > 0) txt = txt.replace(str_all, correct_word);

    return txt;
  }

  get_time() {
    return new Date().getTime();
  }

  get_passed_amount() {
    if (game_data["user_data"] && game_data["user_data"]["levels_passed"])
      return game_data["user_data"]["levels_passed"].length;
    else return 0;
  }

  check_ads(event_type) {
    if (game_data["ads"] && game_data["ads"]["interstitial"]) {
      let mults = game_data["ads"]["interstitial"]["event_mult"];
      if (mults) {
        let prob = 100;
        if (event_type in mults) prob *= mults[event_type];
        let rand = Math.random() * 100;
        if (rand < prob) this.show_interstitial_ad();
      }
    }
  }

  check_matrix_empty(arr) {
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr[i].length; j++)
        if (arr[i][j] != "-" && arr[i][j] != "0") return false;

    return true;
  }

  getNumbers(n) {
    let numbers = [];

    for (let i = 1; i <= n; i++) {
      numbers.push(i);
    }

    return numbers;
  }

  get_random_from_2d(arr, w, h) {
    if (!Array.isArray(arr)) return null;
    let pos_y, pos_x;
    do {
      pos_y = parseInt(Math.random() * w);
      pos_x = parseInt(Math.random() * h);
    } while (!(arr[pos_y] && arr[pos_y][pos_x] && arr[pos_y][pos_x] !== "-"));

    return [pos_y, pos_x];
  }

  show_loader(pt, holder) {
    let total = 9;
    let radius = 30;
    let r = 8;
    let rot_angle = 360 / total;
    let circles = [];
    let graphics;
    let period = 1000;

    if (!("loader_anims" in game_data))
      game_data["loader_anims"] = {
        total: 0,
        period: period,
        circles: {},
        hidden: {},
      };

    let id = game_data["loader_anims"]["total"];
    game_data["loader_anims"]["circles"][id] = [];

    for (let i = 0; i < total; i++) {
      graphics = new Phaser.GameObjects.Graphics(this.scene);
      graphics.fillStyle(0x999999, 1);
      graphics.fillCircle(
        pt.x + Math.cos(((rot_angle * i) / 180) * Math.PI) * radius,
        pt.y + Math.sin(((rot_angle * i) / 180) * Math.PI) * radius,
        r
      );
      holder.add(graphics);
      circles.push(graphics);
      game_data["loader_anims"]["circles"][id].push(graphics);
      this.show_circle_fade(id, i, (period / total) * i);
    }

    game_data["loader_anims"]["total"]++;
    return id;
  }

  show_circle_fade(id, i, timeout) {
    let circle = game_data["loader_anims"]["circles"][id][i];
    let period = game_data["loader_anims"]["period"];

    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: period,
      delay: timeout,
      onComplete: () => {
        if (id in game_data["loader_anims"]["hidden"]) {
          circle.destroy();
        } else {
          circle.alpha = 1;
          this.show_circle_fade(id, i, 0);
        }
      },
    });
  }

  hide_loader(id) {
    for (let i = 0; i < game_data["loader_anims"]["circles"][id].length; i++)
      game_data["loader_anims"]["circles"][id][i].visible = false;

    game_data["loader_anims"]["hidden"][id] = true;
  }

  show_interstitial_ad() {
    if (navigator.onLine && game_data["user_data"]["payments"]["total"] === 0) {
      game_data["socialApi"].show_interstitial_ad();
    }
  }

  show_rewarded_ad(on_complete) {
    if (navigator.onLine && allow_rewarded_ads) {
      game_data["socialApi"].show_rewarded_ad(on_complete);
    } else on_complete({ success: false });
  }

  purchase(obj, on_complete) {
    game_data["wait_for_purchase"] = true;
    game_data["socialApi"].purchase(obj, (result) => {
      game_data["wait_for_purchase"] = false;
      on_complete(result);
    });
  }

  update_language() {
    game_request.update_language();
  }

  get_loader(use_suffix = true) {
    let loader = new Phaser.Loader.LoaderPlugin(game_data["scene"]);
    return loader;
  }

  show_components(cont) {
    if (cont && cont.type === "Container") {
      console.log(cont.list);
      cont.each((el) => this.show_components(el));
    }
  }

  delayed_call(delay, on_complete = () => {}) {
    let timer = game_data["scene"].time.delayedCall(delay, () => {
      on_complete();
      setTimeout(() => {
        timer.remove();
        timer.destroy(true);
      }, 10);
    });
    return timer;
  }

  deep_copy(inObject) {
    let outObject;
    let value;
    let key;

    if (typeof inObject !== "object" || inObject === null) {
      //  inObject is not an object
      return inObject;
    }

    //  Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {};

    for (key in inObject) {
      value = inObject[key];

      //  Recursively (deep) copy for nested objects, including arrays
      outObject[key] = this.deep_copy(value);
    }

    return outObject;
  }

  lock_game() {
    game_data.game_overlay.visible = true;
  }

  unlock_game() {
    game_data.game_overlay.visible = false;
  }

  average(values) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
    }
    return Math.floor(sum / values.length);
  }

  linspace(startValue, stopValue, cardinality) {
    let arr = [];
    let step = (stopValue - startValue) / (cardinality - 1);
    for (let i = 0; i < cardinality; i++) {
      arr.push(startValue + step * i);
    }
    return arr;
  }

  createRangeWithStep(start, end, step) {
    if (
      typeof start !== "number" ||
      typeof end !== "number" ||
      typeof step !== "number"
    ) {
      throw new Error("Start, end, and step values must be numbers.");
    }

    if (start > end && step > 0) {
      throw new Error(
        "Invalid range: start is greater than end, but step is positive."
      );
    }

    if (start < end && step < 0) {
      throw new Error(
        "Invalid range: start is less than end, but step is negative."
      );
    }

    const range = [];
    for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
      if (start !== i && end !== i) range.push(i);
    }

    return range;
  }

  vector(p1, p2) {
    return {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
    };
  }

  dot(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  happy_moment() {
    game_data["socialApi"].happy_moment();
  }

  game_play_start() {
    game_data["socialApi"].game_play_start();
  }

  game_play_stop() {
    game_data["socialApi"].game_play_stop();
  }

  update_level(value) {
    game_data["socialApi"].update_level(value);
  }

  update_score(value) {
    game_data["socialApi"].update_score(value);
    game_data["game_map"].new_score();
  }

  show_leaderboard(obj) {
    game_data["socialApi"].show_leaderboard(obj);
  }

  update_leaderboard(obj) {
    game_data["socialApi"].update_leaderboard(obj);
  }

  get_user_stars() {
    let levels_passed = game_data["user_data"]["levels_passed"];

    let stars = levels_passed.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );

    return stars;
  }

  page_requered_stars(page = 0) {
    let items_per_page = 20;
    let level_id = (page + 1) * items_per_page;
    let stars = this.get_user_stars();
    let requered_stars = 0;
    for (let id in game_data["required_stars"]) {
      id = Number(id);
      if (level_id <= id) break;
      requered_stars = game_data["required_stars"][id];
    }
    let remain = requered_stars - stars;
    return remain > 0 ? remain : 0;
  }

  is_level_available(level_id = 0) {
    return level_id - 1 <= this.get_passed_amount();
  }

  get_level(level_id, on_complete = () => {}) {
    let pictures = levels[level_id - 1]["pictures"];
    let success = true;
    let url = game_data["urls"]["levels"];
    let cache = this.scene.textures;

    if (pictures.every((pict) => cache.exists(`level${level_id}_${pict}`))) {
      on_complete({ success: success });
    } else {
      if (navigator.onLine) {
        let loader = new Phaser.Loader.LoaderPlugin(this.scene);
        this.add_loading();
        pictures.forEach((pict) => {
          loader.image(
            `level${level_id}_${pict}`,
            url + `level${level_id}/` + pict + ".webp"
          );
        });
        loader.once(
          "complete",
          () => {
            this.remove_loading();

            on_complete({ success: true });
            loader.off("loaderror");
            loader.destroy();
          },
          this
        );
        loader.once("loaderror", () => {
          throw `Broken level!!!\n${url}\n${level_id}`;
        });
        loader.start();
      } else {
        on_complete({ success: false, no_internet: true });
      }
    }
  }

  remove_level_from_cache(id) {
    let cache = this.scene.textures;
    let pictures = levels[id - 1]["pictures"];
    pictures.forEach((pict) => {
      if (cache.exists(`level${id}_${pict}`)) {
        cache.remove(`level${id}_${pict}`);
        console.log("remove level", `level${id}_${pict}`);
      }
    });
  }

  generate_levels() {
    let point1 = [
      { x: 114, y: 176, radius: 60 },
      { x: 170, y: 552, radius: 75 },
      { x: 402, y: 123, radius: 60 },
      { x: 518, y: 355, radius: 100 },
      { x: 774, y: 127, radius: 50 },
      { x: 757, y: 573, radius: 60 },
      { x: 1076, y: 439, radius: 45 },
      { x: 1069, y: 159, radius: 80 },
      { x: 823, y: 320, radius: 60 },
    ];
    let point2 = [
      { x: 250, y: 186, radius: 110 },
      { x: 971, y: 492, radius: 100 },
      { x: 893, y: 138, radius: 95 },
      { x: 250, y: 510, radius: 100 },
      { x: 486, y: 98, radius: 60 },
      { x: 606, y: 232, radius: 55 },
      { x: 719, y: 374, radius: 60 },
      { x: 590, y: 497, radius: 40 },
      { x: 486, y: 575, radius: 45 },
    ];
    let point3 = [
      { x: 952, y: 189, radius: 105 },
      { x: 183, y: 510, radius: 100 },
      { x: 1163, y: 79, radius: 35 },
      { x: 204, y: 178, radius: 30 },
      { x: 405, y: 125, radius: 30 },
      { x: 646, y: 149, radius: 30 },
      { x: 443, y: 331, radius: 30 },
      { x: 716, y: 331, radius: 30 },
      { x: 510, y: 521, radius: 30 },
      { x: 737, y: 591, radius: 30 },
      { x: 882, y: 422, radius: 30 },
      { x: 981, y: 607, radius: 30 },
      { x: 1185, y: 626, radius: 30 },
      { x: 1062, y: 414, radius: 30 },
    ];
    let point4 = [
      // {x: 143, y: 92, radius: 30},
      { x: 215, y: 146, radius: 30 },
      // {x: 378, y: 251, radius: 30},
      // {x: 461, y: 301, radius: 30},
      // {x: 563, y: 382, radius: 30},
      // {x: 711, y: 457, radius: 30},
      { x: 1011, y: 585, radius: 30 },
      // {x: 1137, y: 548, radius: 30},
      { x: 1145, y: 427, radius: 30 },
      // {x: 1139, y: 309, radius: 30},
      { x: 1105, y: 208, radius: 30 },
      // {x: 1040, y: 119, radius: 30},
      { x: 946, y: 87, radius: 45 },
      // {x: 791, y: 159, radius: 30},
      { x: 646, y: 253, radius: 30 },
      { x: 410, y: 393, radius: 55 },
      // {x: 290, y: 438, radius: 30},
      { x: 153, y: 580, radius: 30 },
      // {x: 335, y: 618, radius: 30},
      { x: 518, y: 615, radius: 30 },
      // {x: 673, y: 615, radius: 30},
      { x: 826, y: 618, radius: 30 },
      { x: 887, y: 343, radius: 110 },
      { x: 147, y: 311, radius: 80 },
      { x: 501, y: 129, radius: 80 },
    ];
    let point5 = [
      { x: 184, y: 546, radius: 30 },
      // {x: 185, y: 178, radius: 30},
      // {x: 399, y: 432, radius: 30},
      // {x: 664, y: 556, radius: 30},
      { x: 960, y: 541, radius: 55 },
      { x: 1138, y: 581, radius: 30 },
      // {x: 1127, y: 322, radius: 30},
      // {x: 871, y: 285, radius: 30},
      { x: 783, y: 373, radius: 60 },
      { x: 1113, y: 152, radius: 45 },
      { x: 698, y: 132, radius: 30 },
      { x: 633, y: 263, radius: 30 },
      // {x: 399, y: 179, radius: 30},
      { x: 286, y: 58, radius: 30 },
      // {x: 494, y: 76, radius: 30},
      // {x: 835, y: 70, radius: 30},
      { x: 267, y: 266, radius: 30 },
      // {x: 90, y: 210, radius: 30},
      // {x: 904, y: 371, radius: 30},
      { x: 449, y: 307, radius: 60 },
      { x: 140, y: 397, radius: 60 },
      { x: 943, y: 169, radius: 60 },
      { x: 580, y: 421, radius: 60 },
      { x: 353, y: 576, radius: 60 },
      // {x: 766, y: 488, radius: 30},
      { x: 811, y: 576, radius: 30 },
      // {x: 897, y: 626, radius: 30},
      // {x: 1030, y: 631, radius: 30},
      // {x: 999, y: 305, radius: 30},
      // {x: 1031, y: 425, radius: 30},
      { x: 1150, y: 456, radius: 45 },
    ];
    let points = [point1, point2, point3, point4, point5];

    let times = [20, 20, 25, 42, 44];
    let start = 4;
    let end = 40;
    let target_str = `

		`;

    for (let i = start; i <= end; i++) {
      let point1 = Phaser.Utils.Array.GetRandom(points);
      let ind1 = points.indexOf(point1);
      let time1 = times[ind1];
      let point2 = Phaser.Utils.Array.GetRandom(points);
      let ind2 = points.indexOf(point2);
      let time2 = times[ind2];
      let point3 = Phaser.Utils.Array.GetRandom(points);
      let ind3 = points.indexOf(point3);
      let time3 = times[ind3];
      let str = `
			{
				time: ${time1 + time2 + time3},
				pictures: [
					'1',
					'2',
					'3'
				],
				points: [
					${JSON.stringify(point1)},
					${JSON.stringify(point2)},
					${JSON.stringify(point3)}
				]
			},
			`;
      target_str += str;
    }

    console.log(target_str);
  }
}
