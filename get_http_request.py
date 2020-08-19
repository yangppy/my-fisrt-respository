"""
http 请求
"""
from socket import *

# tcp 套接字
s = socket()
s.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
s.bind(("0.0.0.0", 11111))
s.listen(5)
while True:
    c, addr = s.accept()
    data = c.recv(1024 * 10)

    html = "HTTP/1.1 200 OK\r\n"
    html += "Content-Type:text/html\r\n"
    html += "\r\n"
    with open("danei.html") as f:
        html += f.read()
    c.send(html.encode())
    print(data.decode())
    c.close()
# s.close()
