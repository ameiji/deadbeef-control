# Views

from app import app,jsonify,make_response,handlers,render_template,request

baseapi = '/api/v1.0'


#                   Routes

#   Index
@app.route('/')
def index():
    resp = make_response(render_template('index.html', baseapi = baseapi))
    return resp



#   PulseAudio

@app.route(baseapi + '/pa/info', methods = ['GET'])
def get_pa_info():
    info = handlers.pa_info()
    return jsonify({'pa_info':info})


@app.route(baseapi + '/pa/sinks', methods = ['GET'])
def get_pa_sinks():
    info  = handlers.pa_sinks()
    return jsonify({'pa_sinks': info})



#   Deadbeef

@app.route(baseapi + '/dbf/now', methods = ['GET'])
def get_dbf_now():
    info = handlers.dbf_now()
    return jsonify(info)

@app.route(baseapi + '/dbf/next', methods = ['GET'])
def get_dbf_next():
    info = handlers.dbf_ctl("next")
    return jsonify({'dbf_next': info})

@app.route(baseapi + '/dbf/prev', methods = ['GET'])
def get_dbf_prev():
    info = handlers.dbf_ctl("prev")
    return jsonify({'dbf_prev': info})

@app.route(baseapi + '/dbf/play', methods = ['GET'])
def get_dbf_play_toggle():
    info = handlers.dbf_ctl("play")
    return jsonify({'dbf_play_toggle': info})

@app.route(baseapi + '/dbf/stop', methods = ['GET'])
def get_dbf_stop():
    info = handlers.dbf_ctl("stop")
    return jsonify({'dbf_stop': info})

@app.route(baseapi + '/dbf/random', methods = ['GET'])
def get_dbf_random():
    info = handlers.dbf_ctl("random")
    return jsonify({'dbf_random': info})



#   Internal 

@app.route('/requests', methods=['GET'])
def get_requests():
    output = handlers.list_routes()
    return jsonify({'requests': sorted(output)})


@app.errorhandler(404)
def not_found(error):
    routes = handlers.list_routes()
    response = {'error': 'Bad request', 'info': {'try': '/requests'}}
    return make_response(jsonify(response), 404)


