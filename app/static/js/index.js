
$(document).ready(function(){

	var update_interval = 1500;
    var api_requests;
    var pending_vol = false;
    var got_mixers = false;

	read_settings();
	run();


function read_settings(){
	restore_bg();
    restore_ctls();
    restore_font_sz();
    update_vol_labels();
}


function apply_settings(){
    store_vol_ctl();
    store_font_sz();
    update_vol_labels();
}


function restore_ctls(){
    restore_vol_ctl();
}


function store_vol_ctl(){
    var v = $("#ctl-show-vol").prop("checked");
    store_uopt("showvol", v);
}


function restore_vol_ctl(){

    var v = get_uopt("showvol");

    if (v === "false"){
        v = false;
    }else{
        v = true;
    }

    $("#ctl-show-vol").prop("checked", v);
    toggle_vol_ctl(v);
}


function store_font_sz(){

    var sz = $("#ctl-font-sz").val();
    store_uopt("fs", sz);
    update_font_sz(sz);
}

function restore_font_sz(){

    var fs = get_uopt("fs");

    if(! fs){
        fs = "14";
    }

    update_font_sz(fs);
    $("#ctl-font-sz").val(parseInt(fs));
}


function store_uopt(name, value){
	localStorage.setItem(name, value);
}

function get_uopt(name){
	var uopt = localStorage.getItem(name);
	return uopt;
}


function get_state(){ 

	// Update player status
	
	var now_url = api_requests.get_dbf_now;
    var device = $("#ctl-audio-src").val();
    var vol_url = api_requests.as_vol + "?device=" + device;

    if ($("#card-vol").is(":visible")){
        if (! pending_vol){
            get_request(vol_url, update_volume);
        }
    }

	get_request(now_url, update_status);
}




function get_request(urn, callback = false){

	var url = urn;

	$.get(url, function(data, status){
		if (status != 'success'){
			console.log("cmd ["+url+"] "+status);
		}else{

            if (callback){
                if (typeof callback === "function"){
                    callback(data);
                }
            }
        }
	});
}



function post_request(urn, in_data, callback = false){

    var url = urn;
    var send_data = JSON.stringify(in_data);

	$.ajax({
       url: url,
       type: 'POST',
       data: send_data,
       contentType: 'application/json; charset=utf-8',
       dataType: 'json',
       async: true,
       success: function(data, status){

            if (status != 'success'){
                console.log("cmd ["+url+"] "+status);
            }else{
                if (callback){
                    if (typeof callback === "function"){
                        callback(data);
                    }
                }
            }
        }
	});

}




function get_as_info(urn){

	// Get ALSA HW info
	var url = urn;
	get_request(url, update_as_info);
}


function get_as_mixers(){

    if (! got_mixers){

        //console.log("imma get ya mixers baby!");
        var url = api_requests.get_as_mixers;
        get_request(url, update_as_mixers);
    }

}


function ctl_action(urn){

	// Run user command 
	var url = urn;
	get_request(url);
}



function set_title(data){

	var title = '"'+data.title+'"';
	$("#title").html(title);
	$("#artist").html(data.artist);
	$("#album").html(data.album);
	$("#year").html(data.year);
}

function hide_title(){

	$("#title").html('');
	$("#artist").html('');
	$("#album").html('');
	$("#year").html('');
}

function show_controls(){
	$(".controls").each(function(){
		$(this).removeClass("disabled");
	});

}

function hide_controls(){
	$(".controls").each(function(){
		$(this).addClass("disabled");
	});
}


function toggle_vol_ctl(v){
        if (v){
            $("#card-vol").show();
        }else{
            $("#card-vol").hide();
        }
}

function update_as_mixers(data){

    if (data.state === "ok"){

        var mixers = data.mixers; 
        var ctl = $("#ctl-audio-src");

        ctl.html("");

        for (var i = 0; i < mixers.length; i++){
            v = mixers[i];
            ctl.append('<option value="'+ v +'">'+ v +'</option>');
        }

        ctl.material_select();
        got_mixers = true;
    }
}

function update_as_info(data){

    var cards = data.as_info.cards;    
    var dlen = cards.length;
    var text = "";

    for (var i = 0 ; i < dlen ; i++){
        var line = cards[i] + "<br />";
        text = text.concat(line);
    }

	$("#text-hw-info-cards").html(text);	
	$("#text-hw-info-version").html(data.as_info.version);	
}

function update_vol_labels(){
    var ctl_s = $("#ctl-audio-sys");
    var ctl_d = $("#ctl-audio-src");

    $("#label-system").html(ctl_s.val());
    $("#label-device").html(ctl_d.val());
}

function update_font_sz(size){

    if (typeof size !== "string"){
        console.log("error: bad value of font size");
        return;
    }

    var fs = size + "pt";
    
    $(".labels").each(function(){
        $(this).css("font-size", fs);
        
    });
}


function set_volume(value){

    var url = api_requests.as_vol;
    var device = $("#ctl-audio-src").val();
    var data = {"device": device, "vol": value};

    pending_vol = true;
    post_request(url, data, clear_pending);
    $("#ctl-vol").val(value);

}

function clear_pending(){
    pending_vol = false;
}

function update_volume(data){

    var vol = data.vol[0];
    var state = data.state;

    if (state == 'ok'){
        $("#ctl-vol").val(vol);
    }
}


function update_status(data){

	var state = data.state;
	
	if (state == 'stopped'){
		$("#status_play").addClass("hide");
		$("#status_stop").removeClass("hide");
		$("#status_nr").addClass("hide");
		hide_title();
		show_controls();


	}else if (state == 'nr'){
		$("#status_play").addClass("hide");
		$("#status_stop").addClass("hide");
		$("#status_nr").removeClass("hide");
		hide_title();
		hide_controls();
		
	}else{
		// Playing or Paused
		set_title(data);

		$("#status_play").removeClass("hide");
		$("#status_stop").addClass("hide");
		$("#status_nr").addClass("hide");
		show_controls();
	}
}



function run(){

// Fetch API Requests and Bind UI

    var requests = {};

	$.getJSON("/requests", {})

		.done(function(data) {
			var dlen = data.requests.length;
			for (i = 0 ; i< dlen; i++){
				var action = data.requests[i].action;
				var urn =  data.requests[i].urn;
				//console.log("item[" + action + "][" +  urn + "]");
				requests[action] = urn;
			}
		
            api_requests = requests;

			get_as_info(requests.get_as_info);			


			$("#ctl-play").click(function(){
				var urn = requests.get_dbf_play_toggle;
				ctl_action(urn);
				get_state();
			});

			$("#ctl-next").click(function(){
				var urn = requests.get_dbf_next;
				ctl_action(urn);
				get_state();

			});

			$("#ctl-prev").click(function(){
				var urn = requests.get_dbf_prev;
				ctl_action(urn);
				get_state();
			});

			$("#ctl-random").click(function(){
				var urn = requests.get_dbf_random;
				ctl_action(urn);
				get_state();
			});

			$("#ctl-refresh").click(function(){
				get_state();
				return;
			});


            $("#ctl-vol").change(function(){

                    var value = $(this).val();
                    set_volume(value);
            });

			window.setInterval(get_state, update_interval);


		})
		.fail(function(jqxhr, textStatus, error){
			var err = textStatus + " " + error;
			console.log("Request Failed: " + err);
	});

}


function set_bg(id){
	var url = "/static/img/" + id + ".png";
	$("body").css('background-image', 'url('+url+')');
}



function restore_bg(){
	// 	Background - restore saved state from local storage
var bgid = get_uopt("bg");

	if (typeof bgid != "undefined" && bgid !== null){
		set_bg(bgid);
	}

}




// 	Background Change Menu handler
	$(".ctl-bg").each(function(index){

		var id = $(this).attr('id');

		$(this).click(function(){
			set_bg(id);
			store_uopt("bg", id);
		});
	});



// 	Modals

    // Initialize settings modal
	$("#modal-settings").modal({
		ready: function(modal, trigger){
            get_as_mixers();
		},
		complete: function(){
            //console.log("modal closed, applying settings");
            apply_settings();

        }
	});

    // Initialize info modal
	$("#modal-info").modal();


    // Volume control hide/show handler
    $("#ctl-show-vol").change(function(){

        var v =  $(this).prop("checked");
        toggle_vol_ctl(v);
        
    });

    $("#ctl-font-sz").change(function(){
        var s = $(this).val();
        update_font_sz(s);
    });



//	Forms
	$("select").material_select();
	$("ul.tabs").tabs();



});


