import base64
from PIL import Image
import io


with open("./tobase64/pyTogo.png", "rb") as img_file:
    base64_string = base64.b64encode(img_file.read()).decode('utf-8')


with open("./tobase64/mon_image.txt", "w") as txt_file:
    txt_file.write(base64_string)

print(base64_string)




