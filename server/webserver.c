// Copyright (c) 2015 Cesanta Software Limited
// All rights reserved

#include "mongoose.h"

static const struct mg_str        GM_HTTP_METHOD_POST     = MG_MK_STR("POST");

static const char*                s_http_port             = "9000";

static struct mg_serve_http_opts  s_http_server_opts;

static void ev_handler(struct mg_connection *nc, int ev, void *p)
{
  if (ev == MG_EV_HTTP_REQUEST) {
    mg_serve_http(nc, (struct http_message *) p, s_http_server_opts);
  }
}

int main(void) {
  struct mg_mgr mgr;
  struct mg_connection *nc;

  mg_mgr_init(&mgr, NULL);
  printf("Starting web server on port %s\n", s_http_port);
  nc = mg_bind(&mgr, s_http_port, ev_handler);
  if (nc == NULL) {
    printf("Failed to create listener\n");
    return 1;
  }

  // Set up HTTP server parameters
  mg_set_protocol_http_websocket(nc);
  s_http_server_opts.document_root = ".";  // Serve current directory
  s_http_server_opts.enable_directory_listing = "yes";

  for (;;) {
    mg_mgr_poll(&mgr, 100);
  }
  mg_mgr_free(&mgr);

  return 0;
}
