#  Handlers

import os
import subprocess
from time import sleep
from subprocess import check_output,check_call
from app import app,url_for
import alsaaudio 


dbf_fmt = '%artist%;%title%;%album%;%year%'


#       Backend defs

def pa_info():
    ret = {}
    out = check_output(['pactl', 'info'], stderr = subprocess.STDOUT)
    lines = out.splitlines()

    for l in lines:
        s = l.split(':')
        ret[s[0]] = s[1]

    return ret

def pa_sinks():
    out = check_output(['pactl', 'list', 'sinks'], stderr = subprocess.STDOUT)
    lines = out.splitlines()
    return 'dummy'



def as_info():
    data = {}
    cards = []
    version =  'N/A'
        
    with open('/proc/asound/version', 'r') as f:
        version = f.read();
    f.close()

    with open('/proc/asound/cards', 'r') as f:
        cards_info = f.read()
    f.close()

    for c in cards_info.splitlines():
        cards.append(c)

    data['cards'] = cards
    data['version'] = version

    return data



def as_list_mixers():
    try:
        amixers = alsaaudio.mixers()

        if type(amixers) is list:
            return {'state': 'ok', 'mixers': amixers}
        else:
            return {'state': 'cannot list mixers'}
    except:
        return {'state': 'alsaaudio error '}
 


def as_getvol(mixer):

    try:
        am = alsaaudio.Mixer(str(mixer))
        vol = am.getvolume()

        if type(vol) is list:
            return {'state': 'ok', 'vol': vol}
        else:
            return {'state': 'cannot get volume state'}
    except:
        return {'state': 'alsaaudio error '}
        


def as_setvol(device, vol):

    try:
        am = alsaaudio.Mixer(device)

        vol = int(vol)

        if (vol >= 0 and vol <= 100):
            value = vol
            am.setvolume(value)
            state = 'ok'
        else:
            state = 'bad value'

        return {'state': state}
    except:
        return {'state': 'alsa mixer not found'}




def dbf_running():
    try:
        with open(os.devnull, 'w') as devnull:
            pid = check_call(['pidof', '-s', 'deadbeef'], stdout = devnull, stderr = devnull)
        return True
    except subprocess.CalledProcessError, e:
        return False


def dbf_now():
    if not dbf_running():
        return {'state': 'nr'}
    
    sleep(0.5); # delay for a correct deadbeef state update
    with open(os.devnull, 'w') as devnull:
       string  = check_output(['deadbeef', '--nowplaying-tf', dbf_fmt], stderr = devnull)

    if (string ==  ';;;'):
        state = 'stopped'
    else:
	state = 'playing'

    t = string.split(';');
    out = { 'artist':t[0], 'title': t[1], 'album': t[2], 'year': t[3], 'state': state}
    return out


def dbf_ctl(cmd):
    if not dbf_running():
        return {'state': 'nr'}

    dctl = {'play': '--play-pause', 'next':'--next', 'prev': '--prev', 'stop': '--stop', 'random': '--random'}
    ctl = dctl[cmd]

    with open(os.devnull, 'w') as devnull:
        out = check_output(['deadbeef', ctl], stderr = devnull)

    return {'state': 'ok'}


# Internal

def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        options = {}
        methods = []

        for arg in rule.arguments:
            options[arg] = '[{0}]'.format(arg)

        for m in rule.methods:
            methods.append(m)

        #methods = ','.join(rule.methods)
        urn = url_for(rule.endpoint, **options)
        #line = urllib.unquote('{:50s} {:20s} {}'.format(rule.endpoint, methods, urn))
        line = { 'action': rule.endpoint,  'methods': methods, 'urn': urn }
        output.append(line)

    return output


