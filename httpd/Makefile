.PHONY: all

all: althttpd webserver

althttpd:
	cc -Os -Wall -Wextra -o bin/althttpd httpd/althttpd.c

webserver:
	cc -Os -Wall -Wextra -o bin/webserver httpd/webserver.c httpd/mongoose.c

clean:	
	rm -f bin/althttpd
	rm -f bin/webserver
