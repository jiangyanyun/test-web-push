!(function () {
  "use strict";
  var u = function () {
    return (u =
      Object.assign ||
      function (n) {
        for (var t, e = 1, r = arguments.length; e < r; e++) {
          t = arguments[e];
          for (var i in t)
            Object.prototype.hasOwnProperty.call(t, i) && (n[i] = t[i]);
        }
        return n;
      }).apply(this, arguments);
  };
  function i(n, t) {
    for (var e = 0; e < n.length; e++) t(n[e], e);
  }
  function l(n, t) {
    if (n.constructor == Array) i(n, t);
    else for (var e in n) Object.hasOwnProperty.call(n, e) && t(n[e], e);
  }
  var e = function In() {
    var u = this;
    this.tasks = {};
    this.queue = function (n, t, e, r) {
      void 0 === e && (e = null);
      var i,
        o = setTimeout(function () {
          n.call(e);
          delete u.tasks[i];
        }, t);
      i = ((!!r && r) || new Date().valueOf() + Math.random()).toString();
      u.tasks[i] = o;
      return i;
    };
    this.cancel = function (n) {
      if (u.tasks[n]) {
        clearTimeout(u.tasks[n]);
        delete u.tasks[n];
      }
    };
    this.exist = function (n) {
      return !!u.tasks[n];
    };
    this.clearAll = function () {
      return l(u.tasks, function (n, t) {
        return u.cancel(t);
      });
    };
    this.tasks = {};
  };
  function s(n) {
    return "function" == typeof n;
  }
  function f(n) {
    return "string" == typeof n;
  }
  function p(n) {
    return null == n;
  }
  function c(e, n, t) {
    var r = t;
    i(n, function (n, t) {
      r = r === undefined ? n : e(r, n, t);
    });
    return r;
  }
  function a(n, e) {
    var r = [];
    i(n, function (n, t) {
      return r.push(e(n, t));
    });
    return r;
  }
  function d(n, e) {
    var r = [];
    i(n, function (n, t) {
      e(n, t) && r.push(n);
    });
    return r;
  }
  function n(n, t) {
    var e = (function i(n) {
        var t = function e() {};
        t.prototype = n;
        return new t();
      })(n.prototype),
      r = t.prototype;
    e.constructor = t;
    l(r, function (n, t) {
      e[t] = r[t];
    });
    t.prototype = e;
  }
  var h = (function () {
      function t() {}
      t.prototype.isDefined = function () {
        return !this.isEmpty();
      };
      t.build = function (n) {
        return p(n) ? g : m(n);
      };
      t.nonEmptyString = function (n) {
        return t.build(n).filter(function (n) {
          return f(n) && 0 < n.length;
        });
      };
      return t;
    })(),
    t = (function () {
      function n() {}
      n.prototype.isEmpty = function () {
        return !0;
      };
      n.prototype.isDefined = function () {
        return !1;
      };
      n.prototype.map = function (n) {
        return g;
      };
      n.prototype.foreach = function (n) {};
      n.prototype.flatMap = function (n) {
        return g;
      };
      n.prototype.filter = function (n) {
        return g;
      };
      n.prototype.orFillWith = function (n) {
        return n();
      };
      n.prototype.getOrElse = function (n) {
        return n;
      };
      n.prototype.get = function () {
        throw new Error("NoSuchElementException");
      };
      n.prototype.getOrElseL = function (n) {
        return n();
      };
      n.prototype.toString = function () {
        return undefined;
      };
      return n;
    })(),
    r = (function () {
      function n(n) {
        this.value = n;
      }
      n.prototype.isEmpty = function () {
        return !1;
      };
      n.prototype.isDefined = function () {
        return !0;
      };
      n.prototype.map = function (n) {
        return m(n(this.value));
      };
      n.prototype.foreach = function (n) {
        return n(this.value);
      };
      n.prototype.flatMap = function (n) {
        return n(this.value);
      };
      n.prototype.filter = function (n) {
        return n(this.value) ? m(this.value) : g;
      };
      n.prototype.orFillWith = function (n) {
        return this;
      };
      n.prototype.getOrElse = function (n) {
        return this.value;
      };
      n.prototype.getOrElseL = function (n) {
        return this.value;
      };
      n.prototype.get = function () {
        return this.value;
      };
      n.prototype.toString = function () {
        return this.value.toString();
      };
      return n;
    })();
  n(h, r);
  n(h, t);
  var g = new t();
  function m(n) {
    return new r(n);
  }
  var v = (function () {
      function o(n) {
        var e = this;
        this.$state = "PENDING";
        this.$chained = [];
        var t = function (t) {
          "PENDING" === e.$state &&
            setTimeout(function () {
              e.$state = "REJECTED";
              e.$internalValue = t;
              if (
                0 ===
                d(e.$chained, function (n) {
                  return !!n.onRejected;
                }).length
              )
                if (o.handleUnResolveError) o.handleUnResolveError(t);
                else {
                  console.log(JSON.stringify(t));
                  console.log("Unprocessed Future Exception.");
                }
              l(e.$chained, function (n) {
                return n.onRejected && n.onRejected(t);
              });
            }, 0);
        };
        try {
          n(function (t) {
            if ("PENDING" === e.$state) {
              e.$state = "FULFILLED";
              e.$internalValue = t;
              l(e.$chained, function (n) {
                return n.onFulfilled && n.onFulfilled(t);
              });
            }
          }, t);
        } catch (r) {
          t(r);
        }
      }
      o.prototype.map = function (t) {
        return this.flatMap(function (n) {
          return o.successful(t(n));
        });
      };
      o.prototype.then = function (n) {
        return this.map(n);
      };
      o.prototype.flatMap = function (i) {
        var n = this;
        return new o(function (e, r) {
          n.onComplete(function (n) {
            try {
              i(n).onComplete(e, r);
            } catch (t) {
              r(t);
            }
          }, r);
        });
      };
      o.prototype.foreach = function (t) {
        this.map(function (n) {
          return t(n);
        });
      };
      o.prototype.failWith = function (n) {
        this.onComplete(function (n) {
          return n;
        }, n);
      };
      o.prototype.recoverWith = function (i) {
        var n = this;
        return new o(function (e, r) {
          n.failWith(function (n) {
            try {
              e(i(n));
            } catch (t) {
              r(t);
            }
          });
        });
      };
      o.prototype.recover = function (n) {
        return this.recoverWith(n).flatMap(function (n) {
          return n;
        });
      };
      o.prototype.onComplete = function (n, t) {
        "FULFILLED" === this.$state
          ? n(this.$internalValue)
          : "REJECTED" === this.$state
          ? t(this.$internalValue)
          : this.$chained.push({ onFulfilled: n, onRejected: t });
      };
      o.prototype.eventually = function (t) {
        this.map(function (n) {
          return t();
        }).recoverWith(function (n) {
          t();
          throw n;
        });
      };
      o.successful = function (t) {
        return new o(function (n) {
          s(t) ? n(t()) : n(t);
        });
      };
      o.failed = function (e) {
        return new o(function (n, t) {
          return t(e);
        });
      };
      o.sequence = function (n) {
        return c(
          function (n, e) {
            return n.flatMap(function (t) {
              return e.map(function (n) {
                return t.concat(n);
              });
            });
          },
          n,
          o.successful([])
        );
      };
      return o;
    })(),
    o = function (n) {
      return JSON.parse(n);
    };
  function y(n) {
    return (
      0 !== n.expiration && new Date().valueOf() - n.updatedAt > n.expiration
    );
  }
  var w = function Ln(n, t) {
      void 0 === t && (t = 0);
      var i = this;
      this.namespace = n;
      this.expiration = t;
      this.storage = window.localStorage;
      this.key = function (n) {
        return "#" + i.namespace + "#" + n;
      };
      this.isValidKey = function (n) {
        return "#" == n[0] && n.split("#")[1] == i.namespace;
      };
      this.get = function (n) {
        return v.successful(function () {
          return h
            .build(i.storage.getItem(i.key(n)))
            .map(function (n) {
              return o(n);
            })
            .filter(function (n) {
              return !p(n.payload) && !p(n.expiration) && !y(n);
            })
            .map(function (n) {
              return n.payload;
            });
        });
      };
      this.getOrElse = function (t, e) {
        return i.get(t).flatMap(function (n) {
          return n.isDefined()
            ? v.successful(n.get())
            : i.set(t, e).map(function (n) {
                return e;
              });
        });
      };
      this.set = function (n, t) {
        return v.successful(function () {
          i.storage.setItem(
            i.key(n),
            (function (n) {
              return JSON.stringify(n);
            })({
              payload: t,
              expiration: i.expiration,
              updatedAt: new Date().valueOf(),
            })
          );
        });
      };
      this.deleteReocrd = function (n) {
        i.storage.removeItem(n);
      };
      this.clearAll = function () {
        return v.successful(function () {
          i.traverse(function (n, t) {
            return i.deleteReocrd(n);
          });
        });
      };
      this.clear = function (n) {
        return v.successful(function () {
          n = i.key(n);
          i.isValidKey(n) && i.deleteReocrd(n);
        });
      };
      this.filter = function (r) {
        return v.successful(function () {
          var e = [];
          i.traverse(function (n, t) {
            !y(t) && r(t.payload) && e.push(t.payload);
          });
          return e;
        });
      };
      this.getAll = function () {
        return i.filter(function (n) {
          return !0;
        });
      };
      this.traverse = function (e) {
        l(i.storage, function (n, t) {
          i.isValidKey(t) && e(t, o(i.storage.getItem(t)));
        });
      };
    },
    E = function Nn() {
      var r = this;
      this.statusCache = new w("growingio-gtouch-status");
      this.get = function (n) {
        return r.statusCache.getOrElse(n.id.toString(), r.defaultStatus(n));
      };
      this.clear = function (n) {
        return r.statusCache.clear(n);
      };
      this.clearAll = function () {
        return r.statusCache.clearAll();
      };
      this.plusShowTimes = function (t, e) {
        void 0 === e && (e = 1);
        return r.get(t).flatMap(function (n) {
          return r.statusCache.set(t.id.toString(), {
            id: t.id,
            lastCheckAt: new Date().valueOf(),
            showTimes: n.showTimes + e,
          });
        });
      };
      this.defaultStatus = function (n) {
        return { id: n.id, lastCheckAt: 0, showTimes: 0 };
      };
    };
  function b(n) {
    var o = document.createElement("a");
    o.href = n;
    return {
      protocol: o.protocol.replace(":", ""),
      host: o.hostname,
      port: o.port,
      query: o.search,
      params: (function () {
        for (
          var n,
            t = {},
            e = o.search.replace(/^\?/, "").split("&"),
            r = e.length,
            i = 0;
          i < r;
          i++
        )
          e[i] && (t[(n = e[i].split("="))[0]] = decodeURIComponent(n[1]));
        return t;
      })(),
      hash: o.hash.replace("#", ""),
      path: o.pathname.replace(/^([^\/])/, "/$1"),
    };
  }
  function k(n, t) {
    if (n === t) return !0;
    var e = t.replace(/\./g, "\\.").replace(/\*/g, "[/]?.*[/]?") + "[/]?",
      r = n.match(new RegExp(e, "i"));
    return null !== r && r[0] == r.input;
  }
  function M(n, t) {
    void 0 === t && (t = !1);
    var e = (n = n.replace("http://", "").replace("https://", "").trim())[
      n.length - 1
    ];
    t && "/" === e && (n = n.substr(0, n.length - 1));
    return n;
  }
  function _(n) {
    var t = decodeURIComponent(
      document.cookie.replace(
        new RegExp(
          "(?:(?:^|.*;)\\s*" +
            encodeURIComponent(n).replace(/[\-\.\+\*]/g, "\\$&") +
            "\\s*\\=\\s*([^;]*).*$)|^.*$"
        ),
        "$1"
      )
    );
    return t ? m(t) : g;
  }
  var x = new w("growingio-gtouch"),
    O = "user-flg",
    S = (function () {
      function o() {}
      o.getU = function () {
        return _("gr_user_id");
      };
      o.getCs1 = function () {
        return o.getAccountId().flatMap(function (n) {
          var t = _(n + "_gr_cs1"),
            e = _("gr_session_id_" + n)
              .flatMap(function (n) {
                return _("gr_cs1_" + n);
              })
              .map(function (n) {
                return 0 === n.indexOf("user_id")
                  ? n.replace(/^user_id:/, "")
                  : n;
              });
          return t.isDefined() ? t : e;
        });
      };
      o.getAccountId = function () {
        return window.vds && window.vds.accountId ? m(window.vds.accountId) : g;
      };
      o.setUserFlag = function (n) {
        return x.set(O, { u: n.u, bu: n.bu, cs: n.cs, bcs: n.bcs });
      };
      o.getUserFlag = function () {
        return x.get(O).map(function (n) {
          var t = o.getCs1(),
            e = o.getU(),
            r = t
              .map(function (t) {
                return n
                  .filter(function (n) {
                    return n.cs === t && !!n.bcs;
                  })
                  .map(function (n) {
                    return { bcs: n.bcs };
                  })
                  .getOrElse({ cs: t });
              })
              .getOrElse({}),
            i = e
              .map(function (t) {
                return n
                  .filter(function (n) {
                    return n.u === t && !!n.bu;
                  })
                  .map(function (n) {
                    return { bu: n.bu };
                  })
                  .getOrElse({ u: t });
              })
              .getOrElse({});
          return u({}, r, i);
        });
      };
      return o;
    })(),
    A = {
      namespace: "gio_plugin_gtouch",
      version: "1.1.10",
      data_host: "messages.growingio.com",
      icon_host: "//assets.giocdn.com/sdk/marketing/1.1/icons.png",
      sentryKey: "e515b3a16bef476db5a7b80818c661bd",
      sentryProductId: 3,
      sentryHost: "https://sentry.growingio.com",
      cache: !1,
      cache_expiration: 3e5,
    };
  A.data_host =
    ("https:" == document.location.protocol ? "https://" : "http://") +
    A.data_host;
  A.pushMessageApi = function () {
    return S.getAccountId().map(function (n) {
      return A.data_host + "/v2/" + n + "/notifications";
    });
  };
  var C = function Hn(n, t) {
    void 0 === t && (t = 499);
    Error.call(this, n);
    this.name = "HttpError";
    this.code = t;
  };
  n(Error, C);
  var T = new (function Pn() {
      var f = this;
      this.send = function (s, c, a) {
        return new v(function (n, t) {
          if (p(window.XDomainRequest)) {
            var e = null;
            if (p(XMLHttpRequest))
              for (
                var r = [
                    "MSXML2.XmlHttp.6.0",
                    "MSXML2.XmlHttp.5.0",
                    "MSXML2.XmlHttp.4.0",
                    "MSXML2.XmlHttp.3.0",
                    "MSXML2.XmlHttp.2.0",
                    "Microsoft.XmlHttp",
                  ],
                  i = 0;
                i < r.length;
                i++
              )
                try {
                  e = new ActiveXObject(r[i]);
                  break;
                } catch (u) {
                  t(u);
                }
            else e = new XMLHttpRequest();
            if (e) {
              e.open(c, s, !0);
              e.onreadystatechange = function () {
                if (4 == e.readyState) {
                  f.removePendingXDR(e);
                  200 <= e.status && e.status < 300
                    ? n(e.responseText)
                    : t(
                        new C(
                          "[Status: " +
                            e.status +
                            "]\tReason: " +
                            (e.responseText || e.response || "") +
                            " \t Url: " +
                            s,
                          e.status
                        )
                      );
                }
              };
              "POST" == c &&
                e.setRequestHeader("Content-type", "application/json");
              e.send(JSON.stringify(a));
            }
          } else {
            var o = new window.XDomainRequest();
            o.open(c, s);
            o.ontimeout = function () {
              f.removePendingXDR(o);
              t(new C("Request " + s + " timeout"));
            };
            o.onerror = function () {
              f.removePendingXDR(o);
              t(new C("Request " + s + " error"));
            };
            o.onload = function () {
              f.removePendingXDR(o);
              n(o.responseText);
            };
            o.onprogress = function () {};
            o.send();
          }
        });
      };
      this.removePendingXDR = function (n) {};
      this.getQuery = function (n) {
        void 0 === n && (n = {});
        var e = [];
        l(n, function (n, t) {
          e.push(encodeURIComponent(t) + "=" + encodeURIComponent(n));
        });
        return e.join("&");
      };
      this.get = function (n, t) {
        void 0 === t && (t = {});
        var e = f.getQuery(t);
        return f.send(n + (0 < e.length ? "?" + e : ""), "GET", null);
      };
      this.post = function (n, t, e) {
        void 0 === t && (t = {});
        var r = f.getQuery(t);
        return f.send(n + (0 < r.length ? "?" + r : ""), "POST", e);
      };
    })(),
    D = function Un(n, t) {
      void 0 === t && (t = 0);
      w.call(this, n, t);
      this.storage = window.sessionStorage;
    };
  n(w, D);
  var R,
    I = new D("gtouch-messages", A.cache_expiration),
    L = "all";
  function N() {
    var t = A.pushMessageApi().get();
    return S.getUserFlag()
      .map(function (n) {
        var e = [];
        l(n, function (n, t) {
          return e.push(t + "=" + n);
        });
        return t + "?" + e.join("&");
      })
      .flatMap(function (n) {
        return T.get(n).map(function (n) {
          return JSON.parse(n);
        });
      })
      .flatMap(function (t) {
        var n = {
          bcs: t.idMappings.bcs,
          bu: t.idMappings.bu,
          u: S.getU().getOrElse(undefined),
          cs: S.getCs1().getOrElse(undefined),
        };
        return S.setUserFlag(n).map(function (n) {
          return t.popupWindows.concat(t.splashs);
        });
      });
  }
  var H = (function () {
    function n() {}
    n.getAll = function (n) {
      return !n && R
        ? v.successful(R)
        : n
        ? I.get(L).flatMap(function (n) {
            return n.isEmpty()
              ? N().flatMap(function (t) {
                  return I.clear(L)
                    .flatMap(function (n) {
                      return I.set(L, t);
                    })
                    .map(function (n) {
                      return t;
                    });
                })
              : v.successful(n.get());
          })
        : N().map(function (n) {
            return (R = n);
          });
    };
    return n;
  })();
  var P = function Wn(n) {
    var e = this;
    this.listener = n;
    this.feed = function (n) {
      e.messages.push(n);
      e.isWorking || e.dispatch();
    };
    this.contains = function (n) {
      return 0 < d(e.messages, n).length;
    };
    this.clear = function () {
      e.messages = [];
    };
    this.dispatch = (function t(r, i, o) {
      var u = null;
      return function () {
        for (var n = arguments, t = [], e = 0; e < arguments.length; e++)
          t[e] = n[e];
        clearTimeout(u);
        u = setTimeout(function () {
          r.apply(o, t);
        }, i);
      };
    })(function () {
      if (0 < e.messages.length && !e.isWorking && e.listener) {
        e.isWorking = !0;
        var t = e.messages.shift();
        v.successful(1)
          .flatMap(function (n) {
            return e.listener(t);
          })
          .eventually(function () {
            e.isWorking = !1;
            e.dispatch();
          });
      }
    }, 10);
    this.messages = [];
    this.isWorking = !1;
  };
  var U,
    W,
    $,
    X,
    F,
    j,
    Q,
    q,
    z,
    V = {
      supportStorage: !!window.localStorage && null != window.localStorage,
      supportWebWorker: !!window.Worker,
      isDebugMode: !!(function $n(n, t) {
        n = n.replace(/[\[\]]/g, "\\$&");
        var e = new RegExp("[?&]" + n + "(=([^&#]*)|&|#|$)").exec(t);
        return e
          ? e[2]
            ? decodeURIComponent(e[2].replace(/\+/g, " "))
            : ""
          : null;
      })("growingio-sdk-test", window.location.href),
      inPhone:
        ((U = navigator.userAgent.toLowerCase()),
        (W = -1 < U.indexOf("ipad")),
        ($ = -1 < U.indexOf("iphone os")),
        (X = -1 < U.indexOf("midp")),
        (F = -1 < U.indexOf("rv:1.2.3.4")),
        (j = -1 < U.indexOf("ucweb")),
        (Q = -1 < U.indexOf("android")),
        (q = -1 < U.indexOf("windows ce")),
        (z = -1 < U.indexOf("windows mobile")),
        W || $ || X || F || j || Q || q || z),
    };
  var J = ["Webkit", "Moz", "ms"],
    G = document.createElement("div").style,
    K = {};
  function B(n) {
    var t = K[n];
    return (
      t ||
      (n in G
        ? n
        : (K[n] =
            (function r(n) {
              for (var t = n[0].toUpperCase() + n.slice(1), e = J.length; e--; )
                if ((n = J[e] + t) in G) return n;
            })(n) || n))
    );
  }
  var Y = /^-ms-/,
    Z = /-([a-z])/g;
  function nn(n) {
    return (function t(n) {
      return n.replace(Z, function (n, t) {
        return t.toUpperCase();
      });
    })(n.replace(Y, "ms-"));
  }
  var tn = {
    addEventListener: function Xn(n, t, e, r) {
      void 0 === r && (r = !1);
      n.addEventListener
        ? n.addEventListener(t, e, r)
        : n.attachEvent
        ? n.attachEvent("on" + t, e)
        : (n["on" + t] = e);
    },
    remove: function (n) {
      n.remove ? n.remove() : n.parentNode && n.parentNode.removeChild(n);
    },
    ajax: T,
    css: function Fn(r, n) {
      l(n, function (n, t) {
        t = B((t = nn(t)));
        try {
          r.style[t] = n;
        } catch (e) {}
      });
      r.style.boxSizing = "border-box";
    },
  };
  function en(n, t, e) {
    var r = document.createElement(n);
    t.innerHtml && (r.innerHTML = t.innerHtml);
    t.id && (r.id = t.id);
    t.className && (r.className = t.className);
    t.style && tn.css(r, t.style);
    t.onClick &&
      tn.addEventListener(r, "click", function (n) {
        return t.onClick(n, r);
      });
    e &&
      !(function i(n) {
        "[object Array]" !== Object.prototype.toString.call(n) && (n = [n]);
        l(n, function (n) {
          f(n)
            ? r.appendChild(
                (function t(n) {
                  return document.createTextNode(n);
                })(n)
              )
            : s(n)
            ? i(n())
            : r.appendChild(n);
        });
      })(e);
    return r;
  }
  var rn = function (n, t) {
    return en("div", n, t);
  };
  function on(n, t) {
    var e = {
      background: "url(" + A.icon_host + ")",
      "background-repeat": "no-repeat",
      "vertical-align": "middle",
      display: "inline-block",
    };
    return function () {
      return (function (n) {
        return en("i", n);
      })(
        u({}, t, {
          style: u({}, e, t.style),
          className: "_gio_c_icon _gio_c_icon_" + n,
        })
      );
    };
  }
  var un = {
    Check: function (n) {
      void 0 === n && (n = {});
      return on(
        "check",
        u({}, n, {
          style: u(
            {
              "background-position": "-12px -12px",
              width: "16px",
              height: "16px",
            },
            n.style
          ),
        })
      );
    },
    Close: function (n) {
      void 0 === n && (n = {});
      return on(
        "close",
        u({}, n, {
          style: u(
            {
              "background-position": "-128px -8px",
              width: "24px",
              height: "24px",
            },
            n.style
          ),
        })
      );
    },
    VClose: function (n) {
      return function () {
        return (function (t) {
          var n = rn({ innerHtml: t.innerHtml }).firstElementChild;
          t.id && (n.id = t.id);
          t.style && tn.css(n, t.style);
          t.onClick &&
            tn.addEventListener(n, "click", function (n) {
              return t.onClick(n);
            });
          return n;
        })(
          u({}, n, {
            innerHtml:
              '<svg viewBox="0 0 1080 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25">\n      <path d="M1003.064889 9.159111l40.220444 40.220445-965.404444 965.404444-40.277333-40.163556z" fill="#D0D0D0"></path>\n      <path d="M1043.285333 974.620444l-40.220444 40.220445L37.660444 49.436444 77.767111 9.102222z" fill="#D0D0D0"></path>\n      </svg>',
          })
        );
      };
    },
  };
  function sn(n) {
    void 0 === n && (n = {});
    return { position: h.build(n.position).getOrElse("center") };
  }
  var cn = {
    display: "inline-block",
    overflow: "hidden",
    position: "relative",
    "z-index": 2147483646,
    zoom: 1,
  };
  function an(t, e) {
    void 0 === e && (e = {});
    return v.successful(function () {
      var n = rn({
        className: "_gio_c_modal _gio_c_modal_" + sn(e).position,
        style: u({}, cn, t),
      });
      return h.build(n);
    });
  }
  function fn(r, i, o) {
    return i.src
      ? new v(function (e, t) {
          var n = h
            .build(i.target)
            .flatMap(function (n) {
              return h.nonEmptyString(n.href);
            })
            .map(function (n) {
              return (function t(e, r) {
                return function (n, t) {
                  r && r();
                  window.open && !V.inPhone
                    ? window.open(e)
                    : (window.location.href = e);
                };
              })(n, function () {
                o && o.clickAndTrackAndDisappearPermanently();
              });
            })
            .getOrElse(function () {
              i.ctd && o && o.clickAndTrackAndDisappearPermanently();
            });
          !(function (t) {
            var e = en("img", t);
            t.onLoad &&
              tn.addEventListener(e, "load", function (n) {
                return t.onLoad(n, e);
              });
            t.onError &&
              tn.addEventListener(e, "error", function (n) {
                return t.onError(n);
              });
            e.src = t.src;
          })({
            src: i.src,
            className: "_gio_c_img",
            style: u({}, r, { cursor: n ? "pointer" : "auto" }),
            onLoad: function (n, t) {
              t.removeAttribute("width");
              t.removeAttribute("height");
              e(h.build(t));
            },
            onError: function (n) {
              t(new C("Img Load Failed, " + i.src));
            },
            onClick: n,
          });
        })
      : v.successful(g);
  }
  var ln = (function () {
      function n(n, t) {
        this.eventMessageQueue = n;
        this.commandQueue = t;
        this.messageStatusStoreService = new E();
        this.executionDispatch = new e();
      }
      n.prototype.run = function () {
        var e = this,
          t = new P(function (t) {
            return H.getAll(A.cache).map(function (n) {
              e.processEvent(
                t,
                d(n, function (n) {
                  return !n.abTest || !n.abTest.ctrlGroup;
                })
              );
            });
          });
        this.eventMessageQueue.consume(function (n) {
          t.feed(n);
        });
      };
      n.prototype.stop = function () {
        this.executionDispatch.clearAll();
      };
      n.prototype.processEvent = function (n, t) {
        var e = this;
        if ("page" === n.t) {
          this.executionDispatch.clearAll();
          this.commandQueue.feed({ type: "CLEAR_ALL" });
        }
        n = u({}, n, { href: window.location.href });
        this.getValidMessages(n, t).map(function (n) {
          l(n, function (n) {
            return e.deferredContext(n);
          });
        });
      };
      n.prototype.getValidMessages = function (e, n) {
        var r = this,
          t = a(n, function (t) {
            return r.messageStatusStoreService.get(t).map(function (n) {
              return r.validActionType(t, e) &&
                r.validTimeRange(t) &&
                r.validTimes(t, n) &&
                r.isNotInCd(
                  t.rule.triggerCd,
                  n.lastCheckAt,
                  new Date().valueOf()
                ) &&
                r.validAudienceFilter(t, e) &&
                r.validTriggerPages(e, t)
                ? t
                : null;
            });
          });
        return v.sequence(t).map(function (n) {
          return a(
            (function i(n, e) {
              var r = {};
              l(n, function (n) {
                var t = JSON.stringify(e(n));
                r[t] = r[t] || [];
                r[t].push(n);
              });
              var t = [];
              l(r, function (n) {
                return t.push(n);
              });
              return t;
            })(
              d(n, function (n) {
                return !!n;
              }),
              function (n) {
                return sn(n.contentMetadata.config).position;
              }
            ),
            function (n) {
              var t;
              l(n, function (n) {
                t
                  ? (t.priority < n.priority || t.updateAt < n.updateAt) &&
                    (t = n)
                  : (t = n);
              });
              return t;
            }
          );
        });
      };
      n.prototype.validActionType = function (n, t) {
        return (
          ("page" === t.t &&
            ("pageOpen" === n.rule.action || "appOpen" === n.rule.action)) ||
          ("cstm" === t.t && t.n === n.rule.action)
        );
      };
      n.prototype.validAudienceFilter = function (n, o) {
        var t = n.rule.filters;
        if (!t || 0 === t.exprs.length) return !0;
        if (
          (function e(n) {
            if (p(n)) return !0;
            if (n.length !== undefined) return 0 === n.length;
            if ("object" != typeof n) return !1;
            for (var t in n) if (Object.hasOwnProperty.call(n, t)) return !1;
            return !0;
          })(o["var"])
        )
          return !1;
        var u = t.expr.split("");
        l(t.exprs, function (t) {
          var e = "false",
            n = t.op,
            r = o["var"][t.key],
            i = t.value;
          if (r !== undefined) {
            switch (n) {
              case "in":
                e = '"' + i + '".indexOf("' + r + '") > -1';
                break;
              case "not in":
                e = '"' + i + '".indexOf("' + r + '") == -1';
                break;
              case "=":
                e = '"' + i + '" == "' + r + '"';
                break;
              default:
                e = '"' + i + '" ' + n + ' "' + r + '"';
            }
            u = a(u, function (n) {
              return n === t.symbol ? "(" + e + ")" : n;
            });
          }
        });
        try {
          return new Function("return " + u.join(""))();
        } catch (r) {
          return !1;
        }
      };
      n.prototype.validTimeRange = function (n) {
        var t = new Date().valueOf();
        return (n.rule.startAt || 0) <= t && t < n.rule.endAt;
      };
      n.prototype.validTimes = function (n, t) {
        return t.showTimes < n.rule.limit;
      };
      n.prototype.isNotInCd = function (n, t, e) {
        var r = 1e3 * (n || 0);
        return 0 == r || t + r - ((t + r) % 864e5) < e;
      };
      n.prototype.validTriggerPages = function (t, n) {
        document.getElementById("boxcontent").innerHTML='h5 validTriggerPages';
        return (
          0 <
          d(n.rule.triggerPages, function (n) {
            return (function o(n, t) {
              if (n.length === t.length && n === t) return !0;
              "?" === n[n.length - 1] && (n = n.substr(0, n.length - 1));
              var e = b(n),
                r = b(t);
              if (
                e.hash === r.hash &&
                e.host === r.host &&
                e.protocol === r.protocol &&
                e.port === r.port &&
                k(e.path, r.path)
              ) {
                var i = !0;
                l(r.params, function (n, t) {
                  i =
                    e.params[t] !== undefined &&
                    i &&
                    (e.params[t] === n || "*" === n);
                });
                return i;
              }
              return k(M(n), M(t, !0));
            })(t.href, n);
          }).length
        );
      };
      n.prototype.deferredContext = function (n) {
        var t = this,
          e = n.rule.triggerDelay || 0,
          r = n.id.toString();
        this.executionDispatch.exist(r) && this.executionDispatch.cancel(r);
        this.executionDispatch.queue(
          function () {
            t.commandQueue.feed({
              type: "RENDER_PUSHMESSAGE",
              payload: u({}, n, { env: V }),
            });
          },
          1e3 * e,
          null,
          r
        );
      };
      return n;
    })(),
    pn = "gio-message-id",
    dn = "gio-message-type",
    hn = (function () {
      function n(n, t, e, r) {
        this.messageId = n;
        this.messageType = t;
        ln.call(this, e, r);
        this.messageId = n;
      }
      n.prototype.run = function () {
        var e = this;
        A.pushMessageApi().map(function (n) {
          T.get(
            n +
              "/preview?message_id=" +
              e.messageId +
              "&msgType=" +
              e.messageType
          )
            .map(function (n) {
              return JSON.parse(n);
            })
            .map(function (t) {
              e.eventMessageQueue.consume(function (n) {
                document.getElementById("boxcontent2").innerHTML='popupWindows'
                e.processEvent(n, t.popupWindows.concat(t.splashs));
              });
            });
        });
      };
      n.prototype.getValidMessages = function (t, n) {
        var e = this;
        function r(n, t, e) {
          return n.replace(new RegExp(t + "=" + e + "&?"), "");
        }
        var i = r(
          r(r(t.href, "growingio-sdk-test", "1"), pn, this.messageId),
          dn,
          this.messageType
        );
        t = u({}, t, { href: i });
        return v.successful(function () {
          return (function o(r) {
            for (var n = arguments, t = [], e = 1; e < arguments.length; e++)
              t[e - 1] = n[e];
            var i = c(
              function (t, e) {
                return function (n) {
                  return e(t(n));
                };
              },
              t,
              function (n) {
                return n;
              }
            );
            return function () {
              for (var n = arguments, t = [], e = 0; e < arguments.length; e++)
                t[e] = n[e];
              return i(r.apply(void 0, t));
            };
          })(
            function (n) {
              return d(n, function (n) {
                return e.validActionType(n, t);
              });
            },
            function (n) {
              return d(n, function (n) {
                return e.validAudienceFilter(n, t);
              });
            },
            function (n) {
              return d(n, function (n) {
                return e.validTriggerPages(t, n);
              });
            }
          )(n);
        });
      };
      return n;
    })();
  n(ln, hn);
  var gn = function jn() {
    var e = this;
    this.messages = [];
    this.listeners = [];
    this.feed = function (n) {
      e.messages.push(n);
      e.dispatch();
    };
    this.consume = function (n) {
      e.listeners.push(n);
      setTimeout(function () {
        return e.dispatch();
      }, 0);
      return function () {
        e.listeners.splice(e.listeners.indexOf(n), 1);
      };
    };
    this.dispatch = function () {
      if (0 < e.listeners.length) {
        l(e.messages, function (t) {
          l(e.listeners, function (n) {
            return n(t);
          });
        });
        e.messages = [];
      }
    };
  };
  var mn = function (n) {
      console.log(JSON.stringify(n));
      if (!(("HttpError" == n.name && 0 === n.code) || 500 < n.code))
        try {
          T.post(
            A.sentryHost + "/api/" + A.sentryProductId + "/store/",
            { sentry_key: A.sentryKey, sentry_version: 7 },
            {
              exception: {
                values: [
                  {
                    type: n.name,
                    value: n.message,
                    stacktrace: {
                      frames: (function t(n) {
                        return d(
                          a(n.stack.split("\n").slice(1), function (n) {
                            var t = n.match(
                                /[\s]*at[\s]?([\S]*)[\s]*[\(]?([\S]*):(\d+):(\d+)/i
                              ),
                              e = t[2],
                              r = t[1];
                            if (!e) {
                              e = r;
                              r = "";
                            }
                            return (
                              (t && {
                                lineno: t[3] ? parseInt(t[3]) : 0,
                                colno: t[4] ? parseInt(t[4]) : 0,
                                filename: e,
                                function: r,
                              }) ||
                              null
                            );
                          }),
                          function (n) {
                            return !!n;
                          }
                        );
                      })(n),
                    },
                  },
                ],
              },
              platform: "javascript",
              request: {
                url: window.location.href,
                headers: { "User-Agent": navigator.userAgent },
              },
              user: {
                ai: S.getAccountId().getOrElse(""),
                cs1: S.getCs1().getOrElse(""),
                u: S.getU().getOrElse(""),
                version: A.version,
              },
              release: A.version,
            }
          );
        } catch (n) {}
    },
    vn = function (n) {
      try {
        n();
      } catch (t) {
        mn(t);
      }
    };
  var yn = new E(),
    wn = function (r) {
      return function (n, t, e) {
        return function () {
          r(n, t);
          e && e();
        };
      };
    },
    En = function (n) {
      n.remove ? n.remove() : n.parentNode && n.parentNode.removeChild(n);
    },
    bn = function (n, t) {
      try {
        window.gio ? window.gio("track", n, t) : window._vds.track(n, t);
      } catch (e) {}
    },
    kn = wn(function (n, t) {
      bn("in_app_message_close", { in_app_message_name: n.name });
      En(t);
    }),
    Mn = wn(function (n, t) {
      En(t);
    }),
    _n = wn(function (n) {
      bn("in_app_message_cmp_click", { in_app_message_name: n.name });
    }),
    xn = wn(function (n) {
      bn("in_app_message_imp", { in_app_message_name: n.name });
    }),
    On = wn(function (n, t) {
      _n(n, t)();
      En(t);
      V.isDebugMode || yn.plusShowTimes(n, 1e3);
    });
  var Sn = new E(),
    An = (function () {
      function n(n, t, e) {
        var r = this;
        this.onReceive = function (n) {
          switch (n.type) {
            case "RENDER_PUSHMESSAGE":
              var t = n.payload,
                e = new r.TemplateBuilder(t);
              r.platform !== t.platform ||
                e.position !== r.location ||
                r.renderMessageQueue.contains(function (n) {
                  return n.id === t.id;
                }) ||
                r.currentId === t.id ||
                r.renderMessageQueue.feed(e);
              break;
            case "CLEAR_ALL":
              r.renderMessageQueue.clear();
              r.currentMessageHandler && r.currentMessageHandler.closeWindow();
            default:
              return;
          }
        };
        this.location = n;
        this.platform = t;
        this.TemplateBuilder = e;
        this.renderMessageQueue = new P(function (n) {
          return r.renderMessage(n);
        });
      }
      n.prototype.renderMessage = function (u) {
        var s = this;
        return new v(function (t, n) {
          s.currentId = u.message.id;
          var e = u.message,
            r = rn({}),
            i = (function o(n, t, e) {
              return {
                clickTargetAndTrack: _n(n, t),
                closeWindow: Mn(n, t, e),
                closeWindowAndTrack: kn(n, t, e),
                trackImp: xn(n, t),
                clickAndTrackAndDisappearPermanently: On(n, t, e),
              };
            })(e, r, function () {
              s.currentId = null;
              t(null);
            });
          s.currentMessageHandler = i;
          u.build(i, r)
            .map(function (n) {
              n.isDefined()
                ? t({ anchor: n.get(), pushMessage: e, handlers: i })
                : t(null);
            })
            .failWith(n);
        }).flatMap(function (t) {
          return t
            ? (V.isDebugMode
                ? v.successful(1)
                : Sn.plusShowTimes(t.pushMessage)
              ).map(function (n) {
                t.handlers.trackImp();
                document.getElementById("boxcontent2").innerHTML = 'h5 next run render'
                s.render(t.anchor);
              })
            : v.successful(null);
        });
      };
      return n;
    })(),
    Cn = (function () {
      function n(n) {
        this.message = n;
        this.id = n.id.toString();
        this.position = sn(n.contentMetadata.config).position;
      }
      n.prototype.className = function () {
        return "gio-modal-anchor-" + this.position;
      };
      n.prototype.renderComponent = function (e, r) {
        var i = this;
        return this.component2Html(e, r)
          .map(function (n) {
            return n.flatMap(function (t) {
              return h.build(e.components).map(function (n) {
                return v
                  .sequence(
                    a(n, function (n) {
                      return i.component2Html(n, r);
                    })
                  )
                  .map(function (n) {
                    return c(
                      function (t, n) {
                        n.foreach(function (n) {
                          return t.appendChild(n);
                        });
                        return t;
                      },
                      n,
                      t
                    );
                  });
              });
            });
          })
          .flatMap(function (n) {
            return (function (n) {
              return n
                .map(function (n) {
                  return n.map(function (n) {
                    return h.build(n);
                  });
                })
                .getOrElse(v.successful(g));
            })(n);
          });
      };
      return n;
    })(),
    Tn = function () {
      return rn({
        id: "_gio_c_modal_mask",
        style: {
          width: "100vw",
          height: "100vh",
          background: "#000",
          position: "absolute",
          top: "0",
          left: "0",
          "-moz-opacity": "0.65",
          opacity: ".65",
          filter: "alpha(opacity=65)",
          "z-index": "2147483645",
          "-moz-user-select": "none",
          "-webkit-user-select": "none",
        },
      });
    },
    Dn = (function () {
      function n(n) {
        Cn.call(this, n);
      }
      n.prototype.build = function (n, r) {
        var i = this;
        return this.renderComponent(this.message.contentMetadata, n).map(
          function (n) {
            return n.map(function (n) {
              var t = rn(
                {
                  className: i.className(),
                  style: {
                    display: "table-cell",
                    "vertical-align": "middle",
                    "text-align": "center",
                    margin: 0,
                    padding: 0,
                  },
                },
                n
              );
              if ("center" === i.position) {
                var e = (function (n) {
                  return rn(
                    {
                      id: "gio-modal-wrapper-outter",
                      style: {
                        width: "100vw",
                        height: "100vh",
                        display: "table",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        "z-index": 2147483646,
                      },
                    },
                    [n, Tn]
                  );
                })(t);
                r.appendChild(e);
              } else r.appendChild(t);
              return r;
            });
          }
        );
      };
      n.prototype.component2Html = function (n, t) {
        var e = n.style;
        switch (n.type) {
          case "img":
            return fn(e, n.config, t);
          case "modal":
            return an(e, n.config);
          case "icon":
            return (function i(t, e, r) {
              return v.successful(function () {
                var n = un[e.name]({
                  style: t,
                  onClick: e.closeable && r.closeWindowAndTrack,
                })();
                return h.build(n);
              });
            })(e, n.config, t);
          default:
            return an(e, n.config);
        }
      };
      return n;
    })();
  n(Cn, Dn);
  var Rn = (function () {
    function n(n) {
      An.call(this, n, "h5", Dn);
    }
    n.prototype.render = function (n) {
      document.getElementById("boxcontent3").innerHTML='h5 render';
      document.body.appendChild(n);
    };
    return n;
  })();
  n(An, Rn);
  !(function Qn(s, c) {
    var a = A.namespace;
    vn(function () {
      v.handleUnResolveError = function (n) {
        mn(f(n) ? new Error(n) : n);
      };
      if (s()) {
        var i = new gn(),
          o = new gn(),
          n = (window[a] = window[a] || {});
        n.isLoaded = !0;
        n.eventMessageQueue = i;
        n.commandQueue = o;
        n.version = A.version;
        n.config = n.config || {};
        !(function r(n) {
          return "boolean" == typeof n;
        })(n.config.cache) || (A.cache = n.config.cache);
        var t = "growingio-sdk",
          e = (window[t] = window[t] || {});
        e.pendingEvents && (n.pendingEvents = e.pendingEvents);
        l((window[t] = n).pendingEvents || [], function (n) {
          return i.feed(n);
        });
        var u = function (n) {
          if (20 < n) console.log("未检测到vds.");
          else if (A.pushMessageApi().isEmpty())
            setTimeout(function () {
              u(n + 1);
            }, 200);
          else {
            if (V.isDebugMode) {
              var t = b(window.location.href),
                e = t.params[pn],
                r = t.params[dn];
              if (!e || !r) return;
              new hn(e, r, i, o).run();
            } else new ln(i, o).run();
            c(o);
          }
        };
        u(0);
      }
    });
  })(
    function qn() {
      if (V.supportStorage) return !0;
      !(function (n) {
        console.log("GrowingIo: " + n);
      })("Not Support LocalStorage.");
      return !1;
    },
    function (n) {
      var e = [new Rn("center")];
      n.consume(function (t) {
        vn(function () {
          l(e, function (n) {
            return n.onReceive(t);
          });
        });
      });
    }
  );
})();
//# sourceMappingURL=h5.latest.js.map
