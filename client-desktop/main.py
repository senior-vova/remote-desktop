import base64
import io
import json
import sys
import socketio
import pyautogui
from PIL import ImageGrab

screenW = pyautogui.size().width
screenH = pyautogui.size().height
sio = socketio.Client()

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("I'm disconnected!")

@sio.on('mouse-move')
def on_mouse_move(row):
    data = json.loads(row)
    if data["room"] == client_id:
        try:
            pyautogui.moveTo(int(data["x"]), int(data["y"]))
        except Exception:
            print(data)

@sio.on('mouse-click')
def on_mouse_click(row):
    data = json.loads(row)
    if data["room"] == client_id:
        pyautogui.click(button="left")

@sio.on('type')
def on_key_tap(row):
    data = json.loads(row)
    print(data)
    if data["room"] == client_id:
        keys = [str(data["key"])]
        pyautogui.hotkey(*keys)


def app(url, client_id):

    @sio.event
    def connect():
        print("I'm connected!")
        sio.emit("join-message", client_id)


    @sio.on('on-get-screen')
    def on_get_screen(row):
        data = json.loads(row)
        # print(data)
        if data["room"] == client_id:
            try:
                output = io.BytesIO()
                ImageGrab.grab().save(output, 'png')
                contents = output.getvalue()
                byte_img = base64.b64encode(contents).decode()
                sio.emit("screen-data", json.dumps({ 
                    "room": data["room"], 
                    "image": byte_img,
                    "width": screenW,
                    "height": screenH
                }))
            except Exception:
                print("Screen send error")

    print("Connecting to " + url)
    sio.connect(url)

if __name__ == '__main__':
    url = sys.argv[1] # like "http://127.0.0.1:5000"
    client_id = sys.argv[2] # like "jermoc_1"
    app(url, client_id)

# url = "http://127.0.0.1:5000"
# client_id = "jermoc_1"

# print("Connecting to " + url)
# sio.connect(url)
