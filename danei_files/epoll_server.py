"""
poll 方法示例
"""
from select import *
from socket import *

# 准备点IO
sockfd = socket()
sockfd.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
sockfd.bind(('0.0.0.0', 11111))
sockfd.listen(5)
sockfd.setblocking(False)
# 生成epoll
p = epoll()
# 查找字典 与 register的IO对象时刻一直
map = {sockfd.fileno(): sockfd}
p.register(sockfd, EPOLLIN)  # 关注
while True:
    print("开始监控IO")
    events = p.poll()
    print(events)
    for fd, event in events:
        if fd == sockfd.fileno():
            print("等待连接")
            connfd, addr = map[fd].accept()
            print("connect from", addr)
            connfd.setblocking(False)
            p.register(connfd, EPOLLIN)
            map[connfd.fileno()] = connfd
        else:
            data = map[fd].recv(1024).decode()
            if not data:
                p.unregister(fd)
                map[fd].close()
                del map[fd]
                continue
            print(data)
            map[fd].send(b"ok")
