from socket import *
from select import *
import re


class WebServer:
    def __init__(self, host="0.0.0.0", port=11111, html=None):
        self.host = host
        self.port = port
        self.html = html
        self.rlist = []
        self.wlist = []
        self.xlist = []
        self.createsock()
        self.bind()

    def createsock(self):
        self.sock = socket()
        self.sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        self.sock.setblocking(False)
        self.rlist.append(self.sock)

    def bind(self):
        ADDR = (self.host, self.port)
        self.sock.bind(ADDR)

    def start(self):
        self.sock.listen(5)
        print("Listen port", self.port)
        # 循环监控IO发生
        while True:
            # 开始监控IO
            rs, ws, xs = select(self.rlist, self.wlist, self.xlist)
            for r in rs:
                if r is self.sock:
                    connfd, addr = self.sock.accept()
                    print("connect from", addr)
                    connfd.setblocking(False)
                    self.rlist.append(connfd)
                else:
                    self.handle(r)

    def handle(self, connfd):
        request = connfd.recv(1024 * 10).decode()
        pattern = "[A-Z]+\s+(?P<info>/\S*)"
        result = re.match(pattern, request)
        if result:
            info = result.group("info")
            print("请求内容：", info)
            self.send_html(connfd, info)
        else:
            connfd.close()
            self.rlist.remove(connfd)
            return

    def send_html(self, connfd, info):
        if info == "/":
            filename = self.html + "/index.html"
        else:
            filename = self.html + info
        try:
            f = open(filename, "rb")
        except:
            response = "HTTP/1.1 404 Not Found\r\n"
            response += "Content-Type:text/html\r\n"
            response += "\r\n"
            response += "<h1>Sorry...<\h1>"
            response = response.encode()
        else:
            data = f.read()
            response = "HTTP/1.1 200 OK\r\n"
            response += "Content-Type:text/html\r\n"
            response += "Content-Length:%d\r\n" % len(data)
            response += "\r\n"
            response = response.encode() + data
        finally:
            connfd.send(response)


if __name__ == '__main__':
    server = WebServer(host="0.0.0.0", port=11111, html="./static")
    server.start()
