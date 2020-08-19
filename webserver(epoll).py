from socket import *
from select import *
import re


class WebServer:
    def __init__(self, host="0.0.0.0", port=11111, html=None):
        self.host = host
        self.port = port
        self.html = html
        self.map = {}
        self.createsock()
        self.bind()
        self.ep = epoll()

    def createsock(self):
        self.sock = socket()
        self.sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        self.sock.setblocking(False)

    def bind(self):
        ADDR = (self.host, self.port)
        self.sock.bind(ADDR)

    def start(self):
        self.map[self.sock.fileno()] = self.sock
        self.ep.register(self.sock, EPOLLIN)
        self.sock.listen(5)
        print("listen port", self.port)
        while True:
            events = self.ep.poll()
            for fd, event in events:
                if fd == self.sock.fileno():
                    connfd, addr = self.sock.accept()
                    print("connect from", addr)
                    self.map[connfd.fileno()] = connfd
                else:
                    self.handle(fd)

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
            response = "HTTP1.1 404 Not Found\r\n"
            response += "Content-Type:text/html\r\n"
            response += "\r\n"
            response = response.encode()
        else:
            data = f.read()
            response = "HTTP1.1 200 OK\r\n"
            response += "Content-Type:text/html\r\n"
            response += "Content-Length:%d\r\n" % len(data)
            response += "\r\n"
            response = response.encode() + data
        finally:
            connfd.send(response)


if __name__ == '__main__':
    server = WebServer(host="0.0.0.0", port=11111, html="./static")
    server.start()
    # 119.3.126.214