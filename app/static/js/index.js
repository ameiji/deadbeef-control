
$(document).ready(function(){

update_interval = 2000;
var now_urn;

run();

function ctl_action(urn){

	url = urn;

	$.get(url, function(data, status){
		if (status != 'success'){
			console.log("cmd ["+url+"] " + status);
		}
	});
}



function get_state(){

	url = now_urn;

	$.get(url, function(data, status){
		if (status != 'success'){
			console.log("cmd ["+url+"] "+status);
		}
		update_status(data);
	});
}


function set_title(data){

	title = '"'+data.title+'"';
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

function update_status(data){

	state = data.state
	
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

// Fetch API Requests and Assign handlers

	var items = new Object;

	$.getJSON("/requests", {})

		.done(function(data) {
			dlen = data.requests.length;
			for (i = 0 ; i< dlen; i++){
				action = data.requests[i].action;
				urn =  data.requests[i].urn;
				//console.log("item[" + action + "][" +  urn + "]");
				items[action] = urn;
			}

			now_urn = items["get_dbf_now"];

			$("#ctl-play").click(function(){
				urn = items["get_dbf_play_toggle"];
				ctl_action(urn);
				get_state();
			});

			$("#ctl-next").click(function(){
				urn = items["get_dbf_next"];
				ctl_action(urn);
				get_state();

			});

			$("#ctl-prev").click(function(){
				urn = items["get_dbf_prev"];
				ctl_action(urn);
				get_state();
			});

			$("#ctl-random").click(function(){
				urn = items["get_dbf_random"];
				ctl_action(urn);
				get_state();
			});

			$("#ctl-refresh").click(function(){
				get_state();
				return;
			});

			window.setInterval(get_state, update_interval);


		})
		.fail(function(jqxhr, textStatus, error){
			var err = textStatus + " " + error;
			console.log("Request Failed: " + err);
	});

}


function set_bg(id){

	url = "/static/img/" + id + ".png";
	$("body").css('background-image', 'url('+url+')');
}


// Background - restore saved state from local storage
var bgid = localStorage.getItem("bg");

if (typeof bgid != "undefined" && bgid != null){
	set_bg(bgid);
}


// Background Change Menu handler
	$(".ctl-bg").each(function(index){

		var id = $(this).attr('id');

		$(this).click(function(){
			set_bg(id);
			localStorage.setItem("bg", id);
		});
	});


});


