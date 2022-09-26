!(function (e) {
  var t = {};
  function i(n) {
    if (t[n]) return t[n].exports;
    var o = (t[n] = { i: n, l: !1, exports: {} });
    return e[n].call(o.exports, o, o.exports, i), (o.l = !0), o.exports;
  }
  (i.m = e),
    (i.c = t),
    (i.d = function (e, t, n) {
      i.o(e, t) ||
        Object.defineProperty(e, t, {
          configurable: !1,
          enumerable: !0,
          get: n,
        });
    }),
    (i.r = function (e) {
      Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (i.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return i.d(t, "a", t), t;
    }),
    (i.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (i.p = ""),
    i((i.s = 49));
})([
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    Object.setPrototypeOf || Array;
    Object.assign;
    function n(e, t, i, n) {
      return new (i || (i = Promise))(function (o, s) {
        function r(e) {
          try {
            c(n.next(e));
          } catch (e) {
            s(e);
          }
        }
        function a(e) {
          try {
            c(n.throw(e));
          } catch (e) {
            s(e);
          }
        }
        function c(e) {
          e.done
            ? o(e.value)
            : new i(function (t) {
                t(e.value);
              }).then(r, a);
        }
        c((n = n.apply(e, t || [])).next());
      });
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n {
      static shouldLog() {
        try {
          if ("undefined" == typeof window || void 0 === window.localStorage)
            return !1;
          const e = window.localStorage.getItem("loglevel");
          return !(!e || "trace" !== e.toLowerCase());
        } catch (e) {
          return !1;
        }
      }
      static setLevel(e) {
        if ("undefined" != typeof window && void 0 !== window.localStorage)
          try {
            window.localStorage.setItem("loglevel", e),
              (n.proxyMethodsCreated = void 0),
              n.createProxyMethods();
          } catch (e) {
            return;
          }
      }
      static createProxyMethods() {
        if (void 0 !== n.proxyMethodsCreated) return;
        n.proxyMethodsCreated = !0;
        const e = {
          log: "debug",
          trace: "trace",
          info: "info",
          warn: "warn",
          error: "error",
        };
        for (const t of Object.keys(e)) {
          const i = void 0 !== console[t],
            o = e[t],
            s = i && (n.shouldLog() || "error" === o);
          n[o] = s ? console[t].bind(console) : function () {};
        }
      }
    }
    n.createProxyMethods();
  },
  function (e, t, i) {
    "use strict";
    var n = i(0);
    class o {
      constructor() {
        this._events = {};
      }
      on(e, t) {
        return (
          (this._events[e] = this._events[e] || []),
          this._events[e].push(t),
          this
        );
      }
      once(e, t) {
        const i = this;
        function n() {
          i.off(e, n), t.apply(this, arguments);
        }
        return (n.listener = t), this.on(e, n), this;
      }
      off(e, t) {
        const i = this._events[e];
        if (void 0 !== i) {
          for (let e = 0; e < i.length; e += 1)
            if (i[e] === t || i[e].listener === t) {
              i.splice(e, 1);
              break;
            }
          0 === i.length && this.removeAllListeners(e);
        }
        return this;
      }
      removeAllListeners(e) {
        try {
          e ? delete this._events[e] : (this._events = {});
        } catch (e) {}
        return this;
      }
      listeners(e) {
        try {
          return this._events[e];
        } catch (e) {
          return;
        }
      }
      numberOfListeners(e) {
        const t = this.listeners(e);
        return t ? t.length : 0;
      }
      emit(...e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = e.shift();
          let i = this._events[t];
          if (void 0 !== i) {
            const t = (i = i.slice(0)).length;
            for (let n = 0; n < t; n += 1) yield i[n].apply(this, e);
          }
          return this;
        });
      }
    }
    var s = i(1),
      r = i(3);
    const a = 3;
    class c {
      constructor(e) {
        (this.databaseName = e), (this.emitter = new o());
      }
      open(e) {
        return new Promise((t) => {
          let i = void 0;
          try {
            i = indexedDB.open(e, a);
          } catch (e) {}
          if (!i) return null;
          (i.onerror = this.onDatabaseOpenError),
            (i.onblocked = this.onDatabaseOpenBlocked),
            (i.onupgradeneeded = this.onDatabaseUpgradeNeeded),
            (i.onsuccess = () => {
              (this.database = i.result),
                (this.database.onerror = this.onDatabaseError),
                (this.database.onversionchange = this.onDatabaseVersionChange),
                t(this.database);
            });
        });
      }
      ensureDatabaseOpen() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return (
            this.openLock || (this.openLock = this.open(this.databaseName)),
            yield this.openLock
          );
        });
      }
      onDatabaseOpenError(e) {
        e.preventDefault();
        const t = e.target.error;
        r.b.contains(
          t.message,
          "The operation failed for reasons unrelated to the database itself and not covered by any other error code"
        ) ||
        r.b.contains(
          t.message,
          "A mutation operation was attempted on a database that did not allow mutations"
        )
          ? s.a.warn(
              "OneSignal: IndexedDb web storage is not available on this origin since this profile's IndexedDb schema has been upgraded in a newer version of Firefox. See: https://bugzilla.mozilla.org/show_bug.cgi?id=1236557#c6"
            )
          : s.a.warn("OneSignal: Fatal error opening IndexedDb database:", t);
      }
      onDatabaseError(e) {
        s.a.debug("IndexedDb: Generic database error", e.target.errorCode);
      }
      onDatabaseOpenBlocked() {
        s.a.debug("IndexedDb: Blocked event");
      }
      onDatabaseVersionChange(e) {
        s.a.debug("IndexedDb: versionchange event");
      }
      onDatabaseUpgradeNeeded(e) {
        s.a.debug(
          "IndexedDb: Database is being rebuilt or upgraded (upgradeneeded event)."
        );
        const t = e.target.result;
        e.oldVersion < 1 &&
          (t.createObjectStore("Ids", { keyPath: "type" }),
          t.createObjectStore("NotificationOpened", { keyPath: "url" }),
          t.createObjectStore("Options", { keyPath: "key" })),
          e.oldVersion < 2 &&
            (t.createObjectStore("Sessions", { keyPath: "sessionKey" }),
            t.createObjectStore("NotificationReceived", {
              keyPath: "notificationId",
            }),
            t.createObjectStore("NotificationClicked", {
              keyPath: "notificationId",
            })),
          e.oldVersion < 3 &&
            t.createObjectStore("SentUniqueOutcome", {
              keyPath: "outcomeName",
            }),
          "undefined" != typeof OneSignal && (OneSignal._isNewVisitor = !0);
      }
      get(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = yield this.ensureDatabaseOpen();
          return t
            ? yield new Promise((n, o) => {
                const s = i.transaction(e).objectStore(e).get(t);
                (s.onsuccess = () => {
                  n(s.result);
                }),
                  (s.onerror = () => {
                    o(s.error);
                  });
              })
            : yield new Promise((t, n) => {
                const o = {},
                  s = i.transaction(e).objectStore(e).openCursor();
                (s.onsuccess = (e) => {
                  const i = e.target.result;
                  if (i) {
                    const e = i.key;
                    (o[e] = i.value), i.continue();
                  } else t(o);
                }),
                  (s.onerror = () => {
                    n(s.error);
                  });
              });
        });
      }
      getAll(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield new Promise((t, i) =>
            Object(n.a)(this, void 0, void 0, function* () {
              const n = (yield this.ensureDatabaseOpen())
                  .transaction(e)
                  .objectStore(e)
                  .openCursor(),
                o = [];
              (n.onsuccess = (e) => {
                const i = e.target.result;
                i ? (o.push(i.value), i.continue()) : t(o);
              }),
                (n.onerror = () => {
                  i(n.error);
                });
            })
          );
        });
      }
      put(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return (
            yield this.ensureDatabaseOpen(),
            yield new Promise((i, n) => {
              try {
                const o = this.database
                  .transaction([e], "readwrite")
                  .objectStore(e)
                  .put(t);
                (o.onsuccess = () => {
                  i(t);
                }),
                  (o.onerror = (e) => {
                    s.a.error("Database PUT Transaction Error:", e), n(e);
                  });
              } catch (e) {
                s.a.error("Database PUT Error:", e), n(e);
              }
            })
          );
        });
      }
      remove(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = yield this.ensureDatabaseOpen();
          return new Promise((n, o) => {
            try {
              const r = i.transaction([e], "readwrite").objectStore(e),
                a = t ? r.delete(t) : r.clear();
              (a.onsuccess = () => {
                n(t);
              }),
                (a.onerror = (e) => {
                  s.a.error("Database REMOVE Transaction Error:", e), o(e);
                });
            } catch (e) {
              s.a.error("Database REMOVE Error:", e), o(e);
            }
          });
        });
      }
    }
    class d {}
    class u {}
    class l {
      serialize() {
        return {
          deviceId: this.deviceId,
          subscriptionToken: this.subscriptionToken,
          optedOut: this.optedOut,
          createdAt: this.createdAt,
          expirationTime: this.expirationTime,
        };
      }
      static deserialize(e) {
        const t = new l();
        return (
          (t.deviceId = e.deviceId),
          (t.subscriptionToken = e.subscriptionToken),
          (t.optedOut = e.optedOut),
          (t.createdAt = e.createdAt),
          (t.expirationTime = e.expirationTime),
          t
        );
      }
    }
    var p,
      g,
      f = i(38),
      h = i(5),
      b = i(35),
      v = i(18),
      m = i(6),
      S = i(8),
      y = i(34);
    i.d(t, "a", function () {
      return O;
    }),
      ((g = p || (p = {}))[(g.SET = 0)] = "SET");
    class O {
      constructor(e) {
        (this.databaseName = e),
          (this.emitter = new o()),
          (this.database = new c(this.databaseName));
      }
      static resetInstance() {
        O.databaseInstance = null;
      }
      static get singletonInstance() {
        return (
          O.databaseInstanceName ||
            (O.databaseInstanceName = "ONE_SIGNAL_SDK_DB"),
          O.databaseInstance ||
            (O.databaseInstance = new O(O.databaseInstanceName)),
          O.databaseInstance
        );
      }
      static applyDbResultFilter(e, t, i) {
        switch (e) {
          case "Options":
            return i && t ? i.value : i && !t ? i : null;
          case "Ids":
            return i && t ? i.id : i && !t ? i : null;
          case "NotificationOpened":
            return i && t
              ? { data: i.data, timestamp: i.timestamp }
              : i && !t
              ? i
              : null;
          default:
            return i || null;
        }
      }
      shouldUsePostmam() {
        return (
          m.a.getWindowEnv() !== h.a.ServiceWorker &&
          S.b.isUsingSubscriptionWorkaround() &&
          m.a.getTestEnv() === f.a.None
        );
      }
      get(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (this.shouldUsePostmam())
            return yield new Promise((i) =>
              Object(n.a)(this, void 0, void 0, function* () {
                OneSignal.proxyFrameHost.message(
                  OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_GET,
                  [{ table: e, key: t }],
                  (e) => {
                    const t = e.data[0];
                    i(t);
                  }
                );
              })
            );
          {
            const i = yield this.database.get(e, t);
            return O.applyDbResultFilter(e, t, i);
          }
        });
      }
      getAll(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (this.shouldUsePostmam())
            return yield new Promise((t) =>
              Object(n.a)(this, void 0, void 0, function* () {
                OneSignal.proxyFrameHost.message(
                  OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_GET_ALL,
                  { table: e },
                  (e) => {
                    const i = e.data;
                    t(i);
                  }
                );
              })
            );
          return yield this.database.getAll(e);
        });
      }
      put(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield new Promise((i, o) =>
            Object(n.a)(this, void 0, void 0, function* () {
              m.a.getWindowEnv() !== h.a.ServiceWorker &&
              S.b.isUsingSubscriptionWorkaround() &&
              m.a.getTestEnv() === f.a.None
                ? OneSignal.proxyFrameHost.message(
                    OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_PUT,
                    [{ table: e, keypath: t }],
                    (n) => {
                      n.data ===
                      OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE
                        ? i()
                        : o(
                            `(Database) Attempted remote IndexedDB put(${e}, ${t}),` +
                              "but did not get success response."
                          );
                    }
                  )
                : (yield this.database.put(e, t), i());
            })
          ),
            this.emitter.emit(O.EVENTS.SET, t);
        });
      }
      remove(e, t) {
        return m.a.getWindowEnv() !== h.a.ServiceWorker &&
          S.b.isUsingSubscriptionWorkaround() &&
          m.a.getTestEnv() === f.a.None
          ? new Promise((i, n) => {
              OneSignal.proxyFrameHost.message(
                OneSignal.POSTMAM_COMMANDS.REMOTE_DATABASE_REMOVE,
                [{ table: e, keypath: t }],
                (o) => {
                  o.data ===
                  OneSignal.POSTMAM_COMMANDS.REMOTE_OPERATION_COMPLETE
                    ? i()
                    : n(
                        `(Database) Attempted remote IndexedDB remove(${e}, ${t}),` +
                          "but did not get success response."
                      );
                }
              );
            })
          : this.database.remove(e, t);
      }
      getAppConfig() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = {},
            t = yield this.get("Ids", "appId");
          return (
            (e.appId = t),
            (e.subdomain = yield this.get("Options", "subdomain")),
            (e.vapidPublicKey = yield this.get("Options", "vapidPublicKey")),
            e
          );
        });
      }
      getExternalUserId() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("Ids", "externalUserId");
        });
      }
      getExternalUserIdAuthHash() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("Ids", "externalUserIdAuthHash");
        });
      }
      setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = r.b.getValueOrDefault(e, ""),
            n = r.b.getValueOrDefault(t, "");
          "" === i
            ? yield this.remove("Ids", "externalUserId")
            : yield this.put("Ids", { type: "externalUserId", id: i }),
            "" === n
              ? yield this.remove("Ids", "externalUserIdAuthHash")
              : yield this.put("Ids", {
                  type: "externalUserIdAuthHash",
                  id: n,
                });
        });
      }
      setAppConfig(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          e.appId && (yield this.put("Ids", { type: "appId", id: e.appId })),
            e.subdomain &&
              (yield this.put("Options", {
                key: "subdomain",
                value: e.subdomain,
              })),
            !0 === e.httpUseOneSignalCom
              ? yield this.put("Options", {
                  key: "httpUseOneSignalCom",
                  value: !0,
                })
              : !1 === e.httpUseOneSignalCom &&
                (yield this.put("Options", {
                  key: "httpUseOneSignalCom",
                  value: !1,
                })),
            e.vapidPublicKey &&
              (yield this.put("Options", {
                key: "vapidPublicKey",
                value: e.vapidPublicKey,
              }));
        });
      }
      getAppState() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = new d();
          return (
            (e.defaultNotificationUrl = yield this.get(
              "Options",
              "defaultUrl"
            )),
            (e.defaultNotificationTitle = yield this.get(
              "Options",
              "defaultTitle"
            )),
            (e.lastKnownPushEnabled = yield this.get(
              "Options",
              "isPushEnabled"
            )),
            (e.clickedNotifications = yield this.get("NotificationOpened")),
            e
          );
        });
      }
      setAppState(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (
            (e.defaultNotificationUrl &&
              (yield this.put("Options", {
                key: "defaultUrl",
                value: e.defaultNotificationUrl,
              })),
            (e.defaultNotificationTitle || "" === e.defaultNotificationTitle) &&
              (yield this.put("Options", {
                key: "defaultTitle",
                value: e.defaultNotificationTitle,
              })),
            null != e.lastKnownPushEnabled &&
              (yield this.put("Options", {
                key: "isPushEnabled",
                value: e.lastKnownPushEnabled,
              })),
            e.clickedNotifications)
          ) {
            const t = Object.keys(e.clickedNotifications);
            for (const i of t) {
              const t = e.clickedNotifications[i];
              t
                ? yield this.put("NotificationOpened", {
                    url: i,
                    data: t.data,
                    timestamp: t.timestamp,
                  })
                : null === t && (yield this.remove("NotificationOpened", i));
            }
          }
        });
      }
      getServiceWorkerState() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = new u();
          return (
            (e.workerVersion = yield this.get(
              "Ids",
              "WORKER1_ONE_SIGNAL_SW_VERSION"
            )),
            e
          );
        });
      }
      setServiceWorkerState(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          e.workerVersion &&
            (yield this.put("Ids", {
              type: "WORKER1_ONE_SIGNAL_SW_VERSION",
              id: e.workerVersion,
            }));
        });
      }
      getSubscription() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = new l();
          (e.deviceId = yield this.get("Ids", "userId")),
            (e.subscriptionToken = yield this.get("Ids", "registrationId"));
          const t = yield this.get("Options", "optedOut"),
            i = yield this.get("Options", "subscription"),
            n = yield this.get("Options", "subscriptionCreatedAt"),
            o = yield this.get("Options", "subscriptionExpirationTime");
          return (
            (e.optedOut = null != t ? t : null != i && !i),
            (e.createdAt = n),
            (e.expirationTime = o),
            e
          );
        });
      }
      setDeviceId(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.put("Ids", { type: "userId", id: e });
        });
      }
      setSubscription(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          e.deviceId && (yield this.setDeviceId(e.deviceId)),
            void 0 !== e.subscriptionToken &&
              (yield this.put("Ids", {
                type: "registrationId",
                id: e.subscriptionToken,
              })),
            null != e.optedOut &&
              (yield this.put("Options", {
                key: "optedOut",
                value: e.optedOut,
              })),
            null != e.createdAt &&
              (yield this.put("Options", {
                key: "subscriptionCreatedAt",
                value: e.createdAt,
              })),
            null != e.expirationTime
              ? yield this.put("Options", {
                  key: "subscriptionExpirationTime",
                  value: e.expirationTime,
                })
              : yield this.remove("Options", "subscriptionExpirationTime");
        });
      }
      getEmailProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield this.get("Ids", "emailProfile");
          return e ? b.a.deserialize(e) : new b.a();
        });
      }
      setEmailProfile(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          e &&
            (yield this.put("Ids", {
              type: "emailProfile",
              id: e.serialize(),
            }));
        });
      }
      getSMSProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield this.get("Ids", "smsProfile");
          return e ? y.a.deserialize(e) : new y.a();
        });
      }
      setSMSProfile(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          e &&
            (yield this.put("Ids", { type: "smsProfile", id: e.serialize() }));
        });
      }
      setProvideUserConsent(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.put("Options", { key: "userConsent", value: e });
        });
      }
      getProvideUserConsent() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("Options", "userConsent");
        });
      }
      getSession(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("Sessions", e);
        });
      }
      setSession(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.put("Sessions", e);
        });
      }
      removeSession(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.remove("Sessions", e);
        });
      }
      getLastNotificationClicked(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          let t = [];
          try {
            t = yield this.getAll("NotificationClicked");
          } catch (e) {
            s.a.error("Database.getNotificationClickedByUrl", e);
          }
          return t.find((t) => t.appId === e) || null;
        });
      }
      getNotificationClickedByUrl(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          let i = [];
          try {
            i = yield this.getAll("NotificationClicked");
          } catch (e) {
            s.a.error("Database.getNotificationClickedByUrl", e);
          }
          return (
            i.find(
              (i) =>
                i.appId === t && new URL(e).origin === new URL(i.url).origin
            ) || null
          );
        });
      }
      getNotificationClickedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("NotificationClicked", e);
        });
      }
      getNotificationReceivedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield this.get("NotificationReceived", e);
        });
      }
      removeNotificationClickedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.remove("NotificationClicked", e);
        });
      }
      removeAllNotificationClicked() {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.remove("NotificationClicked");
        });
      }
      resetSentUniqueOutcomes() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = (yield this.getAll("SentUniqueOutcome")).map(
            (e) => ((e.sentDuringSession = null), O.put("SentUniqueOutcome", e))
          );
          yield Promise.all(e);
        });
      }
      static rebuild() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return Promise.all([
            O.singletonInstance.remove("Ids"),
            O.singletonInstance.remove("NotificationOpened"),
            O.singletonInstance.remove("Options"),
            O.singletonInstance.remove("NotificationReceived"),
            O.singletonInstance.remove("NotificationClicked"),
            O.singletonInstance.remove("SentUniqueOutcome"),
          ]);
        });
      }
      static on(...e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return O.singletonInstance.emitter.on.apply(
            O.singletonInstance.emitter,
            e
          );
        });
      }
      static getCurrentSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getSession(v.a);
        });
      }
      static upsertSession(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield O.singletonInstance.setSession(e);
        });
      }
      static cleanupCurrentSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield O.singletonInstance.removeSession(v.a);
        });
      }
      static setEmailProfile(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setEmailProfile(e);
        });
      }
      static getEmailProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getEmailProfile();
        });
      }
      static setSMSProfile(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setSMSProfile(e);
        });
      }
      static getSMSProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getSMSProfile();
        });
      }
      static setSubscription(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setSubscription(e);
        });
      }
      static getSubscription() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getSubscription();
        });
      }
      static setProvideUserConsent(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setProvideUserConsent(e);
        });
      }
      static getProvideUserConsent() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getProvideUserConsent();
        });
      }
      static setServiceWorkerState(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setServiceWorkerState(e);
        });
      }
      static getServiceWorkerState() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getServiceWorkerState();
        });
      }
      static setAppState(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setAppState(e);
        });
      }
      static getAppState() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getAppState();
        });
      }
      static setAppConfig(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.setAppConfig(e);
        });
      }
      static getAppConfig() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getAppConfig();
        });
      }
      static getExternalUserId() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getExternalUserId();
        });
      }
      static getExternalUserIdAuthHash() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getExternalUserIdAuthHash();
        });
      }
      static getLastNotificationClicked(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getLastNotificationClicked(e);
        });
      }
      static removeNotificationClickedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.removeNotificationClickedById(e);
        });
      }
      static removeAllNotificationClicked() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.removeAllNotificationClicked();
        });
      }
      static resetSentUniqueOutcomes() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.resetSentUniqueOutcomes();
        });
      }
      static getNotificationClickedByUrl(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getNotificationClickedByUrl(e, t);
        });
      }
      static getNotificationClickedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getNotificationClickedById(e);
        });
      }
      static getNotificationReceivedById(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getNotificationReceivedById(e);
        });
      }
      static setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield O.singletonInstance.setExternalUserId(e, t);
        });
      }
      static setDeviceId(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield O.singletonInstance.setDeviceId(e);
        });
      }
      static remove(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.remove(e, t);
        });
      }
      static put(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.put(e, t);
        });
      }
      static get(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.get(e, t);
        });
      }
      static getAll(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield O.singletonInstance.getAll(e);
        });
      }
    }
    O.EVENTS = p;
  },
  function (e, t, i) {
    "use strict";
    var n = i(0),
      o = i(14);
    class s extends o.a {
      constructor(e = "The asynchronous operation has timed out.") {
        super(e), (this.message = e), Object.setPrototypeOf(this, s.prototype);
      }
    }
    var r = i(27);
    i.d(t, "a", function () {
      return a;
    });
    class a {
      static contains(e, t) {
        return !!e && -1 !== e.indexOf(t);
      }
      static getConsoleStyle(e) {
        return "code" == e
          ? 'padding: 0 1px 1px 5px;border: 1px solid #ddd;border-radius: 3px;font-family: Monaco,"DejaVu Sans Mono","Courier New",monospace;color: #444;'
          : "bold" == e
          ? "font-weight: 600;color: rgb(51, 51, 51);"
          : "alert" == e
          ? "font-weight: 600;color: red;"
          : "event" == e
          ? "color: green;"
          : "postmessage" == e
          ? "color: orange;"
          : "serviceworkermessage" == e
          ? "color: purple;"
          : "";
      }
      static trimUndefined(e) {
        for (const t in e)
          e.hasOwnProperty(t) && void 0 === e[t] && delete e[t];
        return e;
      }
      static capitalize(e) {
        return e.charAt(0).toUpperCase() + e.slice(1);
      }
      static isNullOrUndefined(e) {
        return void 0 === e || null === e;
      }
      static valueOrDefault(e, t) {
        return void 0 === e || null === e ? t : e;
      }
      static stringify(e) {
        return JSON.stringify(
          e,
          (e, t) => ("function" == typeof t ? "[Function]" : t),
          4
        );
      }
      static encodeHashAsUriComponent(e) {
        let t = "";
        const i = Object.keys(e);
        for (const n of i) {
          const i = e[n];
          t += `${encodeURIComponent(n)}=${encodeURIComponent(i)}`;
        }
        return t;
      }
      static timeoutPromise(e, t) {
        const i = new Promise((e, i) => {
          setTimeout(() => {
            i(new s());
          }, t);
        });
        return Promise.race([e, i]);
      }
      static getValueOrDefault(e, t) {
        return void 0 !== e && null !== e ? e : t;
      }
      static padStart(e, t, i) {
        let n = e;
        for (; n.length < t; ) n = i + n;
        return n;
      }
      static parseVersionString(e) {
        const t = e.toString().split("."),
          i = a.padStart(t[0], 2, "0");
        let n;
        return (
          (n = t[1] ? a.padStart(t[1], 2, "0") : "00"), Number(`${i}.${n}`)
        );
      }
      static lastParts(e, t, i) {
        const n = e.split(t),
          o = Math.max(n.length - i, 0);
        return n.slice(o).join(t);
      }
      static enforceAppId(e) {
        if (!e) throw new Error("App id cannot be empty");
      }
      static enforcePlayerId(e) {
        if (!e) throw new Error("Player id cannot be empty");
      }
      static enforceAppIdAndPlayerId(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          a.enforceAppId(e), a.enforcePlayerId(t);
          try {
            return yield i();
          } catch (e) {
            throw e &&
              Array.isArray(e.errors) &&
              e.errors.length > 0 &&
              a.contains(e.errors[0], "app_id not found")
              ? new r.a(r.b.MissingAppId)
              : e;
          }
        });
      }
      static sortArrayOfObjects(e, t, i = !1, n = !0) {
        const o = n ? e : e.slice();
        return (
          o.sort((e, n) => {
            const o = t(e),
              s = t(n);
            return o > s ? (i ? -1 : 1) : o < s ? (i ? 1 : -1) : 0;
          }),
          o
        );
      }
    }
    t.b = a;
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n {
      static debug(...e) {
        self.shouldLog && console.debug(...e);
      }
      static trace(...e) {
        self.shouldLog && console.trace(...e);
      }
      static info(...e) {
        self.shouldLog && console.info(...e);
      }
      static warn(...e) {
        self.shouldLog && console.warn(...e);
      }
      static error(...e) {
        self.shouldLog && console.error(...e);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e.ServiceWorker = "ServiceWorker"),
          (e.Host = "Host"),
          (e.OneSignalSubscriptionPopup = "Popup"),
          (e.OneSignalSubscriptionModal = "Modal"),
          (e.OneSignalProxyFrame = "ProxyFrame"),
          (e.CustomIframe = "CustomFrame"),
          (e.Unknown = "Unknown");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    var n,
      o = i(0);
    !(function (e) {
      (e.Development = "Development"),
        (e.Staging = "Staging"),
        (e.Production = "Production");
    })(n || (n = {}));
    var s = i(38),
      r = i(5),
      InvalidArgumentError = i(16),
      a = i(17),
      c = i(9),
      d = i(8);
    i.d(t, "a", function () {
      return f;
    });
    const u = 4e3,
      l = 3001,
      p = 18080,
      g = ["outcomes", "on_focus"];
    class f {
      static getBuildEnv() {
        return n.Production;
      }
      static getApiEnv() {
        return n.Production;
      }
      static getIntegration(e) {
        return Object(o.a)(this, void 0, void 0, function* () {
          if (c.a.isSafari()) return a.a.Secure;
          const t = window === window.top,
            i = "https:" === window.location.protocol;
          if (void 0 === e) {
            if (
              "undefined" == typeof OneSignal ||
              !OneSignal.context ||
              !OneSignal.context.appConfig
            )
              throw new InvalidArgumentError.a(
                "usingProxyOrigin",
                InvalidArgumentError.b.Empty
              );
            e = !!OneSignal.context.appConfig.subdomain;
          }
          if (t)
            return i
              ? e
                ? a.a.SecureProxy
                : a.a.Secure
              : !d.b.isLocalhostAllowedAsSecureOrigin() ||
                ("localhost" !== location.hostname &&
                  "127.0.0.1" !== location.hostname)
              ? a.a.InsecureProxy
              : a.a.Secure;
          if (i) {
            return (yield f.isFrameContextInsecure())
              ? a.a.InsecureProxy
              : e
              ? a.a.SecureProxy
              : a.a.Secure;
          }
          return a.a.InsecureProxy;
        });
      }
      static isFrameContextInsecure() {
        return Object(o.a)(this, void 0, void 0, function* () {
          if (
            window === window.top ||
            !("serviceWorker" in navigator) ||
            void 0 === navigator.serviceWorker.getRegistration
          )
            return !1;
          return !(yield OneSignal.context.serviceWorkerManager.getRegistration());
        });
      }
      static isInsecureOrigin() {
        return "http:" === window.location.protocol;
      }
      static getOrigin() {
        return c.a.isBrowser()
          ? window.location.origin
          : "undefined" != typeof self &&
            "undefined" != typeof ServiceWorkerGlobalScope
          ? self.location.origin
          : "Unknown";
      }
      static getWindowEnv() {
        return "undefined" == typeof window
          ? "undefined" != typeof self &&
            "undefined" != typeof ServiceWorkerGlobalScope
            ? r.a.ServiceWorker
            : r.a.Unknown
          : window === window.top
          ? -1 !== location.href.indexOf("initOneSignal") ||
            ("/subscribe" === location.pathname &&
              "" === location.search &&
              (location.hostname.endsWith(".onesignal.com") ||
                location.hostname.endsWith(".os.tc") ||
                (-1 !== location.hostname.indexOf(".localhost") &&
                  f.getBuildEnv() === n.Development)))
            ? r.a.OneSignalSubscriptionPopup
            : r.a.Host
          : "/webPushIframe" === location.pathname
          ? r.a.OneSignalProxyFrame
          : "/webPushModal" === location.pathname
          ? r.a.OneSignalSubscriptionModal
          : r.a.CustomIframe;
      }
      static getTestEnv() {
        return s.a.None;
      }
      static getBuildEnvPrefix(e = f.getBuildEnv()) {
        switch (e) {
          case n.Development:
            return "Dev-";
          case n.Staging:
            return "Staging-";
          case n.Production:
            return "";
          default:
            throw new InvalidArgumentError.a(
              "buildEnv",
              InvalidArgumentError.b.EnumOutOfRange
            );
        }
      }
      static getOneSignalApiUrl(e = f.getApiEnv(), t) {
        switch (e) {
          case n.Development:
            return f.isTurbineEndpoint(t)
              ? new URL(`https://localhost:${p}/api/v1`)
              : new URL(`https://localhost:${l}/api/v1`);
          case n.Staging:
            return new URL("https://localhost/api/v1");
          case n.Production:
            return new URL("https://onesignal.com/api/v1");
          default:
            throw new InvalidArgumentError.a(
              "buildEnv",
              InvalidArgumentError.b.EnumOutOfRange
            );
        }
      }
      static getOneSignalResourceUrlPath(e = f.getBuildEnv()) {
        let t;
        const i = u;
        switch (e) {
          case n.Development:
            t = `http://localhost:${i}`;
            break;
          case n.Staging:
            t = "https://localhost";
            break;
          case n.Production:
            t = "https://onesignal.com";
            break;
          default:
            throw new InvalidArgumentError.a(
              "buildEnv",
              InvalidArgumentError.b.EnumOutOfRange
            );
        }
        return new URL(`${t}/sdks`);
      }
      static getOneSignalCssFileName(e = f.getBuildEnv()) {
        switch (e) {
          case n.Development:
            return "Dev-OneSignalSDKStyles.css";
          case n.Staging:
            return "Staging-OneSignalSDKStyles.css";
          case n.Production:
            return "OneSignalSDKStyles.css";
          default:
            throw new InvalidArgumentError.a(
              "buildEnv",
              InvalidArgumentError.b.EnumOutOfRange
            );
        }
      }
      static isTurbineEndpoint(e) {
        return !!e && g.some((t) => e.indexOf(t) > -1);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return n;
    }),
      i.d(t, "a", function () {
        return p;
      });
    var n,
      o = i(0),
      s = i(16),
      r = i(6),
      a = i(5),
      c = i(9),
      d = i(1),
      u = i(37);
    !(function (e) {
      (e.WorkerVersion = "GetWorkerVersion"),
        (e.Subscribe = "Subscribe"),
        (e.SubscribeNew = "SubscribeNew"),
        (e.AmpSubscriptionState = "amp-web-push-subscription-state"),
        (e.AmpSubscribe = "amp-web-push-subscribe"),
        (e.AmpUnsubscribe = "amp-web-push-unsubscribe"),
        (e.NotificationDisplayed = "notification.displayed"),
        (e.NotificationClicked = "notification.clicked"),
        (e.NotificationDismissed = "notification.dismissed"),
        (e.RedirectPage = "command.redirect"),
        (e.SessionUpsert = "os.session.upsert"),
        (e.SessionDeactivate = "os.session.deactivate"),
        (e.AreYouVisible = "os.page_focused_request"),
        (e.AreYouVisibleResponse = "os.page_focused_response"),
        (e.SetLogging = "os.set_sw_logging");
    })(n || (n = {}));
    class l {
      constructor() {
        this.replies = {};
      }
      addListener(e, t, i) {
        const n = { callback: t, onceListenerOnly: i },
          o = this.replies[e.toString()];
        o ? o.push(n) : (this.replies[e.toString()] = [n]);
      }
      findListenersForMessage(e) {
        return this.replies[e.toString()] || [];
      }
      deleteListenerRecords(e) {
        this.replies[e.toString()] = null;
      }
      deleteAllListenerRecords() {
        this.replies = {};
      }
      deleteListenerRecord(e, t) {
        const i = this.replies[e.toString()];
        if (null != i)
          for (let e = i.length - 1; e >= 0; e--) {
            i[e] === t && i.splice(e, 1);
          }
      }
    }
    class p {
      constructor(e, t = new l()) {
        (this.context = e), (this.replies = t);
      }
      broadcast(e, t) {
        return Object(o.a)(this, void 0, void 0, function* () {
          if (r.a.getWindowEnv() !== a.a.ServiceWorker) return;
          const i = yield self.clients.matchAll({
            type: "window",
            includeUncontrolled: !0,
          });
          for (const n of i)
            d.a.debug(
              `[Worker Messenger] [SW -> Page] Broadcasting '${e.toString()}' to window client ${
                n.url
              }.`
            ),
              n.postMessage({ command: e, payload: t });
        });
      }
      unicast(e, t, i) {
        return Object(o.a)(this, void 0, void 0, function* () {
          if (r.a.getWindowEnv() === a.a.ServiceWorker) {
            if (!i) throw new s.a("windowClient", s.b.Empty);
            d.a.debug(
              `[Worker Messenger] [SW -> Page] Unicasting '${e.toString()}' to window client ${
                i.url
              }.`
            ),
              i.postMessage({ command: e, payload: t });
          } else d.a.debug(`[Worker Messenger] [Page -> SW] Unicasting '${e.toString()}' to service worker.`), this.directPostMessageToSW(e, t);
        });
      }
      directPostMessageToSW(e, t) {
        return Object(o.a)(this, void 0, void 0, function* () {
          d.a.debug(
            `[Worker Messenger] [Page -> SW] Direct command '${e.toString()}' to service worker.`
          );
          const i = yield this.context.serviceWorkerManager.getRegistration();
          if (!i)
            return void d.a.error(
              "`[Worker Messenger] [Page -> SW] Could not get ServiceWorkerRegistration to postMessage!"
            );
          const n = u.a.getAvailableServiceWorker(i);
          n
            ? n.postMessage({ command: e, payload: t })
            : d.a.error(
                "`[Worker Messenger] [Page -> SW] Could not get ServiceWorker to postMessage!"
              );
        });
      }
      listen() {
        return Object(o.a)(this, void 0, void 0, function* () {
          if (!c.a.supportsServiceWorkers()) return;
          r.a.getWindowEnv() === a.a.ServiceWorker
            ? (self.addEventListener(
                "message",
                this.onWorkerMessageReceivedFromPage.bind(this)
              ),
              d.a.debug(
                "[Worker Messenger] Service worker is now listening for messages."
              ))
            : yield this.listenForPage();
        });
      }
      listenForPage() {
        return Object(o.a)(this, void 0, void 0, function* () {
          navigator.serviceWorker.addEventListener(
            "message",
            this.onPageMessageReceivedFromServiceWorker.bind(this)
          ),
            d.a.debug(
              `(${location.origin}) [Worker Messenger] Page is now listening for messages.`
            );
        });
      }
      onWorkerMessageReceivedFromPage(e) {
        const t = e.data;
        if (!t || !t.command) return;
        const i = this.replies.findListenersForMessage(t.command),
          n = [],
          o = [];
        d.a.debug(
          "[Worker Messenger] Service worker received message:",
          e.data
        );
        for (const e of i) e.onceListenerOnly && n.push(e), o.push(e);
        for (let e = n.length - 1; e >= 0; e--) {
          const i = n[e];
          this.replies.deleteListenerRecord(t.command, i);
        }
        for (const e of o) e.callback.apply(null, [t.payload]);
      }
      onPageMessageReceivedFromServiceWorker(e) {
        const t = e.data;
        if (!t || !t.command) return;
        const i = this.replies.findListenersForMessage(t.command),
          n = [],
          o = [];
        d.a.debug("[Worker Messenger] Page received message:", e.data);
        for (const e of i) e.onceListenerOnly && n.push(e), o.push(e);
        for (let e = n.length - 1; e >= 0; e--) {
          const i = n[e];
          this.replies.deleteListenerRecord(t.command, i);
        }
        for (const e of o) e.callback.apply(null, [t.payload]);
      }
      on(e, t) {
        this.replies.addListener(e, t, !1);
      }
      once(e, t) {
        this.replies.addListener(e, t, !0);
      }
      off(e) {
        e
          ? this.replies.deleteListenerRecords(e)
          : this.replies.deleteAllListenerRecords();
      }
    }
  },
  function (e, t, i) {
    "use strict";
    (function (e) {
      i.d(t, "a", function () {
        return u;
      });
      var n = i(11),
        o = i.n(n),
        s = i(6),
        r = i(9),
        a = i(5),
        c = i(1),
        d = i(3);
      class u {
        static getBaseUrl() {
          return location.origin;
        }
        static isLocalhostAllowedAsSecureOrigin() {
          return (
            OneSignal.config &&
            OneSignal.config.userConfig &&
            !0 === OneSignal.config.userConfig.allowLocalhostAsSecureOrigin
          );
        }
        static isUsingSubscriptionWorkaround() {
          const e = s.a.getWindowEnv();
          if (!OneSignal.config)
            throw new Error(
              `(${e.toString()}) isUsingSubscriptionWorkaround() cannot be called until OneSignal.config exists.`
            );
          if (o.a.safari) return !1;
          const t = this.isLocalhostAllowedAsSecureOrigin();
          return u.internalIsUsingSubscriptionWorkaround(
            OneSignal.config.subdomain,
            t
          );
        }
        static internalIsUsingSubscriptionWorkaround(e, t) {
          if (o.a.safari) return !1;
          if (
            !0 === t &&
            ("localhost" === location.hostname ||
              "127.0.0.1" === location.hostname)
          )
            return !1;
          const i = s.a.getWindowEnv();
          return !(
            (i !== a.a.Host && i !== a.a.CustomIframe) ||
            (!e && "http:" !== location.protocol)
          );
        }
        static redetectBrowserUserAgent() {
          return "" === o.a.name && "" === o.a.version
            ? o.a._detect(navigator.userAgent)
            : o.a;
        }
        static isValidUuid(e) {
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
            e
          );
        }
        static getRandomUuid() {
          let t = "";
          const i =
            "undefined" == typeof window
              ? e.crypto
              : window.crypto || window.msCrypto;
          return (t = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            i
              ? function (e) {
                  var t = i.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
                  return ("x" == e ? t : (3 & t) | 8).toString(16);
                }
              : function (e) {
                  var t = (16 * Math.random()) | 0;
                  return ("x" == e ? t : (3 & t) | 8).toString(16);
                }
          ));
        }
        static logMethodCall(e, ...t) {
          return c.a.debug(
            `Called %c${e}(${t.map(d.a.stringify).join(", ")})`,
            d.a.getConsoleStyle("code"),
            "."
          );
        }
        static isHttps() {
          return u.isSafari()
            ? "https:" === window.location.protocol
            : !u.isUsingSubscriptionWorkaround();
        }
        static isSafari() {
          return r.a.isBrowser() && void 0 !== window.safari;
        }
      }
      t.b = u;
    }.call(this, i(44)));
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return a;
    });
    var n = i(6),
      o = i(5),
      s = i(11),
      r = i.n(s);
    class a {
      static isBrowser() {
        return "undefined" != typeof window;
      }
      static isSafari() {
        return a.isBrowser() && r.a.safari;
      }
      static version() {
        return Number(151514);
      }
      static get TRADITIONAL_CHINESE_LANGUAGE_TAG() {
        return ["tw", "hant"];
      }
      static get SIMPLIFIED_CHINESE_LANGUAGE_TAG() {
        return ["cn", "hans"];
      }
      static getLanguage() {
        let e = navigator.language;
        if (e) {
          const t = (e = e.toLowerCase()).split("-");
          if ("zh" == t[0]) {
            for (const e of a.TRADITIONAL_CHINESE_LANGUAGE_TAG)
              if (-1 !== t.indexOf(e)) return "zh-Hant";
            for (const e of a.SIMPLIFIED_CHINESE_LANGUAGE_TAG)
              if (-1 !== t.indexOf(e)) return "zh-Hans";
            return "zh-Hant";
          }
          return t[0].substring(0, 2);
        }
        return "en";
      }
      static supportsServiceWorkers() {
        switch (n.a.getWindowEnv()) {
          case o.a.ServiceWorker:
            return !0;
          default:
            return (
              "undefined" != typeof navigator && "serviceWorker" in navigator
            );
        }
      }
      static getSdkStylesVersionHash() {
        return "undefined" == typeof __SRC_STYLESHEETS_MD5_HASH__
          ? "2"
          : __SRC_STYLESHEETS_MD5_HASH__;
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return s;
    }),
      i.d(t, "e", function () {
        return r;
      }),
      i.d(t, "a", function () {
        return a;
      }),
      i.d(t, "c", function () {
        return c;
      }),
      i.d(t, "d", function () {
        return d;
      });
    var n = i(0),
      o = (i(6), i(5), i(2), i(1), i(8));
    i(29), i(41), i(3), i(11);
    function s() {
      return Object(n.a)(this, void 0, void 0, function* () {
        return new Promise((e) => {
          OneSignal.initialized
            ? e()
            : OneSignal.emitter.once(OneSignal.EVENTS.SDK_INITIALIZED, e);
        });
      });
    }
    function r(e, ...t) {
      return o.a.logMethodCall(e, ...t);
    }
    function a(e, t) {
      if ("string" == typeof e) {
        const i = document.querySelector(e);
        if (null === i)
          throw new Error(`Cannot find element with selector "${e}"`);
        i.classList.add(t);
      } else {
        if ("object" != typeof e)
          throw new Error(
            `${e} must be a CSS selector string or DOM Element object.`
          );
        e.classList.add(t);
      }
    }
    function c(e) {
      return Object(n.a)(this, void 0, void 0, function* () {
        return yield new Promise((t) => {
          OneSignal.emitter.once(e, (e) => {
            t(e);
          });
        });
      });
    }
    function d(e) {
      return JSON.parse(JSON.stringify(e));
    }
  },
  function (e, t, i) {
    var n;
    (n = function () {
      var e = !0;
      function t(t) {
        function i(e) {
          var i = t.match(e);
          return (i && i.length > 1 && i[1]) || "";
        }
        var n,
          o,
          s,
          r = i(/(ipod|iphone|ipad)/i).toLowerCase(),
          a = !/like android/i.test(t) && /android/i.test(t),
          c = /nexus\s*[0-6]\s*/i.test(t),
          d = !c && /nexus\s*[0-9]+/i.test(t),
          u = /CrOS/.test(t),
          l = /silk/i.test(t),
          p = /sailfish/i.test(t),
          g = /tizen/i.test(t),
          f = /(web|hpw)os/i.test(t),
          h = /windows phone/i.test(t),
          b = (/SamsungBrowser/i.test(t), !h && /windows/i.test(t)),
          v = !r && !l && /macintosh/i.test(t),
          m = !a && !p && !g && !f && /linux/i.test(t),
          S = i(/edge\/(\d+(\.\d+)?)/i),
          y = i(/version\/(\d+(\.\d+)?)/i),
          O = /tablet/i.test(t) && !/tablet pc/i.test(t),
          w = !O && /[^-]mobi/i.test(t),
          P = /xbox/i.test(t);
        /opera/i.test(t)
          ? (n = {
              name: "Opera",
              opera: e,
              version: y || i(/(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i),
            })
          : /opr\/|opios/i.test(t)
          ? (n = {
              name: "Opera",
              opera: e,
              version: i(/(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || y,
            })
          : /SamsungBrowser/i.test(t)
          ? (n = {
              name: "Samsung Internet for Android",
              samsungBrowser: e,
              version: y || i(/(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i),
            })
          : /coast/i.test(t)
          ? (n = {
              name: "Opera Coast",
              coast: e,
              version: y || i(/(?:coast)[\s\/](\d+(\.\d+)?)/i),
            })
          : /yabrowser/i.test(t)
          ? (n = {
              name: "Yandex Browser",
              yandexbrowser: e,
              version: y || i(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i),
            })
          : /ucbrowser/i.test(t)
          ? (n = {
              name: "UC Browser",
              ucbrowser: e,
              version: i(/(?:ucbrowser)[\s\/](\d+(?:\.\d+)+)/i),
            })
          : /mxios/i.test(t)
          ? (n = {
              name: "Maxthon",
              maxthon: e,
              version: i(/(?:mxios)[\s\/](\d+(?:\.\d+)+)/i),
            })
          : /epiphany/i.test(t)
          ? (n = {
              name: "Epiphany",
              epiphany: e,
              version: i(/(?:epiphany)[\s\/](\d+(?:\.\d+)+)/i),
            })
          : /puffin/i.test(t)
          ? (n = {
              name: "Puffin",
              puffin: e,
              version: i(/(?:puffin)[\s\/](\d+(?:\.\d+)?)/i),
            })
          : /sleipnir/i.test(t)
          ? (n = {
              name: "Sleipnir",
              sleipnir: e,
              version: i(/(?:sleipnir)[\s\/](\d+(?:\.\d+)+)/i),
            })
          : /k-meleon/i.test(t)
          ? (n = {
              name: "K-Meleon",
              kMeleon: e,
              version: i(/(?:k-meleon)[\s\/](\d+(?:\.\d+)+)/i),
            })
          : h
          ? ((n = { name: "Windows Phone", windowsphone: e }),
            S
              ? ((n.msedge = e), (n.version = S))
              : ((n.msie = e), (n.version = i(/iemobile\/(\d+(\.\d+)?)/i))))
          : /msie|trident/i.test(t)
          ? (n = {
              name: "Internet Explorer",
              msie: e,
              version: i(/(?:msie |rv:)(\d+(\.\d+)?)/i),
            })
          : u
          ? (n = {
              name: "Chrome",
              chromeos: e,
              chromeBook: e,
              chrome: e,
              version: i(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i),
            })
          : /chrome.+? edge/i.test(t)
          ? (n = { name: "Microsoft Edge", msedge: e, version: S })
          : /vivaldi/i.test(t)
          ? (n = {
              name: "Vivaldi",
              vivaldi: e,
              version: i(/vivaldi\/(\d+(\.\d+)?)/i) || y,
            })
          : p
          ? (n = {
              name: "Sailfish",
              sailfish: e,
              version: i(/sailfish\s?browser\/(\d+(\.\d+)?)/i),
            })
          : /seamonkey\//i.test(t)
          ? (n = {
              name: "SeaMonkey",
              seamonkey: e,
              version: i(/seamonkey\/(\d+(\.\d+)?)/i),
            })
          : /firefox|iceweasel|fxios/i.test(t)
          ? ((n = {
              name: "Firefox",
              firefox: e,
              version: i(/(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i),
            }),
            /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(t) &&
              (n.firefoxos = e))
          : l
          ? (n = {
              name: "Amazon Silk",
              silk: e,
              version: i(/silk\/(\d+(\.\d+)?)/i),
            })
          : /phantom/i.test(t)
          ? (n = {
              name: "PhantomJS",
              phantom: e,
              version: i(/phantomjs\/(\d+(\.\d+)?)/i),
            })
          : /slimerjs/i.test(t)
          ? (n = {
              name: "SlimerJS",
              slimer: e,
              version: i(/slimerjs\/(\d+(\.\d+)?)/i),
            })
          : /blackberry|\bbb\d+/i.test(t) || /rim\stablet/i.test(t)
          ? (n = {
              name: "BlackBerry",
              blackberry: e,
              version: y || i(/blackberry[\d]+\/(\d+(\.\d+)?)/i),
            })
          : f
          ? ((n = {
              name: "WebOS",
              webos: e,
              version: y || i(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i),
            }),
            /touchpad\//i.test(t) && (n.touchpad = e))
          : /bada/i.test(t)
          ? (n = {
              name: "Bada",
              bada: e,
              version: i(/dolfin\/(\d+(\.\d+)?)/i),
            })
          : g
          ? (n = {
              name: "Tizen",
              tizen: e,
              version: i(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || y,
            })
          : /qupzilla/i.test(t)
          ? (n = {
              name: "QupZilla",
              qupzilla: e,
              version: i(/(?:qupzilla)[\s\/](\d+(?:\.\d+)+)/i) || y,
            })
          : /chromium/i.test(t)
          ? (n = {
              name: "Chromium",
              chromium: e,
              version: i(/(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || y,
            })
          : /chrome|crios|crmo/i.test(t)
          ? (n = {
              name: "Chrome",
              chrome: e,
              version: i(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i),
            })
          : a
          ? (n = { name: "Android", version: y })
          : /safari|applewebkit/i.test(t)
          ? ((n = { name: "Safari", safari: e }), y && (n.version = y))
          : r
          ? ((n = {
              name: "iphone" == r ? "iPhone" : "ipad" == r ? "iPad" : "iPod",
            }),
            y && (n.version = y))
          : (n = /googlebot/i.test(t)
              ? {
                  name: "Googlebot",
                  googlebot: e,
                  version: i(/googlebot\/(\d+(\.\d+))/i) || y,
                }
              : {
                  name: i(/^(.*)\/(.*) /),
                  version:
                    ((o = /^(.*)\/(.*) /),
                    (s = t.match(o)),
                    (s && s.length > 1 && s[2]) || ""),
                }),
          !n.msedge && /(apple)?webkit/i.test(t)
            ? (/(apple)?webkit\/537\.36/i.test(t)
                ? ((n.name = n.name || "Blink"), (n.blink = e))
                : ((n.name = n.name || "Webkit"), (n.webkit = e)),
              !n.version && y && (n.version = y))
            : !n.opera &&
              /gecko\//i.test(t) &&
              ((n.name = n.name || "Gecko"),
              (n.gecko = e),
              (n.version = n.version || i(/gecko\/(\d+(\.\d+)?)/i))),
          n.windowsphone || n.msedge || (!a && !n.silk)
            ? n.windowsphone || n.msedge || !r
              ? v
                ? (n.mac = e)
                : P
                ? (n.xbox = e)
                : b
                ? (n.windows = e)
                : m && (n.linux = e)
              : ((n[r] = e), (n.ios = e))
            : (n.android = e);
        var I = "";
        n.windows
          ? (I = (function (e) {
              switch (e) {
                case "NT":
                  return "NT";
                case "XP":
                  return "XP";
                case "NT 5.0":
                  return "2000";
                case "NT 5.1":
                  return "XP";
                case "NT 5.2":
                  return "2003";
                case "NT 6.0":
                  return "Vista";
                case "NT 6.1":
                  return "7";
                case "NT 6.2":
                  return "8";
                case "NT 6.3":
                  return "8.1";
                case "NT 10.0":
                  return "10";
                default:
                  return;
              }
            })(i(/Windows ((NT|XP)( \d\d?.\d)?)/i)))
          : n.windowsphone
          ? (I = i(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i))
          : n.mac
          ? (I = (I = i(/Mac OS X (\d+([_\.\s]\d+)*)/i)).replace(/[_\s]/g, "."))
          : r
          ? (I = (I = i(/os (\d+([_\s]\d+)*) like mac os x/i)).replace(
              /[_\s]/g,
              "."
            ))
          : a
          ? (I = i(/android[ \/-](\d+(\.\d+)*)/i))
          : n.webos
          ? (I = i(/(?:web|hpw)os\/(\d+(\.\d+)*)/i))
          : n.blackberry
          ? (I = i(/rim\stablet\sos\s(\d+(\.\d+)*)/i))
          : n.bada
          ? (I = i(/bada\/(\d+(\.\d+)*)/i))
          : n.tizen && (I = i(/tizen[\/\s](\d+(\.\d+)*)/i)),
          I && (n.osversion = I);
        var k = !n.windows && I.split(".")[0];
        return (
          O || d || "ipad" == r || (a && (3 == k || (k >= 4 && !w))) || n.silk
            ? (n.tablet = e)
            : (w ||
                "iphone" == r ||
                "ipod" == r ||
                a ||
                c ||
                n.blackberry ||
                n.webos ||
                n.bada) &&
              (n.mobile = e),
          n.msedge ||
          (n.msie && n.version >= 10) ||
          (n.yandexbrowser && n.version >= 15) ||
          (n.vivaldi && n.version >= 1) ||
          (n.chrome && n.version >= 20) ||
          (n.samsungBrowser && n.version >= 4) ||
          (n.firefox && n.version >= 20) ||
          (n.safari && n.version >= 6) ||
          (n.opera && n.version >= 10) ||
          (n.ios && n.osversion && n.osversion.split(".")[0] >= 6) ||
          (n.blackberry && n.version >= 10.1) ||
          (n.chromium && n.version >= 20)
            ? (n.a = e)
            : (n.msie && n.version < 10) ||
              (n.chrome && n.version < 20) ||
              (n.firefox && n.version < 20) ||
              (n.safari && n.version < 6) ||
              (n.opera && n.version < 10) ||
              (n.ios && n.osversion && n.osversion.split(".")[0] < 6) ||
              (n.chromium && n.version < 20)
            ? (n.c = e)
            : (n.x = e),
          n
        );
      }
      var i = t(("undefined" != typeof navigator && navigator.userAgent) || "");
      function n(e) {
        return e.split(".").length;
      }
      function o(e, t) {
        var i,
          n = [];
        if (Array.prototype.map) return Array.prototype.map.call(e, t);
        for (i = 0; i < e.length; i++) n.push(t(e[i]));
        return n;
      }
      function s(e) {
        for (
          var t = Math.max(n(e[0]), n(e[1])),
            i = o(e, function (e) {
              var i = t - n(e);
              return o(
                (e += new Array(i + 1).join(".0")).split("."),
                function (e) {
                  return new Array(20 - e.length).join("0") + e;
                }
              ).reverse();
            });
          --t >= 0;

        ) {
          if (i[0][t] > i[1][t]) return 1;
          if (i[0][t] !== i[1][t]) return -1;
          if (0 === t) return 0;
        }
      }
      function r(e, n, o) {
        var r = i;
        "string" == typeof n && ((o = n), (n = void 0)),
          void 0 === n && (n = !1),
          o && (r = t(o));
        var a = "" + r.version;
        for (var c in e)
          if (e.hasOwnProperty(c) && r[c]) {
            if ("string" != typeof e[c])
              throw new Error(
                "Browser version in the minVersion map should be a string: " +
                  c +
                  ": " +
                  String(e)
              );
            return s([a, e[c]]) < 0;
          }
        return n;
      }
      return (
        (i.test = function (e) {
          for (var t = 0; t < e.length; ++t) {
            var n = e[t];
            if ("string" == typeof n && n in i) return !0;
          }
          return !1;
        }),
        (i.isUnsupportedBrowser = r),
        (i.compareVersions = s),
        (i.check = function (e, t, i) {
          return !r(e, t, i);
        }),
        (i._detect = t),
        i
      );
    }),
      void 0 !== e && e.exports ? (e.exports = n()) : i(48)("bowser", n);
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e[(e.Default = 0)] = "Default"),
          (e[(e.Subscribed = 1)] = "Subscribed"),
          (e[(e.MutedByApi = -2)] = "MutedByApi"),
          (e[(e.NotSubscribed = -10)] = "NotSubscribed"),
          (e[(e.TemporaryWebRecord = -20)] = "TemporaryWebRecord"),
          (e[(e.PermissionRevoked = -21)] = "PermissionRevoked"),
          (e[(e.PushSubscriptionRevoked = -22)] = "PushSubscriptionRevoked"),
          (e[(e.ServiceWorkerStatus403 = -23)] = "ServiceWorkerStatus403"),
          (e[(e.ServiceWorkerStatus404 = -24)] = "ServiceWorkerStatus404");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return c;
    });
    var n = i(0),
      o = i(27),
      s = i(19),
      r = i(3),
      a = i(1);
    class c {
      static getPlayer(e, t) {
        return (
          r.b.enforceAppId(e),
          r.b.enforcePlayerId(t),
          s.b.get(`players/${t}?app_id=${e}`)
        );
      }
      static updatePlayer(e, t, i) {
        return (
          r.b.enforceAppId(e),
          r.b.enforcePlayerId(t),
          s.b.put(`players/${t}`, Object.assign({ app_id: e }, i))
        );
      }
      static sendNotification(e, t, i, n, o, a, c, d) {
        var u = {
          app_id: e,
          contents: n,
          include_player_ids: t,
          isAnyWeb: !0,
          data: c,
          web_buttons: d,
        };
        return (
          i && (u.headings = i),
          o && (u.url = o),
          a && ((u.chrome_web_icon = a), (u.firefox_icon = a)),
          r.b.trimUndefined(u),
          s.b.post("notifications", u)
        );
      }
      static createUser(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = e.serialize();
          r.b.enforceAppId(t.app_id);
          const i = yield s.b.post("players", t);
          return i && i.success ? i.id : null;
        });
      }
      static logoutEmail(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          r.b.enforceAppId(e.appId), r.b.enforcePlayerId(i);
          const n = yield s.b.post(`players/${i}/email_logout`, {
            app_id: e.appId,
            parent_player_id: t.subscriptionId,
            identifier_auth_hash: t.identifierAuthHash
              ? t.identifierAuthHash
              : void 0,
          });
          return !(!n || !n.success);
        });
      }
      static updateUserSession(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          try {
            const i = t.serialize();
            r.b.enforceAppId(i.app_id), r.b.enforcePlayerId(e);
            const n = yield s.b.post(`players/${e}/on_session`, i);
            return n.id ? n.id : e;
          } catch (e) {
            throw e &&
              Array.isArray(e.errors) &&
              e.errors.length > 0 &&
              r.b.contains(e.errors[0], "app_id not found")
              ? new o.a(o.b.MissingAppId)
              : e;
          }
        });
      }
      static sendOutcome(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          a.a.info("Outcome payload:", e);
          try {
            yield s.b.post("outcomes/measure", e);
          } catch (e) {
            a.a.error("sendOutcome", e);
          }
        });
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n extends Error {
      constructor(e = "") {
        super(e),
          Object.defineProperty(this, "message", {
            configurable: !0,
            enumerable: !1,
            value: e,
            writable: !0,
          }),
          Object.defineProperty(this, "name", {
            configurable: !0,
            enumerable: !1,
            value: this.constructor.name,
            writable: !0,
          }),
          Error.hasOwnProperty("captureStackTrace")
            ? Error.captureStackTrace(this, this.constructor)
            : (Object.defineProperty(this, "stack", {
                configurable: !0,
                enumerable: !1,
                value: new Error(e).stack,
                writable: !0,
              }),
              Object.setPrototypeOf(this, n.prototype));
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return p;
    });
    var n = i(0),
      o = i(9),
      s = i(6),
      r = i(5),
      a = i(1),
      c = i(3);
    const d = [
        "notifyButtonHovering",
        "notifyButtonHover",
        "notifyButtonButtonClick",
        "notifyButtonLauncherClick",
        "animatedElementHiding",
        "animatedElementHidden",
        "animatedElementShowing",
        "animatedElementShown",
        "activeAnimatedElementActivating",
        "activeAnimatedElementActive",
        "activeAnimatedElementInactivating",
        "activeAnimatedElementInactive",
        "dbRetrieved",
        "dbSet",
        "testEvent",
      ],
      u = [
        "onesignal.prompt.custom.clicked",
        "onesignal.prompt.native.permissionchanged",
        "onesignal.subscription.changed",
        "onesignal.internal.subscriptionset",
        "dbRebuilt",
        "initialize",
        "subscriptionSet",
        "sendWelcomeNotification",
        "subscriptionChange",
        "notificationPermissionChange",
        "dbSet",
        "register",
        "notificationDisplay",
        "notificationDismiss",
        "notificationClick",
        "permissionPromptDisplay",
        "testWouldDisplay",
        "testInitOptionDisabled",
        "popupWindowTimeout",
      ],
      l = {
        notificationPermissionChange:
          "onesignal.prompt.native.permissionchanged",
        subscriptionChange: "onesignal.subscription.changed",
        customPromptClick: "onesignal.prompt.custom.clicked",
      };
    class p {
      static trigger(e, t, i = null) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (!c.b.contains(d, e)) {
            const n = t;
            let o = c.b.capitalize(s.a.getWindowEnv().toString());
            i && (o = `${o} â¬¸ ${c.b.capitalize(i)}`),
              n || !1 === n
                ? a.a.debug(
                    `(${o}) Â» %c${e}:`,
                    c.b.getConsoleStyle("event"),
                    n
                  )
                : a.a.debug(`(${o}) Â» %c${e}`, c.b.getConsoleStyle("event"));
          }
          if (o.a.isBrowser()) {
            if (e === OneSignal.EVENTS.SDK_INITIALIZED) {
              if (OneSignal.initialized) return;
              OneSignal.initialized = !0;
            }
            yield OneSignal.emitter.emit(e, t);
          }
          if (l.hasOwnProperty(e)) {
            const i = l[e];
            p._triggerLegacy(i, t);
          }
          if (
            o.a.isBrowser() &&
            (s.a.getWindowEnv() === r.a.OneSignalSubscriptionPopup ||
              s.a.getWindowEnv() === r.a.OneSignalProxyFrame)
          ) {
            opener || parent
              ? c.b.contains(u, e) &&
                (s.a.getWindowEnv() === r.a.OneSignalSubscriptionPopup
                  ? OneSignal.subscriptionPopup.message(
                      OneSignal.POSTMAM_COMMANDS.REMOTE_RETRIGGER_EVENT,
                      { eventName: e, eventData: t }
                    )
                  : OneSignal.proxyFrame.retriggerRemoteEvent(e, t))
              : a.a.error(
                  `Could not send event '${e}' back to host page because no creator (opener or parent) found!`
                );
          }
        });
      }
      static _triggerLegacy(e, t) {
        const i = new CustomEvent(e, {
          bubbles: !0,
          cancelable: !0,
          detail: t,
        });
        window.dispatchEvent(i);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return n;
    }),
      i.d(t, "a", function () {
        return InvalidArgumentError;
      });
    var n,
      o = i(14);
    !(function (e) {
      (e[(e.Empty = 0)] = "Empty"),
        (e[(e.Malformed = 1)] = "Malformed"),
        (e[(e.EnumOutOfRange = 2)] = "EnumOutOfRange");
    })(n || (n = {}));
    class InvalidArgumentError extends o.a {
      constructor(e, t) {
        let i;
        switch (t) {
          case n.Empty:
            i = `Supply a non-empty value to '${e}'.`;
            break;
          case n.Malformed:
            i = `The value for '${e}' was malformed.`;
            break;
          case n.EnumOutOfRange:
            i = `The value for '${e}' was out of range of the expected input enum.`;
        }
        super(i),
          (this.argument = e),
          (this.reason = n[t]),
          Object.setPrototypeOf(this, InvalidArgumentError.prototype);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e.Secure = "Secure"),
          (e.SecureProxy = "Secure Proxy"),
          (e.InsecureProxy = "Insecure Proxy");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    var n, o;
    i.d(t, "c", function () {
      return n;
    }),
      i.d(t, "b", function () {
        return o;
      }),
      i.d(t, "a", function () {
        return s;
      }),
      i.d(t, "d", function () {
        return r;
      }),
      (function (e) {
        (e.Active = "active"),
          (e.Inactive = "inactive"),
          (e.Expired = "expired");
      })(n || (n = {})),
      (function (e) {
        (e[(e.PlayerCreate = 1)] = "PlayerCreate"),
          (e[(e.PlayerOnSession = 2)] = "PlayerOnSession"),
          (e[(e.VisibilityVisible = 3)] = "VisibilityVisible"),
          (e[(e.VisibilityHidden = 4)] = "VisibilityHidden"),
          (e[(e.BeforeUnload = 5)] = "BeforeUnload"),
          (e[(e.PageRefresh = 6)] = "PageRefresh"),
          (e[(e.Focus = 7)] = "Focus"),
          (e[(e.Blur = 8)] = "Blur");
      })(o || (o = {}));
    const s = "oneSignalSession";
    function r(e) {
      const t = new Date().getTime(),
        i = (e && e.sessionKey) || s,
        o = (e && e.notificationId) || null;
      return {
        sessionKey: i,
        appId: e.appId,
        deviceId: e.deviceId,
        deviceType: e.deviceType,
        startTimestamp: t,
        accumulatedDuration: 0,
        notificationId: o,
        status: n.Active,
        lastDeactivatedTimestamp: null,
        lastActivatedTimestamp: t,
      };
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return c;
    });
    var n = i(9),
      o = i(6),
      s = i(3),
      r = i(27),
      a = i(1);
    class c {
      static get(e, t, i) {
        return c.call("GET", e, t, i);
      }
      static post(e, t, i) {
        return c.call("POST", e, t, i);
      }
      static put(e, t, i) {
        return c.call("PUT", e, t, i);
      }
      static delete(e, t, i) {
        return c.call("DELETE", e, t, i);
      }
      static call(e, t, i, s) {
        if ("GET" === e) {
          if (t.indexOf("players") > -1 && -1 === t.indexOf("app_id="))
            return (
              console.error(
                "Calls to player api are not permitted without app_id"
              ),
              Promise.reject(new r.a(r.b.MissingAppId))
            );
        } else if (t.indexOf("players") > -1 && (!i || !i.app_id))
          return (
            console.error(
              "Calls to player api are not permitted without app_id"
            ),
            Promise.reject(new r.a(r.b.MissingAppId))
          );
        const d = new Headers();
        if (
          (d.append("Origin", o.a.getOrigin()),
          d.append("SDK-Version", `onesignal/web/${n.a.version()}`),
          d.append("Content-Type", "application/json;charset=UTF-8"),
          s)
        )
          for (const e of Object.keys(s)) d.append(e, s[e]);
        const u = {
          method: e || "NO_METHOD_SPECIFIED",
          headers: d,
          cache: "no-cache",
        };
        let l;
        return (
          i && (u.body = JSON.stringify(i)),
          fetch(o.a.getOneSignalApiUrl(void 0, t).toString() + "/" + t, u)
            .then((e) => ((l = e.status), e.json()))
            .then((e) => {
              if (l >= 200 && l < 300) return e;
              if ("no-user-id-error" !== c.identifyError(e))
                return Promise.reject(e);
            })
            .catch(
              (e) => (
                a.a.warn(`Could not complete request to /${t}`, e),
                Promise.reject(e)
              )
            )
        );
      }
      static identifyError(e) {
        if (!e || !e.errors) return "no-error";
        const t = e.errors;
        return s.a.contains(t, "No user with this id found") ||
          s.a.contains(t, "Could not find app_id for given player id.")
          ? "no-user-id-error"
          : "unknown-error";
      }
    }
    t.b = c;
  },
  function (e, t, i) {
    "use strict";
    var n = i(0),
      o = i(28),
      s = i(4),
      r = i(18),
      a = i(8),
      c = i(2),
      d = i(31),
      u = i(22),
      l = i(25),
      p = i(1),
      g = i(3),
      f = i(10);
    const h = "sendOutcome",
      b = "sendUniqueOutcome";
    class v {
      constructor(e, t, i, n) {
        (this.outcomeName = i),
          (this.config = t),
          (this.appId = e),
          (this.isUnique = n);
      }
      getAttribution() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield v.getAttribution(this.config);
        });
      }
      beforeOutcomeSend() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = this.isUnique ? b : h;
          return (
            Object(f.e)(e, this.outcomeName),
            this.config
              ? this.outcomeName
                ? (yield Object(f.b)(),
                  !!(yield OneSignal.privateIsPushNotificationsEnabled()) ||
                    (p.a.warn(
                      "Reporting outcomes is supported only for subscribed users."
                    ),
                    !1))
                : (p.a.error("Outcome name is required"), !1)
              : (p.a.debug(
                  "Outcomes feature not supported by main application yet."
                ),
                !1)
          );
        });
      }
      getAttributedNotifsByUniqueOutcomeName() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return (yield c.a.getAll("SentUniqueOutcome"))
            .filter((e) => e.outcomeName === this.outcomeName)
            .reduce((e, t) => {
              const i = t.notificationIds || [];
              return [...e, ...i];
            }, []);
        });
      }
      getNotifsToAttributeWithUniqueOutcome(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = yield this.getAttributedNotifsByUniqueOutcomeName();
          return e.filter((e) => -1 === t.indexOf(e));
        });
      }
      shouldSendUnique(e, t) {
        return e.type === l.a.Unattributed || t.length > 0;
      }
      saveSentUniqueOutcome(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = this.outcomeName,
            i = yield c.a.get("SentUniqueOutcome", t),
            n = yield c.a.getCurrentSession(),
            o = [...(i ? i.notificationIds : []), ...e],
            s = n ? n.startTimestamp : null;
          yield c.a.put("SentUniqueOutcome", {
            outcomeName: t,
            notificationIds: o,
            sentDuringSession: s,
          });
        });
      }
      wasSentDuringSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield c.a.get("SentUniqueOutcome", this.outcomeName);
          if (!e) return !1;
          const t = yield c.a.getCurrentSession(),
            i = t && e.sentDuringSession === t.startTimestamp,
            n = !t && !!e.sentDuringSession;
          return i || n;
        });
      }
      send(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const { type: t, notificationIds: i, weight: n } = e;
          switch (t) {
            case l.a.Direct:
              return (
                this.isUnique && (yield this.saveSentUniqueOutcome(i)),
                void (yield OneSignal.context.updateManager.sendOutcomeDirect(
                  this.appId,
                  i,
                  this.outcomeName,
                  n
                ))
              );
            case l.a.Indirect:
              return (
                this.isUnique && (yield this.saveSentUniqueOutcome(i)),
                void (yield OneSignal.context.updateManager.sendOutcomeInfluenced(
                  this.appId,
                  i,
                  this.outcomeName,
                  n
                ))
              );
            case l.a.Unattributed:
              if (this.isUnique) {
                if (yield this.wasSentDuringSession())
                  return void p.a.warn(
                    "(Unattributed) unique outcome was already sent during this session"
                  );
                yield this.saveSentUniqueOutcome([]);
              }
              return void (yield OneSignal.context.updateManager.sendOutcomeUnattributed(
                this.appId,
                this.outcomeName,
                n
              ));
            default:
              return void p.a.warn(
                "You are on a free plan. Please upgrade to use this functionality."
              );
          }
        });
      }
      static getAttribution(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (e.direct && e.direct.enabled) {
            const e = yield c.a.getAll("NotificationClicked");
            if (e.length > 0)
              return {
                type: l.a.Direct,
                notificationIds: [e[0].notificationId],
              };
          }
          if (e.indirect && e.indirect.enabled) {
            const t = 60 * e.indirect.influencedTimePeriodMin * 1e3,
              i = new Date(new Date().getTime() - t).getTime(),
              n = yield c.a.getAll("NotificationReceived");
            if (
              (p.a.debug(`\tFound total of ${n.length} received notifications`),
              n.length > 0)
            ) {
              const t = e.indirect.influencedNotificationsLimit,
                o = g.a.sortArrayOfObjects(n, (e) => e.timestamp, !0, !1),
                s = o
                  .filter((e) => e.timestamp >= i)
                  .slice(0, t)
                  .map((e) => e.notificationId);
              p.a.debug(
                `\tTotal of ${s.length} received notifications are within reporting window.`
              );
              const r = o
                .filter((e) => -1 === s.indexOf(e.notificationId))
                .map((e) => e.notificationId);
              if (
                (r.forEach((e) => c.a.remove("NotificationReceived", e)),
                p.a.debug(
                  `\t${r.length} received notifications will be deleted.`
                ),
                s.length > 0)
              )
                return { type: l.a.Indirect, notificationIds: s };
            }
          }
          return e.unattributed && e.unattributed.enabled
            ? { type: l.a.Unattributed, notificationIds: [] }
            : { type: l.a.NotSupported, notificationIds: [] };
        });
      }
    }
    var m,
      S,
      y = i(36),
      O = i(40);
    i.d(t, "b", function () {
      return w;
    }),
      i.d(t, "a", function () {
        return m;
      });
    class w {
      static getServiceWorkerHref(e, t, i) {
        return w.appendServiceWorkerParams(e.workerPath.getFullPath(), t, i);
      }
      static appendServiceWorkerParams(e, t, i) {
        return `${
          new URL(e, a.a.getBaseUrl()).href
        }?${g.b.encodeHashAsUriComponent({
          appId: t,
        })}?${g.b.encodeHashAsUriComponent({ sdkVersion: i })}`;
      }
      static upsertSession(e, t, i, o, a, d) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (!o)
            return void s.a.error("No deviceId provided for new session.");
          if (!i.app_id)
            return void s.a.error("No appId provided for new session.");
          const n = yield c.a.getCurrentSession();
          if (!n) {
            const e = i.app_id,
              t = Object(r.d)({
                deviceId: o,
                appId: e,
                deviceType: i.device_type,
              }),
              n = yield c.a.getLastNotificationClicked(e);
            return (
              n && (t.notificationId = n.notificationId),
              yield c.a.upsertSession(t),
              void (yield w.sendOnSessionCallIfNecessary(a, i, o, t))
            );
          }
          if (n.status === r.c.Active)
            return void s.a.debug("Session already active", n);
          if (!n.lastDeactivatedTimestamp)
            return void s.a.debug("Session is in invalid state", n);
          const u = new Date().getTime();
          if (
            w.timeInSecondsBetweenTimestamps(u, n.lastDeactivatedTimestamp) <= e
          )
            return (
              (n.status = r.c.Active),
              (n.lastActivatedTimestamp = u),
              (n.lastDeactivatedTimestamp = null),
              void (yield c.a.upsertSession(n))
            );
          yield w.finalizeSession(n, t, d);
          const l = Object(r.d)({
            deviceId: o,
            appId: i.app_id,
            deviceType: i.device_type,
          });
          yield c.a.upsertSession(l),
            yield w.sendOnSessionCallIfNecessary(a, i, o, l);
        });
      }
      static deactivateSession(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const n = yield c.a.getCurrentSession();
          if (!n)
            return void s.a.debug(
              "No active session found. Cannot deactivate."
            );
          if (n.status === r.c.Inactive)
            return Object(y.a)(() => w.finalizeSession(n, t, i), e);
          if (n.status !== r.c.Active)
            return void s.a.warn(
              `Session in invalid state ${n.status}. Cannot deactivate.`
            );
          const o = new Date().getTime(),
            a = w.timeInSecondsBetweenTimestamps(o, n.lastActivatedTimestamp);
          (n.lastDeactivatedTimestamp = o),
            (n.accumulatedDuration += a),
            (n.status = r.c.Inactive);
          const d = Object(y.a)(() => w.finalizeSession(n, t, i), e);
          return yield c.a.upsertSession(n), d;
        });
      }
      static sendOnSessionCallIfNecessary(e, t, i, s) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (e === r.b.PlayerCreate) return;
          if (!t.identifier) {
            const e = yield self.registration.pushManager.getSubscription();
            if (e) {
              const i = u.a.setFromW3cSubscription(e),
                n = new d.a(i).serialize();
              t.identifier = n.identifier;
            }
          }
          const n = yield o.a.updateUserSession(i, t);
          n !== i &&
            ((s.deviceId = n),
            yield Promise.all([
              c.a.setDeviceId(n),
              c.a.upsertSession(s),
              c.a.resetSentUniqueOutcomes(),
            ])),
            yield new O.a().synchronizer.onSession();
        });
      }
      static finalizeSession(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (
            (s.a.debug(
              "Finalize session",
              `started: ${new Date(e.startTimestamp)}`,
              `duration: ${e.accumulatedDuration}s`
            ),
            t)
          ) {
            s.a.debug(
              `send on_focus reporting session duration -> ${e.accumulatedDuration}s`
            );
            const t = yield v.getAttribution(i);
            s.a.debug("send on_focus with attribution", t),
              yield o.a.sendSessionDuration(
                e.appId,
                e.deviceId,
                e.accumulatedDuration,
                e.deviceType,
                t
              ),
              yield new O.a().synchronizer.onFocus(e.accumulatedDuration);
          }
          yield Promise.all([
            c.a.cleanupCurrentSession(),
            c.a.removeAllNotificationClicked(),
          ]),
            s.a.debug(
              "Finalize session finished",
              `started: ${new Date(e.startTimestamp)}`
            );
        });
      }
      static timeInSecondsBetweenTimestamps(e, t) {
        return e <= t ? 0 : Math.floor((e - t) / 1e3);
      }
    }
    ((S = m || (m = {})).OneSignalWorker = "OneSignal Worker"),
      (S.ThirdParty = "3rd Party"),
      (S.None = "None"),
      (S.Indeterminate = "Indeterminate");
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e.Native = "native"),
          (e.Push = "push"),
          (e.Category = "category"),
          (e.Sms = "sms"),
          (e.Email = "email"),
          (e.SmsAndEmail = "smsAndEmail");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n {
      isNewSubscription() {
        return this.existingW3cPushSubscription
          ? !!this.existingW3cPushSubscription.w3cEndpoint !=
              !!this.w3cEndpoint ||
              !(
                !this.existingW3cPushSubscription.w3cEndpoint ||
                !this.w3cEndpoint ||
                this.existingW3cPushSubscription.w3cEndpoint.toString() ===
                  this.w3cEndpoint.toString()
              ) ||
              this.existingW3cPushSubscription.w3cP256dh !== this.w3cP256dh ||
              this.existingW3cPushSubscription.w3cAuth !== this.w3cAuth
          : !this.existingSafariDeviceToken ||
              this.existingSafariDeviceToken !== this.safariDeviceToken;
      }
      static setFromW3cSubscription(e) {
        const t = new n();
        if (e && ((t.w3cEndpoint = new URL(e.endpoint)), e.getKey)) {
          let i = null;
          try {
            i = e.getKey("p256dh");
          } catch (e) {}
          let n = null;
          try {
            n = e.getKey("auth");
          } catch (e) {}
          if (i) {
            const e = btoa(String.fromCharCode.apply(null, new Uint8Array(i)));
            t.w3cP256dh = e;
          }
          if (n) {
            const e = btoa(String.fromCharCode.apply(null, new Uint8Array(n)));
            t.w3cAuth = e;
          }
        }
        return t;
      }
      setFromSafariSubscription(e) {
        this.safariDeviceToken = e;
      }
      serialize() {
        return {
          w3cEndpoint: this.w3cEndpoint ? this.w3cEndpoint.toString() : null,
          w3cP256dh: this.w3cP256dh,
          w3cAuth: this.w3cAuth,
          safariDeviceToken: this.safariDeviceToken,
          existingPushSubscription: this.existingW3cPushSubscription
            ? this.existingW3cPushSubscription.serialize()
            : null,
          existingSafariDeviceToken: this.existingSafariDeviceToken,
        };
      }
      static deserialize(e) {
        const t = new n();
        if (!e) return t;
        try {
          t.w3cEndpoint = new URL(e.w3cEndpoint);
        } catch (e) {}
        return (
          (t.w3cP256dh = e.w3cP256dh),
          (t.w3cAuth = e.w3cAuth),
          (t.existingW3cPushSubscription = void 0),
          e.existingW3cPushSubscription
            ? (t.existingW3cPushSubscription = n.deserialize(
                e.existingW3cPushSubscription
              ))
            : e.existingPushSubscription &&
              (t.existingW3cPushSubscription = n.deserialize(
                e.existingPushSubscription
              )),
          (t.safariDeviceToken = e.safariDeviceToken),
          (t.existingSafariDeviceToken = e.existingSafariDeviceToken),
          t
        );
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return o;
    });
    var n = i(14);
    class o extends n.a {
      constructor() {
        super("This code is not implemented yet."),
          Object.setPrototypeOf(this, o.prototype);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return n;
    }),
      i.d(t, "a", function () {
        return SdkInitError;
      });
    var n,
      o = i(14);
    !(function (e) {
      (e[(e.InvalidAppId = 0)] = "InvalidAppId"),
        (e[(e.AppNotConfiguredForWebPush = 1)] = "AppNotConfiguredForWebPush"),
        (e[(e.MissingSubdomain = 2)] = "MissingSubdomain"),
        (e[(e.WrongSiteUrl = 3)] = "WrongSiteUrl"),
        (e[(e.MultipleInitialization = 4)] = "MultipleInitialization"),
        (e[(e.MissingSafariWebId = 5)] = "MissingSafariWebId"),
        (e[(e.Unknown = 6)] = "Unknown");
    })(n || (n = {}));
    class SdkInitError extends o.a {
      constructor(e, t) {
        let i;
        switch (e) {
          case n.InvalidAppId:
            i =
              "OneSignal: This app ID does not match any existing app. Double check your app ID.";
            break;
          case n.AppNotConfiguredForWebPush:
            i =
              "OneSignal: This app ID does not have any web platforms enabled. Double check your app ID, or see step 1 on our setup guide (https://tinyurl.com/2x5jzk83).";
            break;
          case n.MissingSubdomain:
            i =
              "Non-HTTPS pages require the subdomainName parameter within the label set within the OneSignal Web configuration (https://tinyurl.com/ry39x7mk).";
            break;
          case n.WrongSiteUrl:
            i =
              t && t.siteUrl
                ? `OneSignal: This web push config can only be used on ${
                    new URL(t.siteUrl).origin
                  }.` + ` Your current origin is ${location.origin}.`
                : "OneSignal: This web push config can not be used on the current site.";
            break;
          case n.MultipleInitialization:
            i =
              "OneSignal: The OneSignal web SDK can only be initialized once. Extra initializations are ignored. Please remove calls initializing the SDK more than once.";
            break;
          case n.MissingSafariWebId:
            i =
              "OneSignal: Safari browser support on Mac OS X requires the Safari web platform to be enabled. Please see the Safari Support steps in our web setup guide.";
            break;
          case n.Unknown:
            i = "OneSignal: An unknown initialization error occurred.";
        }
        super(i),
          (this.reason = n[e]),
          Object.setPrototypeOf(this, SdkInitError.prototype);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e[(e.Direct = 1)] = "Direct"),
          (e[(e.Indirect = 2)] = "Indirect"),
          (e[(e.Unattributed = 3)] = "Unattributed"),
          (e[(e.NotSupported = 4)] = "NotSupported");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return n;
    }),
      i.d(t, "a", function () {
        return NotSubscribedError;
      });
    var n,
      o = i(14);
    !(function (e) {
      (e[(e.Unknown = 0)] = "Unknown"),
        (e[(e.NoDeviceId = 1)] = "NoDeviceId"),
        (e[(e.NoEmailSet = 2)] = "NoEmailSet"),
        (e[(e.NoSMSSet = 3)] = "NoSMSSet"),
        (e[(e.OptedOut = 4)] = "OptedOut");
    })(n || (n = {}));
    class NotSubscribedError extends o.a {
      constructor(e) {
        let t;
        switch (e) {
          case n.Unknown || n.NoDeviceId:
            t =
              "This operation can only be performed after the user is subscribed.";
            break;
          case n.NoEmailSet:
            t = "No email is currently set.";
            break;
          case n.NoSMSSet:
            t = "No sms is currently set.";
            break;
          case n.OptedOut:
            t =
              "The user has manually opted out of receiving of notifications. This operation can only be performed after the user is fully resubscribed.";
        }
        super(t),
          (this.reason = n[e]),
          Object.setPrototypeOf(this, NotSubscribedError.prototype);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "b", function () {
      return n;
    }),
      i.d(t, "a", function () {
        return s;
      });
    var n,
      o = i(14);
    !(function (e) {
      e[(e.MissingAppId = 0)] = "MissingAppId";
    })(n || (n = {}));
    class s extends o.a {
      constructor(e) {
        let t;
        switch (e) {
          case n.MissingAppId:
            t = "The API call is missing an app ID.";
        }
        super(t), Object.setPrototypeOf(this, s.prototype);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return d;
    });
    var n = i(0),
      o = i(19),
      s = i(12),
      r = i(1),
      a = i(3),
      c = i(25);
    class d {
      static downloadServerAppConfig(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return (
            a.a.enforceAppId(e),
            yield new Promise((t, i) => {
              t(o.a.get(`sync/${e}/web`, null));
            })
          );
        });
      }
      static getUserIdFromSubscriptionIdentifier(e, t, i) {
        return (
          a.a.enforceAppId(e),
          o.a
            .post("players", {
              app_id: e,
              device_type: t,
              identifier: i,
              notification_types: s.a.TemporaryWebRecord,
            })
            .then((e) => (e && e.id ? e.id : null))
            .catch(
              (e) => (
                r.a.debug(
                  "Error getting user ID from subscription identifier:",
                  e
                ),
                null
              )
            )
        );
      }
      static updatePlayer(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield a.a.enforceAppIdAndPlayerId(e, t, () =>
            Object(n.a)(this, void 0, void 0, function* () {
              yield o.a.put(`players/${t}`, Object.assign({ app_id: e }, i));
            })
          );
        });
      }
      static updateUserSession(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield a.a.enforceAppIdAndPlayerId(t.app_id, e, () =>
            Object(n.a)(this, void 0, void 0, function* () {
              const i = yield o.a.post(`players/${e}/on_session`, t);
              return i.id ? i.id : e;
            })
          );
        });
      }
      static sendSessionDuration(e, t, i, s, r) {
        return Object(n.a)(this, void 0, void 0, function* () {
          a.a.enforceAppIdAndPlayerId(e, t, () =>
            Object(n.a)(this, void 0, void 0, function* () {
              const n = {
                app_id: e,
                type: 1,
                state: "ping",
                active_time: i,
                device_type: s,
              };
              switch (r.type) {
                case c.a.Direct:
                  (n.direct = !0), (n.notification_ids = r.notificationIds);
                  break;
                case c.a.Indirect:
                  (n.direct = !1), (n.notification_ids = r.notificationIds);
              }
              yield o.a.post(`players/${t}/on_focus`, n);
            })
          );
        });
      }
    }
    t.b = d;
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return r;
    });
    var n = i(0),
      o = i(2),
      s = i(15);
    class r {
      static triggerNotificationPermissionChanged(e = !1) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = yield OneSignal.privateGetNotificationPermission();
          (t !== (yield o.a.get("Options", "notificationPermission")) || e) &&
            (yield o.a.put("Options", {
              key: "notificationPermission",
              value: t,
            }),
            s.a.trigger(OneSignal.EVENTS.NATIVE_PROMPT_PERMISSIONCHANGED, {
              to: t,
            }));
        });
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e[(e.ChromeLike = 5)] = "ChromeLike"),
          (e[(e.Safari = 7)] = "Safari"),
          (e[(e.Firefox = 8)] = "Firefox"),
          (e[(e.Email = 11)] = "Email"),
          (e[(e.Edge = 12)] = "Edge"),
          (e[(e.SMS = 14)] = "SMS");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return c;
    });
    var n = i(11),
      o = i.n(n),
      s = i(23),
      r = i(12),
      a = i(33);
    class c extends a.a {
      constructor(e) {
        super(), (this.subscription = e);
      }
      serialize() {
        const e = super.serialize();
        return (
          this.subscription &&
            ((e.identifier = o.a.safari
              ? this.subscription.safariDeviceToken
              : this.subscription.w3cEndpoint
              ? this.subscription.w3cEndpoint.toString()
              : null),
            (e.web_auth = this.subscription.w3cAuth),
            (e.web_p256 = this.subscription.w3cP256dh)),
          e
        );
      }
      static createFromPushSubscription(e, t, i) {
        const n = new c(t);
        return (
          (n.appId = e),
          (n.subscriptionState = t ? r.a.Subscribed : r.a.NotSubscribed),
          i && (n.subscriptionState = i),
          n
        );
      }
      deserialize(e) {
        throw new s.a();
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return o;
    });
    var n = i(21);
    class o {
      static isCategorySlidedownConfigured(e) {
        if (!e) return !1;
        const t = o.getFirstSlidedownPromptOptionsWithType(e, n.a.Category);
        return !!t && !!t.categories && t.categories.length > 0;
      }
      static isCategorySlidedownConfiguredVersion1(e) {
        var t, i;
        return (
          ((null ===
            (i =
              null ===
                (t = null === e || void 0 === e ? void 0 : e.categories) ||
              void 0 === t
                ? void 0
                : t.tags) || void 0 === i
            ? void 0
            : i.length) || 0) > 0
        );
      }
      static getFirstSlidedownPromptOptionsWithType(e, t) {
        return e ? e.filter((e) => e.type === t)[0] : void 0;
      }
      static isSlidedownAutoPromptConfigured(e) {
        if (!e) return !1;
        for (let t = 0; t < e.length; t++) if (e[t].autoPrompt) return !0;
        return !1;
      }
      static isSlidedownPushDependent(e) {
        return e === n.a.Push || e === n.a.Category;
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return d;
    });
    var n = i(11),
      o = i.n(n),
      s = i(9),
      r = i(23),
      a = i(30),
      c = i(8);
    class d {
      constructor() {
        (this.language = s.a.getLanguage()),
          (this.timezone = -60 * new Date().getTimezoneOffset()),
          (this.timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone);
        const e = parseInt(String(o.a.version), 10);
        (this.browserVersion = isNaN(e) ? -1 : e),
          (this.deviceModel = navigator.platform),
          (this.sdkVersion = s.a.version().toString()),
          (this.deliveryPlatform = this.getDeliveryPlatform());
      }
      isSafari() {
        return (
          o.a.safari &&
          void 0 !== window.safari &&
          void 0 !== window.safari.pushNotification
        );
      }
      getDeliveryPlatform() {
        const e = c.a.redetectBrowserUserAgent();
        return this.isSafari()
          ? a.a.Safari
          : e.firefox
          ? a.a.Firefox
          : e.msedge
          ? a.a.Edge
          : a.a.ChromeLike;
      }
      serialize() {
        const e = {
          device_type: this.deliveryPlatform,
          language: this.language,
          timezone: this.timezone,
          timezone_id: this.timezoneId,
          device_os: this.browserVersion,
          device_model: this.deviceModel,
          sdk: this.sdkVersion,
          notification_types: this.subscriptionState,
        };
        return (
          this.appId && (e.app_id = this.appId),
          this.externalUserId && (e.external_user_id = this.externalUserId),
          this.externalUserIdAuthHash &&
            (e.external_user_id_auth_hash = this.externalUserIdAuthHash),
          e
        );
      }
      deserialize(e) {
        throw new r.a();
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n {
      constructor(e, t, i) {
        (this.subscriptionId = e),
          (this.identifier = t),
          (this.identifierAuthHash = i);
      }
      serialize() {
        return {
          identifierAuthHash: this.identifierAuthHash,
          smsNumber: this.identifier,
          smsId: this.subscriptionId,
        };
      }
      static deserialize(e) {
        return new n(e.smsId, e.smsNumber, e.identifierAuthHash);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return n;
    });
    class n {
      constructor(e, t, i) {
        (this.subscriptionId = e),
          (this.identifier = t),
          (this.identifierAuthHash = i);
      }
      serialize() {
        return {
          identifierAuthHash: this.identifierAuthHash,
          emailAddress: this.identifier,
          emailId: this.subscriptionId,
        };
      }
      static deserialize(e) {
        return new n(e.emailId, e.emailAddress, e.identifierAuthHash);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return r;
    });
    var n = i(0),
      o = i(4);
    const s = () => {
      o.a.debug("Do nothing");
    };
    function r(e, t) {
      const i = 1e3 * t;
      let r,
        a = void 0;
      const c = new Promise((t, s) => {
        let c = !1;
        (r = self.setTimeout(
          () =>
            Object(n.a)(this, void 0, void 0, function* () {
              c = !0;
              try {
                yield e(), t();
              } catch (e) {
                o.a.error("Failed to execute callback", e), s();
              }
            }),
          i
        )),
          (a = () => {
            o.a.debug("Cancel called"), self.clearTimeout(r), c || t();
          });
      });
      return a
        ? { promise: c, cancel: a }
        : (o.a.warn("clearTimeoutHandle was not assigned."),
          { promise: c, cancel: s });
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return s;
    });
    var n = i(0),
      o = i(1);
    class s {
      static getRegistration(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          try {
            const t = location.origin + e;
            return yield navigator.serviceWorker.getRegistration(t);
          } catch (t) {
            return (
              o.a.warn(
                "[Service Worker Status] Error Checking service worker registration",
                e,
                t
              ),
              null
            );
          }
        });
      }
      static getAvailableServiceWorker(e) {
        const t = e.active || e.installing || e.waiting;
        return (
          t || o.a.warn("Could not find an available ServiceWorker instance!"),
          t
        );
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n;
    i.d(t, "a", function () {
      return n;
    }),
      (function (e) {
        (e.None = "None"), (e.UnitTesting = "Unit Testing");
      })(n || (n = {}));
  },
  function (e, t, i) {
    "use strict";
    var n,
      o = i(7),
      s = i(6),
      r = i(5),
      a = i(1);
    !(function (e) {
      (e.Default = "default"), (e.Granted = "granted"), (e.Denied = "denied");
    })(n || (n = {}));
    var c = i(0),
      d = i(8),
      u = i(11),
      l = i.n(u),
      InvalidArgumentError = i(16);
    class p {
      static get STORED_PERMISSION_KEY() {
        return "storedNotificationPermission";
      }
      getNotificationPermission(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = yield this.getReportedNotificationPermission(e);
          return (yield this.isPermissionEnvironmentAmbiguous(t))
            ? yield this.getInterpretedAmbiguousPermission(t)
            : t;
        });
      }
      getReportedNotificationPermission(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (l.a.safari) return p.getSafariNotificationPermission(e);
          if (d.b.isUsingSubscriptionWorkaround())
            return yield this.getOneSignalSubdomainNotificationPermission(e);
          {
            const e = this.getW3cNotificationPermission();
            return (yield this.isPermissionEnvironmentAmbiguous(e))
              ? yield this.getInterpretedAmbiguousPermission(e)
              : this.getW3cNotificationPermission();
          }
        });
      }
      static getSafariNotificationPermission(e) {
        if (e) return window.safari.pushNotification.permission(e).permission;
        throw new InvalidArgumentError.a(
          "safariWebId",
          InvalidArgumentError.b.Empty
        );
      }
      getW3cNotificationPermission() {
        return Notification.permission;
      }
      getOneSignalSubdomainNotificationPermission(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          return new Promise((t) => {
            OneSignal.proxyFrameHost.message(
              OneSignal.POSTMAM_COMMANDS.REMOTE_NOTIFICATION_PERMISSION,
              { safariWebId: e },
              (e) => {
                const i = e.data;
                t(i);
              }
            );
          });
        });
      }
      isPermissionEnvironmentAmbiguous(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = d.b.redetectBrowserUserAgent();
          return (
            !t.safari &&
            !t.firefox &&
            e === n.Denied &&
            (this.isCurrentFrameContextCrossOrigin() ||
              (yield s.a.isFrameContextInsecure()) ||
              d.b.isUsingSubscriptionWorkaround())
          );
        });
      }
      isCurrentFrameContextCrossOrigin() {
        let e;
        try {
          e = window.top.location.origin;
        } catch (e) {
          return !0;
        }
        return window.top !== window && e !== window.location.origin;
      }
      getInterpretedAmbiguousPermission(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          switch (e) {
            case n.Denied:
              const t = this.getStoredPermission();
              return t || n.Default;
            default:
              return e;
          }
        });
      }
      getStoredPermission() {
        return b.getStoredPermission();
      }
      setStoredPermission(e) {
        b.setStoredPermission(e);
      }
      updateStoredPermission() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield this.getNotificationPermission();
          return this.setStoredPermission(e);
        });
      }
    }
    const g = "isOptedOut",
      f = "isPushNotificationsEnabled",
      h = "os_pageViews";
    class b {
      static getIsOptedOut() {
        return "true" === localStorage.getItem(g);
      }
      static getIsPushNotificationsEnabled() {
        return "true" === localStorage.getItem(f);
      }
      static setIsOptedOut(e) {
        localStorage.setItem(g, e.toString());
      }
      static setIsPushNotificationsEnabled(e) {
        localStorage.setItem(f, e.toString());
      }
      static setStoredPermission(e) {
        localStorage.setItem(p.STORED_PERMISSION_KEY, e);
      }
      static getStoredPermission() {
        switch (localStorage.getItem(p.STORED_PERMISSION_KEY) || "default") {
          case "granted":
            return n.Granted;
          case "denied":
            return n.Denied;
          default:
            return n.Default;
        }
      }
      static setLocalPageViewCount(e) {
        localStorage.setItem(h, e.toString());
      }
      static getLocalPageViewCount() {
        return Number(localStorage.getItem(h));
      }
    }
    class v {
      constructor() {
        this.incrementedPageViewCount = !1;
      }
      getPageViewCount() {
        try {
          const e = sessionStorage.getItem(v.SESSION_STORAGE_KEY_NAME),
            t = e ? parseInt(e) : 0;
          return isNaN(t) ? 0 : t;
        } catch (e) {
          return 0;
        }
      }
      setPageViewCount(e) {
        try {
          sessionStorage.setItem(v.SESSION_STORAGE_KEY_NAME, e.toString()),
            s.a.getWindowEnv() === r.a.OneSignalSubscriptionPopup &&
              OneSignal.subscriptionPopup &&
              OneSignal.subscriptionPopup.message(
                OneSignal.POSTMAM_COMMANDS.SET_SESSION_COUNT
              );
        } catch (e) {}
      }
      incrementPageViewCount() {
        if (this.incrementedPageViewCount) return;
        const e = this.getPageViewCount() + 1,
          t = this.getLocalPageViewCount() + 1;
        this.setPageViewCount(e),
          this.setLocalPageViewCount(t),
          (this.incrementedPageViewCount = !0),
          a.a.debug(
            `Incremented page view count: newCountSingleTab: ${e},\n      newCountAccrossTabs: ${t}.`
          );
      }
      simulatePageNavigationOrRefresh() {
        this.incrementedPageViewCount = !1;
      }
      isFirstPageView() {
        return 1 === this.getPageViewCount();
      }
      getLocalPageViewCount() {
        return b.getLocalPageViewCount();
      }
      setLocalPageViewCount(e) {
        b.setLocalPageViewCount(e);
      }
    }
    v.SESSION_STORAGE_KEY_NAME = "onesignal-pageview-count";
    var m = i(9);
    class S {
      constructor(e) {
        if (!e)
          throw new InvalidArgumentError.a(
            "path",
            InvalidArgumentError.b.Empty
          );
        this.path = e.trim();
      }
      getQueryString() {
        const e = this.path.indexOf("?");
        return -1 === e
          ? null
          : this.path.length > e
          ? this.path.substring(e + 1)
          : null;
      }
      getWithoutQueryString() {
        return this.path.split(S.QUERY_STRING)[0];
      }
      getFileName() {
        var e;
        return null === (e = this.getWithoutQueryString().split("\\").pop()) ||
          void 0 === e
          ? void 0
          : e.split("/").pop();
      }
      getFileNameWithQuery() {
        var e;
        return null === (e = this.path.split("\\").pop()) || void 0 === e
          ? void 0
          : e.split("/").pop();
      }
      getFullPath() {
        return this.path;
      }
      getPathWithoutFileName() {
        const e = this.getWithoutQueryString(),
          t = e.lastIndexOf(this.getFileName());
        let i = e.substring(0, t);
        return (i = i.replace(/[\\\/]$/, ""));
      }
    }
    S.QUERY_STRING = "?";
    var y = i(2),
      O = i(17),
      w = i(23),
      P = i(15),
      I = i(14);
    class k extends I.a {
      constructor(e, t) {
        super("Registration of a Service Worker failed."),
          (this.status = e),
          (this.statusText = t),
          Object.setPrototypeOf(this, k.prototype);
      }
    }
    var C = k,
      E = i(20),
      x = i(3),
      N = i(37);
    class A {
      constructor(e, t) {
        (this.context = e), (this.config = t);
      }
      getRegistration() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return yield N.a.getRegistration(
            this.config.registrationOptions.scope
          );
        });
      }
      getActiveState() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield s.a.getIntegration();
          if (e === O.a.InsecureProxy) return E.a.Indeterminate;
          if (e === O.a.SecureProxy) {
            switch (s.a.getWindowEnv()) {
              case r.a.Host:
              case r.a.CustomIframe:
                const e = OneSignal.proxyFrameHost;
                return e
                  ? yield e.runCommand(
                      OneSignal.POSTMAM_COMMANDS.SERVICE_WORKER_STATE
                    )
                  : E.a.Indeterminate;
              case r.a.OneSignalSubscriptionPopup:
                break;
              case r.a.OneSignalSubscriptionModal:
                throw new w.a();
            }
          }
          const t = yield this.context.serviceWorkerManager.getRegistration();
          if (!t) return E.a.None;
          const i = A.activeSwFileName(t);
          return this.swActiveStateByFileName(i);
        });
      }
      static activeSwFileName(e) {
        const t = N.a.getAvailableServiceWorker(e);
        if (!t) return null;
        const i = new URL(t.scriptURL).pathname,
          n = new S(i).getFileName();
        if ("akam-sw.js" == n) {
          const e = new URLSearchParams(new URL(t.scriptURL).search).get(
            "othersw"
          );
          if (e)
            return (
              a.a.debug(
                "Found a ServiceWorker under Akamai's akam-sw.js?othersw=",
                e
              ),
              new S(new URL(e).pathname).getFileName()
            );
        }
        return n;
      }
      swActiveStateByFileName(e) {
        return e
          ? e == this.config.workerPath.getFileName()
            ? E.a.OneSignalWorker
            : E.a.ThirdParty
          : E.a.None;
      }
      getWorkerVersion() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return new Promise((e) =>
            Object(c.a)(this, void 0, void 0, function* () {
              if (d.b.isUsingSubscriptionWorkaround()) {
                const t = OneSignal.proxyFrameHost;
                if (t) {
                  const i = yield t.runCommand(
                    OneSignal.POSTMAM_COMMANDS.GET_WORKER_VERSION
                  );
                  e(i);
                } else e(NaN);
              } else
                this.context.workerMessenger.once(o.b.WorkerVersion, (t) => {
                  e(t);
                }),
                  yield this.context.workerMessenger.unicast(o.b.WorkerVersion);
            })
          );
        });
      }
      shouldInstallWorker() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (!m.a.supportsServiceWorkers()) return !1;
          if (!OneSignal.config) return !1;
          if (
            OneSignal.config.subdomain &&
            "safari" !== OneSignal.environmentInfo.browserType &&
            s.a.getWindowEnv() === r.a.Host
          )
            return !1;
          const e = yield this.getActiveState();
          if (
            (a.a.debug("[shouldInstallWorker] workerState", e),
            e === E.a.None || e === E.a.ThirdParty)
          ) {
            const e =
              "granted" ===
              (yield OneSignal.context.permissionManager.getNotificationPermission(
                OneSignal.config.safariWebId
              ));
            return (
              e &&
                a.a.info(
                  "[shouldInstallWorker] Notification Permissions enabled, will install ServiceWorker"
                ),
              e
            );
          }
          return !!(yield this.haveParamsChanged()) || this.workerNeedsUpdate();
        });
      }
      haveParamsChanged() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield this.context.serviceWorkerManager.getRegistration();
          if (!e)
            return (
              a.a.info(
                "[changedServiceWorkerParams] workerRegistration not found at scope",
                this.config.registrationOptions.scope
              ),
              !0
            );
          const t = new URL(e.scope).pathname,
            i = this.config.registrationOptions.scope;
          if (t != i)
            return (
              a.a.info(
                "[changedServiceWorkerParams] ServiceWorker scope changing",
                { a_old: t, b_new: i }
              ),
              !0
            );
          const n = N.a.getAvailableServiceWorker(e),
            o = E.b.getServiceWorkerHref(
              this.config,
              this.context.appConfig.appId,
              m.a.version()
            );
          return (
            null === n ||
            void 0 === n ||
            !n.scriptURL ||
            (o !== n.scriptURL &&
              (a.a.info(
                "[changedServiceWorkerParams] ServiceWorker href changing:",
                {
                  a_old: null === n || void 0 === n ? void 0 : n.scriptURL,
                  b_new: o,
                }
              ),
              !0))
          );
        });
      }
      workerNeedsUpdate() {
        return Object(c.a)(this, void 0, void 0, function* () {
          let e;
          a.a.info(
            "[Service Worker Update] Checking service worker version..."
          );
          try {
            e = yield x.a.timeoutPromise(this.getWorkerVersion(), 2e3);
          } catch (e) {
            return (
              a.a.info(
                "[Service Worker Update] Worker did not reply to version query; assuming older version and updating."
              ),
              !0
            );
          }
          return e !== m.a.version()
            ? (a.a.info(
                `[Service Worker Update] Updating service worker from ${e} --\x3e ${m.a.version()}.`
              ),
              !0)
            : (a.a.info(
                `[Service Worker Update] Service worker version is current at ${e} (no update required).`
              ),
              !1);
        });
      }
      establishServiceWorkerChannel() {
        return Object(c.a)(this, void 0, void 0, function* () {
          a.a.debug("establishServiceWorkerChannel");
          const e = this.context.workerMessenger;
          e.off(),
            e.on(o.b.NotificationDisplayed, (e) =>
              Object(c.a)(this, void 0, void 0, function* () {
                a.a.debug(
                  location.origin,
                  "Received notification display event from service worker."
                ),
                  yield P.a.trigger(OneSignal.EVENTS.NOTIFICATION_DISPLAYED, e);
              })
            ),
            e.on(o.b.NotificationClicked, (e) =>
              Object(c.a)(this, void 0, void 0, function* () {
                let t;
                if (
                  0 ===
                  (t =
                    s.a.getWindowEnv() === r.a.OneSignalProxyFrame
                      ? yield new Promise((e) => {
                          const t = OneSignal.proxyFrame;
                          t &&
                            t.messenger.message(
                              OneSignal.POSTMAM_COMMANDS
                                .GET_EVENT_LISTENER_COUNT,
                              OneSignal.EVENTS.NOTIFICATION_CLICKED,
                              (t) => {
                                const i = t.data;
                                e(i);
                              }
                            );
                        })
                      : OneSignal.emitter.numberOfListeners(
                          OneSignal.EVENTS.NOTIFICATION_CLICKED
                        ))
                ) {
                  a.a.debug(
                    "notification.clicked event received, but no event listeners; storing event in IndexedDb for later retrieval."
                  );
                  let t = e.url;
                  e.url || (t = location.href),
                    yield y.a.put("NotificationOpened", {
                      url: t,
                      data: e,
                      timestamp: Date.now(),
                    });
                } else yield P.a.trigger(OneSignal.EVENTS.NOTIFICATION_CLICKED, e);
              })
            ),
            e.on(o.b.RedirectPage, (e) => {
              a.a.debug(
                `${s.a
                  .getWindowEnv()
                  .toString()} Picked up command.redirect to ${e}, forwarding to host page.`
              );
              const t = OneSignal.proxyFrame;
              t &&
                t.messenger.message(
                  OneSignal.POSTMAM_COMMANDS.SERVICEWORKER_COMMAND_REDIRECT,
                  e
                );
            }),
            e.on(o.b.NotificationDismissed, (e) =>
              Object(c.a)(this, void 0, void 0, function* () {
                yield P.a.trigger(OneSignal.EVENTS.NOTIFICATION_DISMISSED, e);
              })
            );
          const t = d.b.isHttps(),
            i = d.b.isSafari();
          e.on(o.b.AreYouVisible, (n) =>
            Object(c.a)(this, void 0, void 0, function* () {
              if (t && i) {
                const t = {
                  timestamp: n.timestamp,
                  focused: document.hasFocus(),
                };
                yield e.directPostMessageToSW(o.b.AreYouVisibleResponse, t);
              } else {
                const e = { timestamp: n.timestamp },
                  t = OneSignal.proxyFrame;
                t &&
                  t.messenger.message(
                    OneSignal.POSTMAM_COMMANDS.ARE_YOU_VISIBLE_REQUEST,
                    e
                  );
              }
            })
          );
        });
      }
      installWorker() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (!(yield this.shouldInstallWorker())) return;
          a.a.info("Installing worker..."),
            (yield this.getActiveState()) === E.a.ThirdParty &&
              a.a.info(
                "[Service Worker Installation] 3rd party service worker detected."
              );
          const e = E.b.getServiceWorkerHref(
              this.config,
              this.context.appConfig.appId,
              m.a.version()
            ),
            t = `${d.b.getBaseUrl()}${this.config.registrationOptions.scope}`;
          a.a.info(
            `[Service Worker Installation] Installing service worker ${e} ${t}.`
          );
          try {
            yield navigator.serviceWorker.register(e, { scope: t });
          } catch (t) {
            if (
              (a.a.error(
                `[Service Worker Installation] Installing service worker failed ${t}`
              ),
              s.a.getWindowEnv() === r.a.OneSignalSubscriptionPopup)
            )
              throw t;
            const i = yield fetch(e);
            if (403 === i.status || 404 === i.status)
              throw new C(i.status, i.statusText);
            throw t;
          }
          a.a.debug("[Service Worker Installation] Service worker installed."),
            yield this.establishServiceWorkerChannel();
        });
      }
    }
    var T,
      M,
      _,
      j,
      D,
      U = i(13),
      W = i(22),
      R = i(12),
      F = i(31);
    !(function (e) {
      (e[(e.HttpsPermissionRequest = "HTTPS permission request")] =
        "HttpsPermissionRequest"),
        (e[
          (e.FullscreenHttpPermissionMessage =
            "fullscreen HTTP permission message")
        ] = "FullscreenHttpPermissionMessage"),
        (e[
          (e.FullscreenHttpsPermissionMessage =
            "fullscreen HTTPS permission message")
        ] = "FullscreenHttpsPermissionMessage"),
        (e[(e.SlidedownPermissionMessage = "slidedown permission message")] =
          "SlidedownPermissionMessage"),
        (e[(e.SubscriptionBell = "subscription bell")] = "SubscriptionBell");
    })(T || (T = {})),
      ((_ = M || (M = {}))[(_.MissingAppId = 0)] = "MissingAppId"),
      (_[(_.RedundantPermissionMessage = 1)] = "RedundantPermissionMessage"),
      (_[(_.PushPermissionAlreadyGranted = 2)] =
        "PushPermissionAlreadyGranted"),
      (_[(_.UnsupportedEnvironment = 3)] = "UnsupportedEnvironment"),
      (_[(_.MissingDomElement = 4)] = "MissingDomElement"),
      (_[(_.ServiceWorkerNotActivated = 5)] = "ServiceWorkerNotActivated"),
      (_[(_.NoProxyFrame = 6)] = "NoProxyFrame");
    class B extends I.a {
      constructor(e, t) {
        let i;
        switch (e) {
          case M.MissingAppId:
            i = "Missing required app ID.";
            break;
          case M.RedundantPermissionMessage:
            let n = "";
            t &&
              t.permissionPromptType &&
              (n = `(${T[t.permissionPromptType]})`),
              (i = `Another permission message ${n} is being displayed.`);
            break;
          case M.PushPermissionAlreadyGranted:
            i = "Push permission has already been granted.";
            break;
          case M.UnsupportedEnvironment:
            i = "The current environment does not support this operation.";
            break;
          case M.ServiceWorkerNotActivated:
            i = "The service worker must be activated first.";
            break;
          case M.NoProxyFrame:
            i = "No proxy frame.";
        }
        super(i),
          (this.description = M[e]),
          (this.reason = e),
          Object.setPrototypeOf(this, B.prototype);
      }
    }
    ((D = j || (j = {}))[(D.Blocked = 0)] = "Blocked"),
      (D[(D.Dismissed = 1)] = "Dismissed"),
      (D[(D.Default = 2)] = "Default");
    class V extends I.a {
      constructor(e) {
        let t;
        switch (e) {
          case j.Dismissed:
            t = "The user dismissed the permission prompt.";
            break;
          case j.Blocked:
            t = "Notification permissions are blocked.";
            break;
          case j.Default:
            t = "Notification permissions have not been granted yet.";
        }
        super(t), (this.reason = e), Object.setPrototypeOf(this, V.prototype);
      }
    }
    var L,
      H,
      SdkInitError = i(24);
    ((H = L || (L = {}))[(H.InvalidSafariSetup = 0)] = "InvalidSafariSetup"),
      (H[(H.Blocked = 1)] = "Blocked"),
      (H[(H.Dismissed = 2)] = "Dismissed");
    class $ extends I.a {
      constructor(e) {
        let t;
        switch (e) {
          case L.InvalidSafariSetup:
            t =
              "The Safari site URL, icon size, or push certificate is invalid, or Safari is in a private session.";
            break;
          case L.Blocked:
            t = "Notification permissions are blocked.";
            break;
          case L.Dismissed:
            t = "The notification permission prompt was dismissed.";
        }
        super(t), Object.setPrototypeOf(this, $.prototype);
      }
    }
    var z = i(29);
    class K {
      constructor(e, t) {
        (this.context = e), (this.config = t);
      }
      static isSafari() {
        return m.a.isSafari();
      }
      subscribe(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = s.a.getWindowEnv();
          switch (t) {
            case r.a.CustomIframe:
            case r.a.Unknown:
            case r.a.OneSignalProxyFrame:
              throw new B(M.UnsupportedEnvironment);
          }
          let i;
          switch (t) {
            case r.a.ServiceWorker:
              i = yield this.subscribeFcmFromWorker(e);
              break;
            case r.a.Host:
            case r.a.OneSignalSubscriptionModal:
            case r.a.OneSignalSubscriptionPopup:
              if (
                (yield OneSignal.privateGetNotificationPermission()) ===
                n.Denied
              )
                throw new V(j.Blocked);
              if (K.isSafari()) {
                (i = yield this.subscribeSafari()),
                  a.a.info("Installing SW on Safari");
                try {
                  yield this.context.serviceWorkerManager.installWorker(),
                    a.a.info("SW on Safari successfully installed");
                } catch (e) {
                  a.a.error("SW on Safari failed to install.");
                }
              } else i = yield this.subscribeFcmFromPage(e);
              break;
            default:
              throw new B(M.UnsupportedEnvironment);
          }
          return i;
        });
      }
      registerSubscription(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          e && (e = W.a.deserialize(e));
          const i = F.a.createFromPushSubscription(this.config.appId, e, t);
          let n = void 0;
          (yield this.isAlreadyRegisteredWithOneSignal())
            ? yield this.context.updateManager.sendPushDeviceRecordUpdate(i)
            : (n = yield this.context.updateManager.sendPlayerCreate(i)) &&
              (yield this.associateSubscriptionWithEmail(n));
          const o = yield y.a.getSubscription();
          return (
            (o.deviceId = n),
            (o.optedOut = !1),
            e
              ? K.isSafari()
                ? (o.subscriptionToken = e.safariDeviceToken)
                : (o.subscriptionToken = e.w3cEndpoint
                    ? e.w3cEndpoint.toString()
                    : null)
              : (o.subscriptionToken = null),
            yield y.a.setSubscription(o),
            s.a.getWindowEnv() !== r.a.ServiceWorker &&
              P.a.trigger(OneSignal.EVENTS.REGISTERED),
            "undefined" != typeof OneSignal &&
              (OneSignal._sessionInitAlreadyRunning = !1),
            o
          );
        });
      }
      static requestPresubscribeNotificationPermission() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return yield K.requestNotificationPermission();
        });
      }
      unsubscribe(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (0 === e) throw new w.a();
          if (1 !== e) throw new w.a();
          if (s.a.getWindowEnv() !== r.a.ServiceWorker) throw new w.a();
          {
            const { deviceId: e } = yield y.a.getSubscription();
            yield U.a.updatePlayer(this.context.appConfig.appId, e, {
              notification_types: R.a.MutedByApi,
            }),
              yield y.a.put("Options", { key: "optedOut", value: !0 });
          }
        });
      }
      static requestNotificationPermission() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield window.Notification.requestPermission();
          return n[e];
        });
      }
      associateSubscriptionWithEmail(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = yield y.a.getEmailProfile();
          t.subscriptionId &&
            (yield U.a.updatePlayer(this.config.appId, e, {
              parent_player_id: t.subscriptionId,
              email: t.identifier,
            }));
        });
      }
      isAlreadyRegisteredWithOneSignal() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const { deviceId: e } = yield y.a.getSubscription();
          return !!e;
        });
      }
      subscribeSafariPromptPermission() {
        return new Promise((e) => {
          window.safari.pushNotification.requestPermission(
            `${s.a.getOneSignalApiUrl().toString()}/safari`,
            this.config.safariWebId,
            { app_id: this.config.appId },
            (t) => {
              t.deviceToken ? e(t.deviceToken.toLowerCase()) : e(null);
            }
          );
        });
      }
      subscribeSafari() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = new W.a();
          if (!this.config.safariWebId)
            throw new SdkInitError.a(SdkInitError.b.MissingSafariWebId);
          const { deviceToken: t } = window.safari.pushNotification.permission(
            this.config.safariWebId
          );
          (e.existingSafariDeviceToken = t),
            t || P.a.trigger(OneSignal.EVENTS.PERMISSION_PROMPT_DISPLAYED);
          const i = yield this.subscribeSafariPromptPermission();
          if ((z.a.triggerNotificationPermissionChanged(), !i))
            throw new $(L.InvalidSafariSetup);
          return e.setFromSafariSubscription(i), e;
        });
      }
      subscribeFcmFromPage(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (
            s.a.getWindowEnv() !== r.a.ServiceWorker &&
            Notification.permission === n.Default
          ) {
            yield P.a.trigger(OneSignal.EVENTS.PERMISSION_PROMPT_DISPLAYED);
            const e = yield K.requestPresubscribeNotificationPermission();
            switch (
              (e === n.Default &&
                (yield z.a.triggerNotificationPermissionChanged(!0)),
              e)
            ) {
              case n.Default:
                throw (
                  (a.a.debug(
                    "Exiting subscription and not registering worker because the permission was dismissed."
                  ),
                  (OneSignal._sessionInitAlreadyRunning = !1),
                  (OneSignal._isRegisteringForPush = !1),
                  new V(j.Dismissed))
                );
              case n.Denied:
                throw (
                  (a.a.debug(
                    "Exiting subscription and not registering worker because the permission was blocked."
                  ),
                  (OneSignal._sessionInitAlreadyRunning = !1),
                  (OneSignal._isRegisteringForPush = !1),
                  new V(j.Blocked))
                );
            }
          }
          try {
            yield this.context.serviceWorkerManager.installWorker();
          } catch (e) {
            throw (
              (e instanceof C &&
                (403 === e.status
                  ? yield this.context.subscriptionManager.registerFailedSubscription(
                      R.a.ServiceWorkerStatus403,
                      this.context
                    )
                  : 404 === e.status &&
                    (yield this.context.subscriptionManager.registerFailedSubscription(
                      R.a.ServiceWorkerStatus404,
                      this.context
                    ))),
              e)
            );
          }
          a.a.debug(
            "[Subscription Manager] Getting OneSignal service Worker..."
          );
          const t = yield this.context.serviceWorkerManager.getRegistration();
          if (!t) throw new Error("OneSignal service worker not found!");
          return (
            a.a.debug(
              "[Subscription Manager] Service worker is ready to continue subscribing."
            ),
            yield this.subscribeWithVapidKey(t.pushManager, e)
          );
        });
      }
      subscribeFcmFromWorker(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = self.registration;
          if (!t.active && !l.a.firefox)
            throw new B(M.ServiceWorkerNotActivated);
          const i = yield t.pushManager.permissionState({
            userVisibleOnly: !0,
          });
          if ("denied" === i) throw new V(j.Blocked);
          if ("prompt" === i) throw new V(j.Default);
          return yield this.subscribeWithVapidKey(t.pushManager, e);
        });
      }
      getVapidKeyForBrowser() {
        let e = void 0;
        return (e = l.a.firefox
          ? this.config.onesignalVapidPublicKey
          : this.config.vapidPublicKey)
          ? (function (e) {
              const t = (e + "=".repeat((4 - (e.length % 4)) % 4))
                  .replace(/\-/g, "+")
                  .replace(/_/g, "/"),
                i = atob(t),
                n = new Uint8Array(i.length);
              for (let e = 0; e < i.length; ++e) n[e] = i.charCodeAt(e);
              return n;
            })(e).buffer
          : void 0;
      }
      subscribeWithVapidKey(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const i = yield e.getSubscription();
          switch (t) {
            case 0:
              if (!i) break;
              i.options
                ? a.a.debug(
                    "[Subscription Manager] An existing push subscription exists and it's options is not null."
                  )
                : (a.a.debug(
                    "[Subscription Manager] An existing push subscription exists and options is null. Unsubscribing from push first now."
                  ),
                  yield K.doPushUnsubscribe(i));
              break;
            case 1:
              i && (yield K.doPushUnsubscribe(i));
          }
          const [n, o] = yield K.doPushSubscribe(
            e,
            this.getVapidKeyForBrowser()
          );
          yield K.updateSubscriptionTime(o, n.expirationTime);
          const s = W.a.setFromW3cSubscription(n);
          return (
            i &&
              (s.existingW3cPushSubscription = W.a.setFromW3cSubscription(i)),
            s
          );
        });
      }
      static updateSubscriptionTime(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const i = yield y.a.getSubscription();
          e && (i.createdAt = new Date().getTime()),
            (i.expirationTime = t),
            yield y.a.setSubscription(i);
        });
      }
      static doPushUnsubscribe(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          a.a.debug(
            "[Subscription Manager] Unsubscribing existing push subscription."
          );
          const t = yield e.unsubscribe();
          return (
            a.a.debug(
              `[Subscription Manager] Unsubscribing existing push subscription result: ${t}`
            ),
            t
          );
        });
      }
      static doPushSubscribe(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (!t)
            throw new Error(
              "Missing required 'applicationServerKey' to subscribe for push notifications!"
            );
          const i = { userVisibleOnly: !0, applicationServerKey: t };
          a.a.debug(
            "[Subscription Manager] Subscribing to web push with these options:",
            i
          );
          try {
            const t = yield e.getSubscription();
            return [yield e.subscribe(i), !t];
          } catch (t) {
            if ("InvalidStateError" == t.name) {
              a.a.warn(
                "[Subscription Manager] Couldn't re-subscribe due to applicationServerKey changing, unsubscribe and attempting to subscribe with new key.",
                t
              );
              const n = yield e.getSubscription();
              return (
                n && (yield K.doPushUnsubscribe(n)), [yield e.subscribe(i), !0]
              );
            }
            throw t;
          }
        });
      }
      isSubscriptionExpiring() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield s.a.getIntegration(),
            t = s.a.getWindowEnv();
          switch (e) {
            case O.a.Secure:
              return yield this.isSubscriptionExpiringForSecureIntegration();
            case O.a.SecureProxy:
              if (t === r.a.Host) {
                const e = OneSignal.proxyFrameHost;
                if (e)
                  return yield e.runCommand(
                    OneSignal.POSTMAM_COMMANDS.SUBSCRIPTION_EXPIRATION_STATE
                  );
                throw new B(M.NoProxyFrame);
              }
              return yield this.isSubscriptionExpiringForSecureIntegration();
            case O.a.InsecureProxy:
              const { expirationTime: i } = yield y.a.getSubscription();
              return !!i && new Date().getTime() >= i;
          }
        });
      }
      isSubscriptionExpiringForSecureIntegration() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (
            (yield this.context.serviceWorkerManager.getActiveState()) !==
            E.a.OneSignalWorker
          )
            return !1;
          const e = yield this.context.serviceWorkerManager.getRegistration();
          if (!e) return !1;
          if (!e.pushManager) return !1;
          const t = yield e.pushManager.getSubscription();
          if (!t) return !1;
          if (!t.expirationTime) return !1;
          let { createdAt: i } = yield y.a.getSubscription();
          if (!i) {
            const e = 31536e6;
            i = new Date().getTime() + e;
          }
          const n = i + (t.expirationTime - i) / 2;
          return (
            !!t.expirationTime &&
            (new Date().getTime() >= t.expirationTime ||
              new Date().getTime() >= n)
          );
        });
      }
      getSubscriptionState() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (K.isSafari()) return this.getSubscriptionStateForSecure();
          const e = s.a.getWindowEnv();
          switch (e) {
            case r.a.ServiceWorker:
              const t = yield self.registration.pushManager.getSubscription(),
                { optedOut: i } = yield y.a.getSubscription();
              return { subscribed: !!t, optedOut: !!i };
            default:
              switch (yield s.a.getIntegration()) {
                case O.a.Secure:
                  return this.getSubscriptionStateForSecure();
                case O.a.SecureProxy:
                  switch (e) {
                    case r.a.OneSignalProxyFrame:
                    case r.a.OneSignalSubscriptionPopup:
                    case r.a.OneSignalSubscriptionModal:
                      return this.getSubscriptionStateForSecure();
                    default:
                      return yield OneSignal.proxyFrameHost.runCommand(
                        OneSignal.POSTMAM_COMMANDS.GET_SUBSCRIPTION_STATE
                      );
                  }
                case O.a.InsecureProxy:
                  return yield this.getSubscriptionStateForInsecure();
                default:
                  throw new B(M.UnsupportedEnvironment);
              }
          }
        });
      }
      getSubscriptionStateForSecure() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const { deviceId: e, optedOut: t } = yield y.a.getSubscription();
          if (K.isSafari()) {
            const i = window.safari.pushNotification.permission(
              this.config.safariWebId
            );
            return {
              subscribed: !("granted" !== i.permission || !i.deviceToken || !e),
              optedOut: !!t,
            };
          }
          const i = yield this.context.serviceWorkerManager.getActiveState(),
            o = yield this.context.serviceWorkerManager.getRegistration(),
            s = yield this.context.permissionManager.getNotificationPermission(
              this.context.appConfig.safariWebId
            ),
            r = i === E.a.OneSignalWorker;
          return o
            ? { subscribed: !(!e || s !== n.Granted || !r), optedOut: !!t }
            : { subscribed: !1, optedOut: !!t };
        });
      }
      getSubscriptionStateForInsecure() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const {
              deviceId: e,
              subscriptionToken: t,
              optedOut: i,
            } = yield y.a.getSubscription(),
            o = yield this.context.permissionManager.getNotificationPermission(
              this.context.appConfig.safariWebId
            );
          return { subscribed: !(!e || !t || o !== n.Granted), optedOut: !!i };
        });
      }
      registerFailedSubscription(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          t.pageViewManager.isFirstPageView() &&
            (t.subscriptionManager.registerSubscription(new W.a(), e),
            t.pageViewManager.incrementPageViewCount());
        });
      }
    }
    var G = class {
        static getServiceWorkerManager(e) {
          const t = e.appConfig,
            i = s.a.getBuildEnvPrefix(),
            n = {
              workerPath: new S(`/${i}OneSignalSDKWorker.js`),
              registrationOptions: { scope: "/" },
            };
          return (
            t.userConfig &&
              (t.userConfig.path &&
                (n.workerPath = new S(
                  `${t.userConfig.path}${t.userConfig.serviceWorkerPath}`
                )),
              t.userConfig.serviceWorkerParam &&
                (n.registrationOptions = t.userConfig.serviceWorkerParam)),
            new A(e, n)
          );
        }
        static getSubscriptionManager(e) {
          const t = e.appConfig,
            i = {
              safariWebId: t.safariWebId,
              appId: t.appId,
              vapidPublicKey: t.vapidPublicKey,
              onesignalVapidPublicKey: t.onesignalVapidPublicKey,
            };
          return new K(e, i);
        }
      },
      NotSubscribedError = i(26);
    class q {
      static put(e, t) {
        return (
          void 0 === q.store[e] && (q.store[e] = [null, null]),
          q.store[e].push(t),
          q.store[e].length == q.LIMIT + 1 && q.store[e].shift(),
          q.store[e]
        );
      }
      static get(e) {
        return void 0 === q.store[e] && (q.store[e] = [null, null]), q.store[e];
      }
      static getFirst(e) {
        return q.get(e)[0];
      }
      static getLast(e) {
        return q.get(e)[1];
      }
      static remove(e) {
        delete q.store[e];
      }
      static isEmpty(e) {
        const t = q.get(e);
        return null === t[0] && null === t[1];
      }
    }
    (q.store = {}), (q.LIMIT = 2);
    var Y = i(41),
      J = i(32);
    const Q = {
        containerClass: "onesignal-customlink-container",
        subscribeClass: "onesignal-customlink-subscribe",
        explanationClass: "onesignal-customlink-explanation",
        resetClass: "onesignal-reset",
        hide: "hide",
        state: {
          subscribed: "state-subscribed",
          unsubscribed: "state-unsubscribed",
        },
      },
      X = {
        containerSelector: `.${Q.containerClass}`,
        subscribeSelector: `.${Q.subscribeClass}`,
        explanationSelector: `.${Q.explanationClass}`,
      };
    var Z = i(10);
    class ee {
      constructor(e) {
        this.config = e;
      }
      initialize() {
        return Object(c.a)(this, void 0, void 0, function* () {
          var e, t;
          if (
            (null === (e = this.config) || void 0 === e ? void 0 : e.enabled) &&
            (yield this.loadSdkStyles())
          )
            if (
              (a.a.info("OneSignal: initializing customlink"),
              (null === (t = this.config) || void 0 === t
                ? void 0
                : t.unsubscribeEnabled) || !ee.isPushEnabled())
            )
              for (let e = 0; e < this.customlinkContainerElements.length; e++)
                yield this.injectMarkup(this.customlinkContainerElements[e]);
            else this.hideCustomLinkContainers();
        });
      }
      injectMarkup(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          (e.innerHTML = ""),
            yield this.mountExplanationNode(e),
            yield this.mountSubscriptionNode(e);
        });
      }
      mountExplanationNode(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          var t;
          if (null === (t = this.config) || void 0 === t ? void 0 : t.text) {
            if (this.config.text.explanation) {
              const t = document.createElement("p");
              (t.textContent = this.config.text.explanation),
                Object(Z.a)(t, Q.resetClass),
                Object(Z.a)(t, Q.explanationClass),
                this.config.size && Object(Z.a)(t, this.config.size),
                ee.isPushEnabled()
                  ? Object(Z.a)(t, Q.state.subscribed)
                  : Object(Z.a)(t, Q.state.unsubscribed),
                e.appendChild(t);
            }
          } else a.a.error("CustomLink: required property 'text' is missing in the config");
        });
      }
      mountSubscriptionNode(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          var t;
          if (null === (t = this.config) || void 0 === t ? void 0 : t.text) {
            if (this.config.text.subscribe) {
              const t = document.createElement("button");
              Object(Z.a)(t, Q.resetClass),
                Object(Z.a)(t, Q.subscribeClass),
                this.config.size && Object(Z.a)(t, this.config.size),
                this.config.style && Object(Z.a)(t, this.config.style),
                ee.isPushEnabled()
                  ? Object(Z.a)(t, Q.state.subscribed)
                  : Object(Z.a)(t, Q.state.unsubscribed),
                this.setCustomColors(t),
                yield this.setTextFromPushStatus(t),
                t.addEventListener("click", () =>
                  Object(c.a)(this, void 0, void 0, function* () {
                    a.a.info("CustomLink: subscribe clicked"),
                      yield this.handleClick(t);
                  })
                ),
                e.appendChild(t);
            }
          } else a.a.error("CustomLink: required property 'text' is missing in the config");
        });
      }
      loadSdkStyles() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return (
            0 ===
              (yield OneSignal.context.dynamicResourceLoader.loadSdkStylesheet()) ||
            (a.a.debug(
              "Not initializing custom link button because styles failed to load."
            ),
            !1)
          );
        });
      }
      hideElement(e) {
        Object(Z.a)(e, Q.hide);
      }
      hideCustomLinkContainers() {
        this.customlinkContainerElements.forEach((e) => {
          this.hideElement(e);
        });
      }
      handleClick(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          var t, i;
          if (ee.isPushEnabled())
            yield OneSignal.setSubscription(!1),
              yield this.setTextFromPushStatus(e);
          else {
            if (!ee.isOptedOut()) {
              const e = {
                autoAccept: !OneSignal.environmentInfo.requiresUserInteraction,
              };
              return (
                yield OneSignal.registerForPushNotifications(e),
                void (
                  !(null === (t = this.config) || void 0 === t
                    ? void 0
                    : t.unsubscribeEnabled) &&
                  ee.isPushEnabled() &&
                  this.hideCustomLinkContainers()
                )
              );
            }
            yield OneSignal.setSubscription(!0),
              !(null === (i = this.config) || void 0 === i
                ? void 0
                : i.unsubscribeEnabled) &&
                ee.isPushEnabled() &&
                this.hideCustomLinkContainers();
          }
        });
      }
      setTextFromPushStatus(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          var t, i, n, o;
          (null ===
            (i =
              null === (t = this.config) || void 0 === t ? void 0 : t.text) ||
          void 0 === i
            ? void 0
            : i.subscribe) &&
            (ee.isPushEnabled() ||
              (e.textContent = this.config.text.subscribe)),
            (null ===
              (o =
                null === (n = this.config) || void 0 === n ? void 0 : n.text) ||
            void 0 === o
              ? void 0
              : o.unsubscribe) &&
              ee.isPushEnabled() &&
              (e.textContent = this.config.text.unsubscribe);
        });
      }
      setCustomColors(e) {
        var t, i, n, o, s, r, a;
        (null === (t = this.config) || void 0 === t ? void 0 : t.color) &&
          this.config.color.text &&
          ("button" ===
            (null === (i = this.config) || void 0 === i ? void 0 : i.style) &&
          (null === (n = this.config) || void 0 === n ? void 0 : n.color.button)
            ? ((e.style.backgroundColor =
                null === (o = this.config) || void 0 === o
                  ? void 0
                  : o.color.button),
              (e.style.color =
                null === (s = this.config) || void 0 === s
                  ? void 0
                  : s.color.text))
            : "link" ===
                (null === (r = this.config) || void 0 === r
                  ? void 0
                  : r.style) &&
              (e.style.color =
                null === (a = this.config) || void 0 === a
                  ? void 0
                  : a.color.text));
      }
      get customlinkContainerElements() {
        const e = document.querySelectorAll(X.containerSelector);
        return Array.prototype.slice.call(e);
      }
      static isPushEnabled() {
        return b.getIsPushNotificationsEnabled();
      }
      static isOptedOut() {
        return b.getIsOptedOut();
      }
    }
    class te {
      static onNotificationPermissionChange() {
        te.checkAndTriggerSubscriptionChanged();
      }
      static onInternalSubscriptionSet(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          q.put("subscription.optedOut", e);
        });
      }
      static checkAndTriggerSubscriptionChanged() {
        return Object(c.a)(this, void 0, void 0, function* () {
          d.a.logMethodCall("checkAndTriggerSubscriptionChanged");
          const e =
              yield OneSignal.context.subscriptionManager.getSubscriptionState(),
            t = yield OneSignal.privateIsPushNotificationsEnabled(),
            i = yield y.a.getAppState(),
            { lastKnownPushEnabled: n } = i;
          (null === n || t !== n) &&
            (a.a.info(
              "The user's subscription state changed from " +
                `${null === n ? "(not stored)" : n} âŸ¶ ${e.subscribed}`
            ),
            b.setIsPushNotificationsEnabled(t),
            (i.lastKnownPushEnabled = t),
            yield y.a.setAppState(i),
            te.triggerSubscriptionChanged(t));
        });
      }
      static _onSubscriptionChanged(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          te.onSubscriptionChanged_showWelcomeNotification(e),
            te.onSubscriptionChanged_sendCategorySlidedownTags(e),
            te.onSubscriptionChanged_evaluateNotifyButtonDisplayPredicate(),
            te.onSubscriptionChanged_updateCustomLink();
        });
      }
      static onSubscriptionChanged_sendCategorySlidedownTags(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          var t, i;
          if (!0 !== e) return;
          const n =
            null ===
              (i =
                null ===
                  (t = OneSignal.context.appConfig.userConfig.promptOptions) ||
                void 0 === t
                  ? void 0
                  : t.slidedown) || void 0 === i
              ? void 0
              : i.prompts;
          J.a.isCategorySlidedownConfigured(n) &&
            (yield OneSignal.context.tagManager.sendTags(!1));
        });
      }
      static onSubscriptionChanged_showWelcomeNotification(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (OneSignal.__doNotShowWelcomeNotification)
            a.a.debug(
              "Not showing welcome notification because user has previously subscribed."
            );
          else if (!0 === e) {
            const { deviceId: e } = yield y.a.getSubscription(),
              { appId: t } = yield y.a.getAppConfig(),
              i = OneSignal.config.userConfig.welcomeNotification,
              n = void 0 !== i && !0 === i.disable;
            let o =
                void 0 !== i && void 0 !== i.title && null !== i.title
                  ? i.title
                  : "",
              s =
                void 0 !== i &&
                void 0 !== i.message &&
                null !== i.message &&
                i.message.length > 0
                  ? i.message
                  : "Thanks for subscribing!";
            const r = new URL(location.href).origin + "?_osp=do_not_open",
              c = i && i.url && i.url.length > 0 ? i.url : r;
            (o = Y.a.decodeHtmlEntities(o)),
              (s = Y.a.decodeHtmlEntities(s)),
              n ||
                (a.a.debug("Sending welcome notification."),
                U.a.sendNotification(
                  t,
                  [e],
                  { en: o },
                  { en: s },
                  c,
                  null,
                  { __isOneSignalWelcomeNotification: !0 },
                  void 0
                ),
                P.a.trigger(OneSignal.EVENTS.WELCOME_NOTIFICATION_SENT, {
                  title: o,
                  message: s,
                  url: c,
                }));
          }
        });
      }
      static onSubscriptionChanged_evaluateNotifyButtonDisplayPredicate() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (!OneSignal.config.userConfig.notifyButton) return;
          const e = OneSignal.config.userConfig.notifyButton.displayPredicate;
          if (e && "function" == typeof e && OneSignal.notifyButton) {
            !1 !== (yield e())
              ? (a.a.debug(
                  "Showing notify button because display predicate returned true."
                ),
                OneSignal.notifyButton.launcher.show())
              : (a.a.debug(
                  "Hiding notify button because display predicate returned false."
                ),
                OneSignal.notifyButton.launcher.hide());
          }
        });
      }
      static onSubscriptionChanged_updateCustomLink() {
        return Object(c.a)(this, void 0, void 0, function* () {
          OneSignal.config.userConfig.promptOptions &&
            new ee(
              OneSignal.config.userConfig.promptOptions.customlink
            ).initialize();
        });
      }
      static triggerSubscriptionChanged(e) {
        P.a.trigger(OneSignal.EVENTS.SUBSCRIPTION_CHANGED, e);
      }
      static fireStoredNotificationClicks(e = document.URL) {
        return Object(c.a)(this, void 0, void 0, function* () {
          function t(e) {
            return Object(c.a)(this, void 0, void 0, function* () {
              const t = yield y.a.getAppState();
              (t.clickedNotifications[e.url] = null), yield y.a.setAppState(t);
              const { data: i, timestamp: n } = e;
              if (n) {
                if ((Date.now() - n) / 1e3 / 60 > 5) return;
              }
              P.a.trigger(OneSignal.EVENTS.NOTIFICATION_CLICKED, i);
            });
          }
          const i = yield y.a.getAppState();
          if (
            "origin" ===
            (yield y.a.get("Options", "notificationClickHandlerMatch"))
          ) {
            for (const e of Object.keys(i.clickedNotifications))
              if (new URL(e).origin === location.origin) {
                yield t(i.clickedNotifications[e]);
              }
          } else {
            var n = i.clickedNotifications[e];
            if (n) yield t(n);
            else if (!n && e.endsWith("/")) {
              var o = e.substring(0, e.length - 1);
              (n = i.clickedNotifications[o]) && (yield t(n));
            }
          }
        });
      }
    }
    var ie,
      ne = i(18);
    !(function (e) {
      (e.Safari = "safari"),
        (e.Firefox = "firefox"),
        (e.Chrome = "chrome"),
        (e.Opera = "opera"),
        (e.Edge = "edge"),
        (e.Other = "other");
    })(ie || (ie = {}));
    class oe {
      static registerForPush() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = b.getIsPushNotificationsEnabled();
          return yield oe.internalRegisterForPush(e);
        });
      }
      static internalRegisterForPush(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          const t = OneSignal.context;
          let i = null;
          if (e && !t.pageViewManager.isFirstPageView()) {
            a.a.debug(
              "Not registering for push because the user is subscribed and this is not the first page view."
            ),
              a.a.debug("But we want to rekindle their session.");
            const e = yield se.getDeviceId();
            if (e) {
              const t = yield se.createDeviceRecord(OneSignal.config.appId, !0);
              yield OneSignal.context.sessionManager.upsertSession(
                e,
                t,
                ne.b.PageRefresh
              );
            } else
              a.a.error(
                "Should have been impossible to have push as enabled but no device id."
              );
            return null;
          }
          if ("undefined" != typeof OneSignal) {
            if (OneSignal._isRegisteringForPush) return null;
            OneSignal._isRegisteringForPush = !0;
          }
          switch (s.a.getWindowEnv()) {
            case r.a.Host:
            case r.a.OneSignalSubscriptionModal:
              try {
                const e = yield t.subscriptionManager.subscribe(0);
                (i = yield t.subscriptionManager.registerSubscription(e)),
                  t.pageViewManager.incrementPageViewCount(),
                  yield z.a.triggerNotificationPermissionChanged(),
                  yield te.checkAndTriggerSubscriptionChanged();
              } catch (e) {
                a.a.info(e);
              }
              break;
            case r.a.OneSignalSubscriptionPopup:
              const e = opener || parent;
              let o;
              yield t.permissionManager.updateStoredPermission();
              try {
                (o = yield t.subscriptionManager.subscribe(1)),
                  yield t.permissionManager.updateStoredPermission();
              } catch (i) {
                if (
                  (yield t.permissionManager.updateStoredPermission(),
                  i instanceof V)
                )
                  switch (i.reason) {
                    case j.Blocked:
                      yield t.permissionManager.updateStoredPermission(),
                        OneSignal.subscriptionPopup.message(
                          OneSignal.POSTMAM_COMMANDS
                            .REMOTE_NOTIFICATION_PERMISSION_CHANGED,
                          { permission: n.Denied, forceUpdatePermission: !1 }
                        );
                      break;
                    case j.Dismissed:
                      OneSignal.subscriptionPopup.message(
                        OneSignal.POSTMAM_COMMANDS
                          .REMOTE_NOTIFICATION_PERMISSION_CHANGED,
                        { permission: n.Default, forceUpdatePermission: !0 }
                      );
                  }
                if (e) return window.close(), null;
              }
              OneSignal.subscriptionPopup.message(
                OneSignal.POSTMAM_COMMANDS.FINISH_REMOTE_REGISTRATION,
                { rawPushSubscription: o.serialize() },
                (t) => {
                  !0 === t.data.progress
                    ? (a.a.debug(
                        "Got message from host page that remote reg. is in progress, closing popup."
                      ),
                      e && window.close())
                    : a.a.debug(
                        "Got message from host page that remote reg. could not be finished."
                      );
                }
              );
              break;
            default:
              throw (
                ("undefined" != typeof OneSignal &&
                  (OneSignal._isRegisteringForPush = !1),
                new B(M.UnsupportedEnvironment))
              );
          }
          return (
            "undefined" != typeof OneSignal &&
              (OneSignal._isRegisteringForPush = !1),
            i
          );
        });
      }
      static getRawPushSubscriptionForSafari(e) {
        const t = new W.a(),
          { deviceToken: i } = window.safari.pushNotification.permission(e);
        return (t.existingSafariDeviceToken = i), t;
      }
      static getRawPushSubscriptionFromServiceWorkerRegistration(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (!e) return null;
          const t = yield e.pushManager.getSubscription();
          return t ? W.a.setFromW3cSubscription(t) : null;
        });
      }
      static getRawPushSubscriptionWhenUsingSubscriptionWorkaround() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return null;
        });
      }
      static getRawPushSubscription(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (e.browserType === ie.Safari)
            return oe.getRawPushSubscriptionForSafari(t);
          if (e.isUsingSubscriptionWorkaround)
            return oe.getRawPushSubscriptionWhenUsingSubscriptionWorkaround();
          if (e.isBrowserAndSupportsServiceWorkers) {
            const e =
              yield OneSignal.context.serviceWorkerManager.getRegistration();
            return yield oe.getRawPushSubscriptionFromServiceWorkerRegistration(
              e
            );
          }
          return null;
        });
      }
    }
    class se {
      static getCurrentNotificationType() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e =
            yield OneSignal.context.permissionManager.getNotificationPermission(
              OneSignal.context.appConfig.safariWebId
            );
          if (e === n.Default) return R.a.Default;
          if (e === n.Denied)
            return d.a.isUsingSubscriptionWorkaround()
              ? R.a.Default
              : R.a.NotSubscribed;
          const t =
            yield OneSignal.context.subscriptionManager.isAlreadyRegisteredWithOneSignal();
          if (e === n.Granted && t) {
            return (yield OneSignal.privateIsPushNotificationsEnabled())
              ? R.a.Subscribed
              : R.a.MutedByApi;
          }
          return R.a.Default;
        });
      }
      static getNotificationTypeFromOptIn(e) {
        return 1 == e || null == e ? R.a.Subscribed : R.a.MutedByApi;
      }
      static markHttpSlidedownShown() {
        sessionStorage.setItem("ONESIGNAL_HTTP_PROMPT_SHOWN", "true");
      }
      static isHttpPromptAlreadyShown() {
        return "true" == sessionStorage.getItem("ONESIGNAL_HTTP_PROMPT_SHOWN");
      }
      static checkAndTriggerNotificationPermissionChanged() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield y.a.get("Options", "notificationPermission"),
            t = yield OneSignal.getNotificationPermission();
          e !== t &&
            (yield z.a.triggerNotificationPermissionChanged(),
            yield y.a.put("Options", {
              key: "notificationPermission",
              value: t,
            }));
        });
      }
      static getNotificationIcons() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const e = yield se.getAppId();
          if (!e) throw new B(M.MissingAppId);
          const t = `${s.a.getOneSignalApiUrl().toString()}/apps/${e}/icon`,
            i = yield (yield fetch(t)).json();
          if (i.errors)
            throw (
              (a.a.error(
                `API call %c${t}`,
                x.a.getConsoleStyle("code"),
                "failed with:",
                i.errors
              ),
              new Error("Failed to get notification icons."))
            );
          return i;
        });
      }
      static getSlidedownOptions(e) {
        return x.a.getValueOrDefault(e.slidedown, { prompts: [] });
      }
      static getFullscreenPermissionMessageOptions(e) {
        return e
          ? e.fullscreen
            ? {
                autoAcceptTitle: e.fullscreen.autoAcceptTitle,
                actionMessage: e.fullscreen.actionMessage,
                exampleNotificationTitleDesktop: e.fullscreen.title,
                exampleNotificationTitleMobile: e.fullscreen.title,
                exampleNotificationMessageDesktop: e.fullscreen.message,
                exampleNotificationMessageMobile: e.fullscreen.message,
                exampleNotificationCaption: e.fullscreen.caption,
                acceptButton: e.fullscreen.acceptButton,
                cancelButton: e.fullscreen.cancelButton,
              }
            : e
          : null;
      }
      static getPromptOptionsQueryString() {
        let e = "";
        if (
          se.getFullscreenPermissionMessageOptions(
            OneSignal.config.userConfig.promptOptions
          )
        ) {
          const t = se.getPromptOptionsPostHash();
          for (const i of Object.keys(t)) {
            e += "&" + i + "=" + t[i];
          }
        }
        return e;
      }
      static getPromptOptionsPostHash() {
        const e = se.getFullscreenPermissionMessageOptions(
          OneSignal.config.userConfig.promptOptions
        );
        if (e) {
          var t = {
            exampleNotificationTitleDesktop: "exampleNotificationTitle",
            exampleNotificationMessageDesktop: "exampleNotificationMessage",
            exampleNotificationTitleMobile: "exampleNotificationTitle",
            exampleNotificationMessageMobile: "exampleNotificationMessage",
          };
          for (const i of Object.keys(t)) {
            const n = t[i];
            e[i] && (e[n] = e[i]);
          }
          for (
            var i = [
                "autoAcceptTitle",
                "siteName",
                "autoAcceptTitle",
                "subscribeText",
                "showGraphic",
                "actionMessage",
                "exampleNotificationTitle",
                "exampleNotificationMessage",
                "exampleNotificationCaption",
                "acceptButton",
                "cancelButton",
                "timeout",
              ],
              n = {},
              o = 0;
            o < i.length;
            o++
          ) {
            var s = i[o],
              r = e[s],
              a = encodeURIComponent(r);
            (r || !1 === r || "" === r) && (n[s] = a);
          }
        }
        return n;
      }
      static triggerCustomPromptClicked(e) {
        P.a.trigger(OneSignal.EVENTS.CUSTOM_PROMPT_CLICKED, { result: e });
      }
      static getAppId() {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (OneSignal.config.appId)
            return Promise.resolve(OneSignal.config.appId);
          return yield y.a.get("Ids", "appId");
        });
      }
      static createDeviceRecord(e, t = !1) {
        return Object(c.a)(this, void 0, void 0, function* () {
          let i;
          if (t) {
            const e = yield oe.getRawPushSubscription(
              OneSignal.environmentInfo,
              OneSignal.config.safariWebId
            );
            e && (i = e);
          }
          const n = new F.a(i);
          return (
            (n.appId = e),
            (n.subscriptionState = yield se.getCurrentNotificationType()),
            n
          );
        });
      }
      static getDeviceId() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return (
            (yield OneSignal.database.getSubscription()).deviceId || void 0
          );
        });
      }
    }
    var re = i(42);
    class ae {
      constructor(e) {
        (this.context = e),
          (this.onSessionSent = e.pageViewManager.getPageViewCount() > 1);
      }
      isDeviceIdAvailable() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return null != (yield y.a.getSubscription()).deviceId;
        });
      }
      getDeviceId() {
        return Object(c.a)(this, void 0, void 0, function* () {
          const { deviceId: e } = yield y.a.getSubscription();
          if (!e)
            throw new NotSubscribedError.a(NotSubscribedError.b.NoDeviceId);
          return e;
        });
      }
      createDeviceRecord() {
        return Object(c.a)(this, void 0, void 0, function* () {
          return se.createDeviceRecord(this.context.appConfig.appId);
        });
      }
      sendPushDeviceRecordUpdate(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (
            !(yield this.context.subscriptionManager.isAlreadyRegisteredWithOneSignal())
          )
            return void a.a.debug(
              "Not sending the update because user is not registered with OneSignal (no device id)"
            );
          const t = yield this.getDeviceId();
          e || (e = yield this.createDeviceRecord()),
            this.onSessionSent
              ? yield U.a.updatePlayer(
                  this.context.appConfig.appId,
                  t,
                  Object.assign(
                    { notification_types: R.a.Subscribed },
                    e.serialize()
                  )
                )
              : yield this.sendOnSessionUpdate(e);
        });
      }
      sendOnSessionUpdate(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          if (this.onSessionSent) return;
          if (!this.context.pageViewManager.isFirstPageView()) return;
          if (
            !(yield this.context.subscriptionManager.isAlreadyRegisteredWithOneSignal())
          )
            return void a.a.debug(
              "Not sending the on session because user is not registered with OneSignal (no device id)"
            );
          const t = yield this.getDeviceId();
          if (
            (e || (e = yield this.createDeviceRecord()),
            e.subscriptionState === R.a.Subscribed ||
              !0 === OneSignal.config.enableOnSession)
          )
            try {
              this.context.sessionManager.upsertSession(
                t,
                e,
                ne.b.PlayerOnSession
              ),
                (this.onSessionSent = !0);
            } catch (e) {
              a.a.error(
                `Failed to update user session. Error "${e.message}" ${e.stack}`
              );
            }
        });
      }
      sendPlayerCreate(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          yield re.a.addExternalUserIdToDeviceRecord(e);
          try {
            const t = yield U.a.createUser(e);
            return t
              ? (a.a.info(
                  "Subscribed to web push and registered with OneSignal",
                  e,
                  t
                ),
                (this.onSessionSent = !0),
                this.context.sessionManager.upsertSession(
                  t,
                  e,
                  ne.b.PlayerCreate
                ),
                t)
              : void a.a.error("Failed to create user.");
          } catch (e) {
            return void a.a.error(
              `Failed to create user. Error "${e.message}" ${e.stack}`
            );
          }
        });
      }
      onSessionAlreadyCalled() {
        return this.onSessionSent;
      }
      sendExternalUserIdUpdate(e, t) {
        return Object(c.a)(this, void 0, void 0, function* () {
          t || (t = yield y.a.getExternalUserIdAuthHash());
          const i = {
            external_user_id: x.b.getValueOrDefault(e, ""),
            external_user_id_auth_hash: x.b.getValueOrDefault(t, void 0),
          };
          this.context.secondaryChannelManager.synchronizer.setExternalUserId(
            i.external_user_id,
            i.external_user_id_auth_hash
          );
          const n = this.sendPushPlayerUpdate(i);
          (yield this.isDeviceIdAvailable()) && (yield n);
        });
      }
      sendTagsUpdate(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          this.context.secondaryChannelManager.synchronizer.setTags(e);
          const t = { tags: e },
            i = yield y.a.getExternalUserIdAuthHash();
          i && (t.external_user_id_auth_hash = i);
          const n = this.sendPushPlayerUpdate(t);
          (yield this.isDeviceIdAvailable()) && (yield n);
        });
      }
      sendPushPlayerUpdate(e) {
        return Object(c.a)(this, void 0, void 0, function* () {
          let { deviceId: t } = yield y.a.getSubscription();
          if (
            (t ||
              (yield Object(Z.c)(OneSignal.EVENTS.REGISTERED),
              ({ deviceId: t } = yield y.a.getSubscription())),
            t)
          )
            return yield U.a.updatePlayer(this.context.appConfig.appId, t, e);
        });
      }
      sendOutcomeDirect(e, t, i, n) {
        return Object(c.a)(this, void 0, void 0, function* () {
          Object(Z.e)("sendOutcomeDirect");
          const o = yield this.createDeviceRecord(),
            s = {
              app_id: e,
              id: i,
              device_type: o.deliveryPlatform,
              notification_ids: t,
              direct: !0,
            };
          void 0 !== n && (s.weight = n), yield U.a.sendOutcome(s);
        });
      }
      sendOutcomeInfluenced(e, t, i, n) {
        return Object(c.a)(this, void 0, void 0, function* () {
          Object(Z.e)("sendOutcomeInfluenced");
          const o = yield this.createDeviceRecord(),
            s = {
              app_id: e,
              id: i,
              device_type: o.deliveryPlatform,
              notification_ids: t,
              direct: !1,
            };
          void 0 !== n && (s.weight = n), yield U.a.sendOutcome(s);
        });
      }
      sendOutcomeUnattributed(e, t, i) {
        return Object(c.a)(this, void 0, void 0, function* () {
          Object(Z.e)("sendOutcomeUnattributed");
          const n = yield this.createDeviceRecord(),
            o = { app_id: e, id: t, device_type: n.deliveryPlatform };
          void 0 !== i && (o.weight = i), yield U.a.sendOutcome(o);
        });
      }
    }
    class ce {
      constructor(e) {}
      upsertSession(e, t, i) {
        return Object(c.a)(this, void 0, void 0, function* () {});
      }
    }
    var de = i(40);
    i.d(t, "a", function () {
      return ue;
    });
    class ue {
      constructor(e) {
        (this.appConfig = e),
          (this.subscriptionManager = G.getSubscriptionManager(this)),
          (this.serviceWorkerManager = G.getServiceWorkerManager(this)),
          (this.pageViewManager = new v()),
          (this.sessionManager = new ce(this)),
          (this.permissionManager = new p()),
          (this.workerMessenger = new o.a(this)),
          (this.updateManager = new ae(this)),
          (this.secondaryChannelManager = new de.a());
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n = i(0);
    class o {
      constructor() {
        this._channels = [];
      }
      registerChannel(e) {
        this._channels.push(e);
      }
      onSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield Promise.all(this._channels.map((e) => e.onSession()));
        });
      }
      onFocus(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield Promise.all(this._channels.map((t) => t.onFocus(e)));
        });
      }
      setTags(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield Promise.all(this._channels.map((t) => t.setTags(e)));
        });
      }
      setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield Promise.all(
            this._channels.map((i) => i.setExternalUserId(e, t))
          );
        });
      }
    }
    var NotSubscribedError = i(26),
      s = i(1),
      r = i(35),
      a = i(46),
      c = i.n(a),
      d = i(6),
      u = i(5),
      l = i(28),
      p = i(13);
    class g {
      static getPlayer(e, t) {
        return p.a.getPlayer(e, t);
      }
      static updatePlayer(e, t, i) {
        return p.a.updatePlayer(e, t, i);
      }
      static sendNotification(e, t, i, n, o, s, r, a) {
        return p.a.sendNotification(e, t, i, n, o, s, r, a);
      }
      static jsonpLib(e, t) {
        c()(e, null, t);
      }
      static downloadServerAppConfig(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return d.a.getWindowEnv() !== u.a.ServiceWorker
            ? yield new Promise((t, i) => {
                g.jsonpLib(
                  `${d.a.getOneSignalApiUrl().toString()}/sync/${e}/web`,
                  (e, n) => {
                    e ? i(e) : n.success ? t(n) : i(n);
                  }
                );
              })
            : yield l.b.downloadServerAppConfig(e);
        });
      }
      static createUser(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield p.a.createUser(e);
        });
      }
      static logoutEmail(e, t, i) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield p.a.logoutEmail(e, t, i);
        });
      }
      static updateUserSession(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield p.a.updateUserSession(e, t);
        });
      }
    }
    var f = i(2),
      h = i(15);
    class b {
      constructor(e, t, i, n, o) {
        (this.secondaryChannelIdentifierUpdater = e),
          (this.secondaryChannelExternalUserIdUpdater = t),
          (this.secondaryChannelTagsUpdater = i),
          (this.secondaryChannelSessionUpdater = n),
          (this.secondaryChannelFocusUpdater = o);
      }
      logout() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield f.a.getEmailProfile();
          if (!e.subscriptionId)
            return (
              s.a.warn(
                new NotSubscribedError.a(NotSubscribedError.b.NoEmailSet)
              ),
              !1
            );
          const { deviceId: t } = yield f.a.getSubscription();
          if (!t)
            return (
              s.a.warn(
                new NotSubscribedError.a(NotSubscribedError.b.NoDeviceId)
              ),
              !1
            );
          const i = yield f.a.getAppConfig();
          return (yield g.logoutEmail(i, e, t))
            ? (yield f.a.setEmailProfile(new r.a()), !0)
            : (s.a.warn("Failed to logout email."), !1);
        });
      }
      setIdentifier(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const { profileProvider: i } = this.secondaryChannelIdentifierUpdater,
            n = yield i.getProfile(),
            o = yield this.secondaryChannelIdentifierUpdater.setIdentifier(
              e,
              t
            ),
            s = o.subscriptionId;
          if (s) {
            const t = i.newProfile(s, e);
            yield this.updatePushPlayersRelationToEmailPlayer(n, t);
          }
          return (
            yield h.a.trigger(OneSignal.EVENTS.EMAIL_SUBSCRIPTION_CHANGED, {
              email: o.identifier,
            }),
            s
          );
        });
      }
      updatePushPlayersRelationToEmailPlayer(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const { deviceId: i } = yield f.a.getSubscription(),
            n = i,
            o = !!!e.subscriptionId || e.subscriptionId !== t.subscriptionId,
            s = !e.identifier || t.identifier !== e.identifier;
          if (i && n && (o || s)) {
            const e = yield OneSignal.database.getExternalUserIdAuthHash(),
              n = yield f.a.getAppConfig();
            yield g.updatePlayer(n.appId, i, {
              parent_player_id: t.subscriptionId,
              email: t.identifier,
              external_user_id_auth_hash: e,
            });
          }
        });
      }
      onSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelSessionUpdater.sendOnSession();
        });
      }
      onFocus(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelFocusUpdater.sendOnFocus(e);
        });
      }
      setTags(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelTagsUpdater.sendTags(e);
        });
      }
      setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelExternalUserIdUpdater.setExternalUserId(
            e,
            t
          );
        });
      }
    }
    var v = i(42),
      m = i(23),
      S = i(33);
    class y extends S.a {
      constructor(e, t, i, n) {
        super(),
          (this.deliveryPlatform = e),
          (this.identifier = t),
          (this.identifierAuthHash = i),
          (this.pushDeviceRecordId = n);
      }
      serialize() {
        const e = super.serialize();
        return (
          this.identifier && (e.identifier = this.identifier),
          this.identifierAuthHash &&
            (e.identifier_auth_hash = this.identifierAuthHash),
          this.pushDeviceRecordId &&
            (e.device_player_id = this.pushDeviceRecordId),
          e
        );
      }
      deserialize(e) {
        throw new m.a();
      }
    }
    class O {
      constructor(e) {
        this.profileProvider = e;
      }
      setIdentifier(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = yield f.a.getAppConfig(),
            n = yield this.profileProvider.getProfile(),
            o = this.profileProvider.newProfile(n.subscriptionId, e, t);
          if (n.subscriptionId)
            yield g.updatePlayer(i.appId, n.subscriptionId, {
              identifier: e,
              identifier_auth_hash: t,
            });
          else {
            const { deviceId: e } = yield f.a.getSubscription(),
              t = new y(
                this.profileProvider.deviceType,
                o.identifier,
                o.identifierAuthHash,
                e
              );
            (t.appId = i.appId),
              yield v.a.addExternalUserIdToDeviceRecord(t),
              (o.subscriptionId = yield g.createUser(t));
          }
          return (
            o.subscriptionId && (yield this.profileProvider.setProfile(o)), o
          );
        });
      }
    }
    class w {
      constructor(e) {
        this.profileProvider = e;
      }
      sendTags(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = yield this.profileProvider.getSubscriptionId(),
            { appId: i } = yield f.a.getAppConfig(),
            n = (yield this.profileProvider.getProfile()).identifierAuthHash,
            o = { tags: e, identifier_auth_hash: n };
          yield g.updatePlayer(i, t, o);
        });
      }
    }
    class P {
      constructor(e) {
        this.profileProvider = e;
      }
      setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = yield this.profileProvider.getSubscriptionId(),
            { appId: n } = yield f.a.getAppConfig(),
            o = { external_user_id: e, external_user_id_auth_hash: t };
          yield p.a.updatePlayer(n, i, o);
        });
      }
    }
    var I = i(19);
    class k {
      constructor(e) {
        this.profileProvider = e;
      }
      sendOnFocus(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = yield this.profileProvider.getProfile();
          if (!t.subscriptionId) return;
          const i = {
            app_id: (yield f.a.getAppConfig()).appId,
            type: 1,
            state: "ping",
            active_time: e,
            device_type: this.profileProvider.deviceType,
          };
          yield I.b.post(`players/${t.subscriptionId}/on_focus`, i);
        });
      }
    }
    class C {
      constructor(e) {
        this.profileProvider = e;
      }
      sendOnSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield this.profileProvider.getProfile();
          if (!e.subscriptionId) return;
          const t = new y(
              this.profileProvider.deviceType,
              e.identifier,
              e.identifierAuthHash
            ),
            i = yield f.a.getAppConfig();
          t.appId = i.appId;
          const n = yield p.a.updateUserSession(e.subscriptionId, t);
          n !== e.subscriptionId &&
            ((e.subscriptionId = n), yield this.profileProvider.setProfile(e));
        });
      }
    }
    var E = i(30);
    class x {
      constructor() {
        this._pendingGetSubscriptionIdResolvers = [];
      }
      setProfile(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          if (!e.subscriptionId) return;
          const t = e.subscriptionId;
          this._pendingGetSubscriptionIdResolvers.map((e) => {
            e(t);
          }),
            (this._pendingGetSubscriptionIdResolvers = []);
        });
      }
      getSubscriptionId() {
        return Object(n.a)(this, void 0, void 0, function* () {
          const e = yield this.getProfile();
          return e.subscriptionId
            ? e.subscriptionId
            : new Promise((e) => {
                this._pendingGetSubscriptionIdResolvers.push(e);
              });
        });
      }
    }
    class N extends x {
      constructor() {
        super(...arguments), (this.deviceType = E.a.Email);
      }
      newProfile(e, t, i) {
        return new r.a(e, t, i);
      }
      getProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield f.a.getEmailProfile();
        });
      }
      setProfile(e) {
        const t = Object.create(null, {
          setProfile: { get: () => super.setProfile },
        });
        return Object(n.a)(this, void 0, void 0, function* () {
          yield f.a.setEmailProfile(e), yield t.setProfile.call(this, e);
        });
      }
    }
    var A = i(34);
    class T extends x {
      constructor() {
        super(...arguments), (this.deviceType = E.a.SMS);
      }
      newProfile(e, t, i) {
        return new A.a(e, t, i);
      }
      getProfile() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return yield f.a.getSMSProfile();
        });
      }
      setProfile(e) {
        const t = Object.create(null, {
          setProfile: { get: () => super.setProfile },
        });
        return Object(n.a)(this, void 0, void 0, function* () {
          yield f.a.setSMSProfile(e), yield t.setProfile.call(this, e);
        });
      }
    }
    class M {
      constructor(e, t, i, n, o) {
        (this.secondaryChannelIdentifierUpdater = e),
          (this.secondaryChannelExternalUserIdUpdater = t),
          (this.secondaryChannelTagsUpdater = i),
          (this.secondaryChannelSessionUpdater = n),
          (this.secondaryChannelFocusUpdater = o);
      }
      logout() {
        return Object(n.a)(this, void 0, void 0, function* () {
          return (yield f.a.getSMSProfile()).subscriptionId
            ? (yield f.a.setSMSProfile(new A.a()), !0)
            : (s.a.warn(
                new NotSubscribedError.a(NotSubscribedError.b.NoSMSSet)
              ),
              !1);
        });
      }
      setIdentifier(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const i = yield this.secondaryChannelIdentifierUpdater.setIdentifier(
            e,
            t
          );
          return (
            yield h.a.trigger(OneSignal.EVENTS.SMS_SUBSCRIPTION_CHANGED, {
              sms: i.identifier,
            }),
            i.subscriptionId
          );
        });
      }
      onSession() {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelSessionUpdater.sendOnSession();
        });
      }
      onFocus(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelFocusUpdater.sendOnFocus(e);
        });
      }
      setTags(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelTagsUpdater.sendTags(e);
        });
      }
      setExternalUserId(e, t) {
        return Object(n.a)(this, void 0, void 0, function* () {
          yield this.secondaryChannelExternalUserIdUpdater.setExternalUserId(
            e,
            t
          );
        });
      }
    }
    i.d(t, "a", function () {
      return _;
    });
    class _ {
      constructor() {
        this.synchronizer = new o();
        const e = new N(),
          t = new b(new O(e), new P(e), new w(e), new C(e), new k(e));
        (this.email = t), this.synchronizer.registerChannel(t);
        const i = new T(),
          n = new M(new O(i), new P(i), new w(i), new C(i), new k(i));
        (this.sms = n), this.synchronizer.registerChannel(n);
      }
    }
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return o;
    });
    var n = i(9);
    class o {
      static decodeHtmlEntities(e) {
        return (
          n.a.isBrowser() &&
            (o.decodeTextArea ||
              (o.decodeTextArea = document.createElement("textarea"))),
          o.decodeTextArea
            ? ((o.decodeTextArea.innerHTML = e), o.decodeTextArea.value)
            : e
        );
      }
    }
    o.decodeTextArea = null;
  },
  function (e, t, i) {
    "use strict";
    i.d(t, "a", function () {
      return s;
    });
    var n = i(0),
      o = i(2);
    class s {
      static addExternalUserIdToDeviceRecord(e) {
        return Object(n.a)(this, void 0, void 0, function* () {
          const t = yield o.a.getExternalUserId();
          if (!t) return;
          e.externalUserId = t;
          const i = yield o.a.getExternalUserIdAuthHash();
          i && (e.externalUserIdAuthHash = i);
        });
      }
    }
  },
  function (e, t, i) {
    "use strict";
    var n,
      o,
      s,
      r = i(0);
    !(function (e) {
      (e.TypicalSite = "typical"),
        (e.WordPress = "wordpress"),
        (e.Shopify = "shopify"),
        (e.Blogger = "blogger"),
        (e.Magento = "magento"),
        (e.Drupal = "drupal"),
        (e.SquareSpace = "squarespace"),
        (e.Joomla = "joomla"),
        (e.Weebly = "weebly"),
        (e.Wix = "wix"),
        (e.Custom = "custom");
    })(n || (n = {})),
      (function (e) {
        (e.Exact = "exact"), (e.Origin = "origin");
      })(o || (o = {})),
      (function (e) {
        (e.Navigate = "navigate"), (e.Focus = "focus");
      })(s || (s = {}));
    var a = i(5),
      SdkInitError = i(24),
      c = i(6),
      d = i(8),
      u = i(3),
      l = i(21);
    const p = {
        reportingThreshold: 30,
        enableOnSessionForUnsubcribed: !1,
        enableOnFocus: !0,
      },
      g = { pageViews: 1, timeDelay: 0 },
      f = {
        actionMessage:
          "We'd like to show you notifications for the latest news and updates.",
        acceptButton: "Allow",
        cancelButton: "Cancel",
        errorButton: "Try Again",
        categoryDefaults: {
          updateMessage:
            "Update your push notification subscription preferences.",
          positiveUpdateButton: "Save Preferences",
          negativeUpdateButton: "Cancel",
        },
        savingText: "Saving...",
        confirmMessage: "Thank You!",
      },
      h = {
        type: l.a.Push,
        text: {
          actionMessage: f.actionMessage,
          acceptButton: f.acceptButton,
          cancelButton: f.cancelButton,
        },
        autoPrompt: !1,
        delay: g,
      };
    var b = i(10);
    class v {
      static convertTagsApiToBooleans(e) {
        const t = {};
        return (
          Object.keys(e).forEach((i) => {
            t[i] = "1" === e[i];
          }),
          t
        );
      }
      static convertTagsBooleansToApi(e) {
        const t = {};
        return (
          Object.keys(e).forEach((i) => {
            t[i] = !0 === e[i] ? "1" : "0";
          }),
          t
        );
      }
      static getObjectDifference(e, t) {
        const i = {};
        return (
          Object.keys(e).forEach((n) => {
            t[n] !== e[n] && (i[n] = e[n]);
          }),
          i
        );
      }
      static markAllTagsAsSpecified(e, t) {
        e.forEach((e) => {
          e.checked = t;
        });
      }
      static isTagObjectEmpty(e) {
        return 0 === Object.keys(e).length;
      }
      static getCheckedTagCategories(e, t) {
        if (!t) return e;
        if (v.isTagObjectEmpty(t)) {
          const t = Object(b.d)(e);
          return v.markAllTagsAsSpecified(t, !0), t;
        }
        return Object(b.d)(e).map((e) => {
          const i = t[e.tag];
          return (e.checked = v.getCheckedStatusForTagValue(i)), e;
        });
      }
      static getCheckedStatusForTagValue(e) {
        return void 0 === e || e;
      }
      static limitCategoriesToMaxCount(e, t) {
        let i = Object(b.d)(e);
        return (i = e.slice(0, t));
      }
    }
    var m,
      S,
      y = i(32);
    class O {
      static upgradeConfigToVersionTwo(e) {
        var t, i, n;
        O.isPromptOptionsVersion0(e.promptOptions) &&
          (e.promptOptions = O.convertConfigToVersionOne(e.promptOptions)),
          O.isSlidedownConfigVersion1(
            null === (t = e.promptOptions) || void 0 === t
              ? void 0
              : t.slidedown
          ) &&
            (null === (i = e.promptOptions) || void 0 === i
              ? void 0
              : i.slidedown) &&
            (e.promptOptions.slidedown = O.convertConfigToVersionTwo(
              null === (n = e.promptOptions) || void 0 === n
                ? void 0
                : n.slidedown
            ));
      }
      static convertConfigToVersionOne(e) {
        e.slidedown || (e.slidedown = {});
        const {
            acceptButtonText: t,
            cancelButtonText: i,
            actionMessage: n,
          } = e.slidedown,
          o = e.acceptButtonText || e.acceptButton,
          s = e.cancelButtonText || e.cancelButton;
        return (
          (e.slidedown.acceptButtonText = t || o),
          (e.slidedown.cancelButtonText = i || s),
          (e.slidedown.actionMessage = n || e.actionMessage),
          e
        );
      }
      static convertConfigToVersionTwo(e) {
        var t, i, n, o;
        const s = y.a.isCategorySlidedownConfiguredVersion1(e)
          ? l.a.Category
          : l.a.Push;
        let r, a;
        return (
          s === l.a.Category &&
            ((r =
              null === (t = e.categories) || void 0 === t
                ? void 0
                : t.positiveUpdateButton),
            (a =
              null === (i = e.categories) || void 0 === i
                ? void 0
                : i.negativeUpdateButton)),
          {
            prompts: [
              ...(e.prompts || []),
              {
                type: s,
                autoPrompt: e.autoPrompt,
                text: {
                  actionMessage: e.actionMessage,
                  acceptButton: e.acceptButton || e.acceptButtonText,
                  cancelButton: e.cancelButton || e.cancelButtonText,
                  positiveUpdateButton: r,
                  negativeUpdateButton: a,
                  updateMessage:
                    null ===
                      (n =
                        null === e || void 0 === e ? void 0 : e.categories) ||
                    void 0 === n
                      ? void 0
                      : n.updateMessage,
                },
                delay: { pageViews: e.pageViews, timeDelay: e.timeDelay },
                categories:
                  null ===
                    (o = null === e || void 0 === e ? void 0 : e.categories) ||
                  void 0 === o
                    ? void 0
                    : o.tags,
              },
            ],
          }
        );
      }
      static isPromptOptionsVersion0(e) {
        if (e) {
          const t = ["acceptButtonText", "cancelButtonText", "actionMessage"];
          for (let i = 0; i < t.length; i++)
            if (e.hasOwnProperty(t[i])) return !0;
        }
        return !1;
      }
      static isSlidedownConfigVersion1(e) {
        if (e) {
          const t = [
            "enabled",
            "autoPrompt",
            "pageViews",
            "timeDelay",
            "acceptButton",
            "acceptButtonText",
            "cancelButton",
            "cancelButtonText",
            "actionMessage",
            "customizeTextEnabled",
            "categories",
          ];
          for (let i = 0; i < t.length; i++)
            if (e.hasOwnProperty(t[i])) return !0;
        }
        return !1;
      }
    }
    i.d(t, "a", function () {
      return P;
    }),
      ((S = m || (m = {}))[(S.Dashboard = 0)] = "Dashboard"),
      (S[(S.JavaScript = 1)] = "JavaScript");
    const w = 10;
    class P {
      static getAppConfig(e, t) {
        return Object(r.a)(this, void 0, void 0, function* () {
          try {
            if (!e || !e.appId || !d.b.isValidUuid(e.appId))
              throw new SdkInitError.a(SdkInitError.b.InvalidAppId);
            const i = yield t(e.appId);
            O.upgradeConfigToVersionTwo(e);
            const n = this.getMergedConfig(e, i);
            return this.checkRestrictedOrigin(n), n;
          } catch (e) {
            if (e) {
              if (1 === e.code)
                throw new SdkInitError.a(SdkInitError.b.InvalidAppId);
              if (2 === e.code)
                throw new SdkInitError.a(
                  SdkInitError.b.AppNotConfiguredForWebPush
                );
            }
            throw e;
          }
        });
      }
      static checkRestrictedOrigin(e) {
        if (
          e.restrictedOriginEnabled &&
          c.a.getWindowEnv() !== a.a.ServiceWorker &&
          window.top === window &&
          !u.b.contains(window.location.hostname, ".os.tc") &&
          !u.b.contains(window.location.hostname, ".onesignal.com") &&
          !this.doesCurrentOriginMatchConfigOrigin(e.origin)
        )
          throw new SdkInitError.a(SdkInitError.b.WrongSiteUrl, {
            siteUrl: e.origin,
          });
      }
      static doesCurrentOriginMatchConfigOrigin(e) {
        try {
          return location.origin === new URL(e).origin;
        } catch (e) {
          return !1;
        }
      }
      static getIntegrationCapabilities(e) {
        switch (e) {
          case n.Custom:
          case n.WordPress:
            return { configuration: m.JavaScript };
          default:
            return { configuration: m.Dashboard };
        }
      }
      static getMergedConfig(e, t) {
        const i = this.getConfigIntegrationKind(t),
          n = this.getSubdomainForConfigIntegrationKind(i, e, t),
          o = t.config.setupBehavior
            ? t.config.setupBehavior.allowLocalhostAsSecureOrigin
            : e.allowLocalhostAsSecureOrigin,
          s = d.b.internalIsUsingSubscriptionWorkaround(n, o),
          r = this.getUserConfigForConfigIntegrationKind(i, e, t, s);
        return {
          appId: t.app_id,
          subdomain: n,
          siteName: t.config.siteInfo.name,
          origin: t.config.origin,
          httpUseOneSignalCom: t.config.http_use_onesignal_com,
          restrictedOriginEnabled:
            t.features.restrict_origin && t.features.restrict_origin.enable,
          metrics: {
            enable: t.features.metrics.enable,
            mixpanelReportingToken: t.features.metrics.mixpanel_reporting_token,
          },
          safariWebId: t.config.safari_web_id,
          vapidPublicKey: t.config.vapid_public_key,
          onesignalVapidPublicKey: t.config.onesignal_vapid_public_key,
          userConfig: r,
          enableOnSession: u.b.valueOrDefault(
            t.features.enable_on_session,
            p.enableOnSessionForUnsubcribed
          ),
          sessionThreshold: u.b.valueOrDefault(
            t.features.session_threshold,
            p.reportingThreshold
          ),
          enableSessionDuration: u.b.valueOrDefault(
            t.features.web_on_focus_enabled,
            p.enableOnFocus
          ),
        };
      }
      static getConfigIntegrationKind(e) {
        return e.config.integration ? e.config.integration.kind : n.Custom;
      }
      static getCustomLinkConfig(e) {
        const t = {
          enabled: !1,
          style: "button",
          size: "medium",
          unsubscribeEnabled: !1,
          text: { explanation: "", subscribe: "", unsubscribe: "" },
          color: { button: "", text: "" },
        };
        if (
          !(
            e &&
            e.config &&
            e.config.staticPrompts &&
            e.config.staticPrompts.customlink &&
            e.config.staticPrompts.customlink.enabled
          )
        )
          return t;
        const i = e.config.staticPrompts.customlink;
        return {
          enabled: i.enabled,
          style: i.style,
          size: i.size,
          unsubscribeEnabled: i.unsubscribeEnabled,
          text: i.text
            ? {
                subscribe: i.text.subscribe,
                unsubscribe: i.text.unsubscribe,
                explanation: i.text.explanation,
              }
            : t.text,
          color: i.color
            ? { button: i.color.button, text: i.color.text }
            : t.color,
        };
      }
      static injectDefaultsIntoPromptOptions(e, t, i, n = !1) {
        var o, s;
        let r = { enabled: !1 };
        e && e.customlink && (r = e.customlink);
        const a = t.customlink,
          c = Object.assign(Object.assign({}, e), {
            customlink: {
              enabled: u.b.getValueOrDefault(r.enabled, a.enabled),
              style: u.b.getValueOrDefault(r.style, a.style),
              size: u.b.getValueOrDefault(r.size, a.size),
              unsubscribeEnabled: u.b.getValueOrDefault(
                r.unsubscribeEnabled,
                a.unsubscribeEnabled
              ),
              text: {
                subscribe: u.b.getValueOrDefault(
                  r.text ? r.text.subscribe : void 0,
                  a.text.subscribe
                ),
                unsubscribe: u.b.getValueOrDefault(
                  r.text ? r.text.unsubscribe : void 0,
                  a.text.unsubscribe
                ),
                explanation: u.b.getValueOrDefault(
                  r.text ? r.text.explanation : void 0,
                  a.text.explanation
                ),
              },
              color: {
                button: u.b.getValueOrDefault(
                  r.color ? r.color.button : void 0,
                  a.color.button
                ),
                text: u.b.getValueOrDefault(
                  r.color ? r.color.text : void 0,
                  a.color.text
                ),
              },
            },
          });
        if (
          (c.slidedown
            ? (c.slidedown.prompts =
                null ===
                  (s =
                    null === (o = c.slidedown) || void 0 === o
                      ? void 0
                      : o.prompts) || void 0 === s
                  ? void 0
                  : s.map((e) => {
                      var t, i, n, o, s, r, a, c, d;
                      if (
                        ((e.type = u.b.getValueOrDefault(e.type, l.a.Push)),
                        e.type === l.a.Category &&
                          (e.text = Object.assign(Object.assign({}, e.text), {
                            positiveUpdateButton: u.b.getValueOrDefault(
                              null === (t = e.text) || void 0 === t
                                ? void 0
                                : t.positiveUpdateButton,
                              f.categoryDefaults.positiveUpdateButton
                            ),
                            negativeUpdateButton: u.b.getValueOrDefault(
                              null === (i = e.text) || void 0 === i
                                ? void 0
                                : i.negativeUpdateButton,
                              f.categoryDefaults.negativeUpdateButton
                            ),
                            updateMessage: u.b.getValueOrDefault(
                              null === (n = e.text) || void 0 === n
                                ? void 0
                                : n.updateMessage,
                              f.categoryDefaults.updateMessage
                            ),
                          })),
                        (e.text = Object.assign(Object.assign({}, e.text), {
                          actionMessage: u.b.getValueOrDefault(
                            null === (o = e.text) || void 0 === o
                              ? void 0
                              : o.actionMessage,
                            f.actionMessage
                          ),
                          acceptButton: u.b.getValueOrDefault(
                            null === (s = e.text) || void 0 === s
                              ? void 0
                              : s.acceptButton,
                            f.acceptButton
                          ),
                          cancelButton: u.b.getValueOrDefault(
                            null === (r = e.text) || void 0 === r
                              ? void 0
                              : r.cancelButton,
                            f.cancelButton
                          ),
                          confirmMessage: u.b.getValueOrDefault(
                            null === (a = e.text) || void 0 === a
                              ? void 0
                              : a.confirmMessage,
                            f.confirmMessage
                          ),
                        })),
                        (e.autoPrompt = u.b.getValueOrDefault(
                          e.autoPrompt,
                          !0
                        )),
                        (e.delay = {
                          pageViews: u.b.getValueOrDefault(
                            null === (c = e.delay) || void 0 === c
                              ? void 0
                              : c.pageViews,
                            g.pageViews
                          ),
                          timeDelay: u.b.getValueOrDefault(
                            null === (d = e.delay) || void 0 === d
                              ? void 0
                              : d.timeDelay,
                            g.timeDelay
                          ),
                        }),
                        e.categories)
                      ) {
                        const { categories: t } = e;
                        e.categories = v.limitCategoriesToMaxCount(t, w);
                      }
                      return e;
                    }))
            : ((c.slidedown = { prompts: [] }), (c.slidedown.prompts = [h])),
          c.native
            ? ((c.native.enabled = !!c.native.enabled),
              (c.native.autoPrompt = c.native.hasOwnProperty("autoPrompt")
                ? !!c.native.enabled && !!c.native.autoPrompt
                : !!c.native.enabled),
              (c.native.pageViews = u.b.getValueOrDefault(
                c.native.pageViews,
                g.pageViews
              )),
              (c.native.timeDelay = u.b.getValueOrDefault(
                c.native.timeDelay,
                g.timeDelay
              )))
            : (c.native = {
                enabled: !1,
                autoPrompt: !1,
                pageViews: g.pageViews,
                timeDelay: g.timeDelay,
              }),
          !0 === i.autoRegister)
        )
          if (n) {
            (c.native.enabled = !1), (c.native.autoPrompt = !1);
            const e = {
              actionMessage: f.actionMessage,
              acceptButton: f.acceptButton,
              cancelButton: f.cancelButton,
            };
            c.slidedown.prompts = [{ type: l.a.Push, autoPrompt: !0, text: e }];
          } else (c.native.enabled = !0), (c.native.autoPrompt = !0);
        return (
          (c.autoPrompt =
            c.native.autoPrompt ||
            y.a.isSlidedownAutoPromptConfigured(c.slidedown.prompts)),
          c
        );
      }
      static getPromptOptionsForDashboardConfiguration(e) {
        const t = e.config.staticPrompts,
          i = t.native
            ? {
                enabled: t.native.enabled,
                autoPrompt: t.native.enabled && !1 !== t.native.autoPrompt,
                pageViews: u.b.getValueOrDefault(
                  t.native.pageViews,
                  g.pageViews
                ),
                timeDelay: u.b.getValueOrDefault(
                  t.native.timeDelay,
                  g.timeDelay
                ),
              }
            : {
                enabled: !1,
                autoPrompt: !1,
                pageViews: g.pageViews,
                timeDelay: g.timeDelay,
              },
          { prompts: n } = t.slidedown;
        return {
          autoPrompt: i.autoPrompt || y.a.isSlidedownAutoPromptConfigured(n),
          native: i,
          slidedown: { prompts: n },
          fullscreen: {
            enabled: t.fullscreen.enabled,
            actionMessage: t.fullscreen.actionMessage,
            acceptButton: t.fullscreen.acceptButton,
            cancelButton: t.fullscreen.cancelButton,
            title: t.fullscreen.title,
            message: t.fullscreen.message,
            caption: t.fullscreen.caption,
            autoAcceptTitle: t.fullscreen.autoAcceptTitle,
          },
          customlink: this.getCustomLinkConfig(e),
        };
      }
      static getUserConfigForConfigIntegrationKind(e, t, i, n = !1) {
        switch (this.getIntegrationCapabilities(e).configuration) {
          case m.Dashboard:
            return {
              appId: i.app_id,
              autoRegister: !1,
              autoResubscribe: i.config.autoResubscribe,
              path: i.config.serviceWorker.path,
              serviceWorkerPath: i.config.serviceWorker.workerName,
              serviceWorkerParam: {
                scope: i.config.serviceWorker.registrationScope,
              },
              subdomainName: i.config.siteInfo.proxyOrigin,
              promptOptions: this.getPromptOptionsForDashboardConfiguration(i),
              welcomeNotification: {
                disable: !i.config.welcomeNotification.enable,
                title: i.config.welcomeNotification.title,
                message: i.config.welcomeNotification.message,
                url: i.config.welcomeNotification.url,
              },
              notifyButton: {
                enable: i.config.staticPrompts.bell.enabled,
                displayPredicate: i.config.staticPrompts.bell.hideWhenSubscribed
                  ? () => OneSignal.isPushNotificationsEnabled().then((e) => !e)
                  : null,
                size: i.config.staticPrompts.bell.size,
                position: i.config.staticPrompts.bell.location,
                showCredit: !1,
                offset: {
                  bottom: `${i.config.staticPrompts.bell.offset.bottom}px`,
                  left: `${i.config.staticPrompts.bell.offset.left}px`,
                  right: `${i.config.staticPrompts.bell.offset.right}px`,
                },
                colors: {
                  "circle.background": i.config.staticPrompts.bell.color.main,
                  "circle.foreground": i.config.staticPrompts.bell.color.accent,
                  "badge.background": "black",
                  "badge.foreground": "white",
                  "badge.bordercolor": "black",
                  "pulse.color": i.config.staticPrompts.bell.color.accent,
                  "dialog.button.background.hovering":
                    i.config.staticPrompts.bell.color.main,
                  "dialog.button.background.active":
                    i.config.staticPrompts.bell.color.main,
                  "dialog.button.background":
                    i.config.staticPrompts.bell.color.main,
                  "dialog.button.foreground": "white",
                },
                text: {
                  "tip.state.unsubscribed":
                    i.config.staticPrompts.bell.tooltip.unsubscribed,
                  "tip.state.subscribed":
                    i.config.staticPrompts.bell.tooltip.subscribed,
                  "tip.state.blocked":
                    i.config.staticPrompts.bell.tooltip.blocked,
                  "message.prenotify":
                    i.config.staticPrompts.bell.tooltip.unsubscribed,
                  "message.action.subscribing":
                    i.config.staticPrompts.bell.message.subscribing,
                  "message.action.subscribed":
                    i.config.staticPrompts.bell.message.subscribing,
                  "message.action.resubscribed":
                    i.config.staticPrompts.bell.message.subscribing,
                  "message.action.unsubscribed":
                    i.config.staticPrompts.bell.message.unsubscribing,
                  "dialog.main.title":
                    i.config.staticPrompts.bell.dialog.main.title,
                  "dialog.main.button.subscribe":
                    i.config.staticPrompts.bell.dialog.main.subscribeButton,
                  "dialog.main.button.unsubscribe":
                    i.config.staticPrompts.bell.dialog.main.unsubscribeButton,
                  "dialog.blocked.title":
                    i.config.staticPrompts.bell.dialog.blocked.title,
                  "dialog.blocked.message":
                    i.config.staticPrompts.bell.dialog.blocked.message,
                },
              },
              persistNotification: i.config.notificationBehavior
                ? i.config.notificationBehavior.display.persist
                : void 0,
              webhooks: {
                cors: i.config.webhooks.corsEnable,
                "notification.displayed":
                  i.config.webhooks.notificationDisplayedHook,
                "notification.clicked":
                  i.config.webhooks.notificationClickedHook,
                "notification.dismissed":
                  i.config.webhooks.notificationDismissedHook,
              },
              notificationClickHandlerMatch: i.config.notificationBehavior
                ? i.config.notificationBehavior.click.match
                : void 0,
              notificationClickHandlerAction: i.config.notificationBehavior
                ? i.config.notificationBehavior.click.action
                : void 0,
              allowLocalhostAsSecureOrigin: i.config.setupBehavior
                ? i.config.setupBehavior.allowLocalhostAsSecureOrigin
                : void 0,
              requiresUserPrivacyConsent: t.requiresUserPrivacyConsent,
              outcomes: {
                direct: i.config.outcomes.direct,
                indirect: {
                  enabled: i.config.outcomes.indirect.enabled,
                  influencedTimePeriodMin:
                    i.config.outcomes.indirect.notification_attribution
                      .minutes_since_displayed,
                  influencedNotificationsLimit:
                    i.config.outcomes.indirect.notification_attribution.limit,
                },
                unattributed: i.config.outcomes.unattributed,
              },
            };
          case m.JavaScript:
            const o =
                "undefined" != typeof OneSignal &&
                !!OneSignal.SERVICE_WORKER_PARAM,
              s =
                "undefined" != typeof OneSignal &&
                !!OneSignal.SERVICE_WORKER_PATH,
              r = o ? OneSignal.SERVICE_WORKER_PARAM : { scope: "/" },
              a = s ? OneSignal.SERVICE_WORKER_PATH : "OneSignalSDKWorker.js",
              c = Object.assign(
                Object.assign(
                  Object.assign(Object.assign({}, t), {
                    promptOptions: this.injectDefaultsIntoPromptOptions(
                      t.promptOptions,
                      i.config.staticPrompts,
                      t,
                      n
                    ),
                  }),
                  {
                    serviceWorkerParam: t.serviceWorkerParam
                      ? t.serviceWorkerParam
                      : r,
                    serviceWorkerPath: t.serviceWorkerPath
                      ? t.serviceWorkerPath
                      : a,
                    path: t.path ? t.path : "/",
                  }
                ),
                {
                  outcomes: {
                    direct: i.config.outcomes.direct,
                    indirect: {
                      enabled: i.config.outcomes.indirect.enabled,
                      influencedTimePeriodMin:
                        i.config.outcomes.indirect.notification_attribution
                          .minutes_since_displayed,
                      influencedNotificationsLimit:
                        i.config.outcomes.indirect.notification_attribution
                          .limit,
                    },
                    unattributed: i.config.outcomes.unattributed,
                  },
                }
              );
            return (
              t.hasOwnProperty("autoResubscribe")
                ? (c.autoResubscribe = !!t.autoResubscribe)
                : t.hasOwnProperty("autoRegister")
                ? (c.autoResubscribe = !!t.autoRegister)
                : (c.autoResubscribe = !!i.config.autoResubscribe),
              c
            );
        }
      }
      static getSubdomainForConfigIntegrationKind(e, t, i) {
        const n = this.getIntegrationCapabilities(e),
          o = t.subdomainName;
        let s = "";
        switch (n.configuration) {
          case m.Dashboard:
            s = i.config.siteInfo.proxyOriginEnabled
              ? i.config.siteInfo.proxyOrigin
              : void 0;
            break;
          case m.JavaScript:
            s = i.config.subdomain;
        }
        return s && !this.shouldUseServerConfigSubdomain(o, n) ? void 0 : s;
      }
      static shouldUseServerConfigSubdomain(e, t) {
        switch (t.configuration) {
          case m.Dashboard:
            return !0;
          case m.JavaScript:
            switch (location.protocol) {
              case "https:":
                return !!e;
              case "http:":
                return !0;
              default:
                return !1;
            }
        }
      }
    }
  },
  function (e, t) {
    var i;
    i = (function () {
      return this;
    })();
    try {
      i = i || Function("return this")() || (0, eval)("this");
    } catch (e) {
      "object" == typeof window && (i = window);
    }
    e.exports = i;
  },
  function (e, t, i) {
    "use strict";
    function n(e) {
      return new Promise((t) => setTimeout(t, e));
    }
    i.d(t, "a", function () {
      return n;
    });
  },
  function (e, t) {
    e.exports = function (e, t, o) {
      "function" == typeof t && ((o = t), (t = {}));
      t || (t = {});
      var s,
        r,
        a = t.prefix || "__jp",
        c = t.name || a + i++,
        d = t.param || "callback",
        u = null != t.timeout ? t.timeout : 6e4,
        l = encodeURIComponent,
        p = document.getElementsByTagName("script")[0] || document.head;
      u &&
        (r = setTimeout(function () {
          g(), o && o(new Error("Timeout"));
        }, u));
      function g() {
        s.parentNode && s.parentNode.removeChild(s),
          (window[c] = n),
          r && clearTimeout(r);
      }
      return (
        (window[c] = function (e) {
          g(), o && o(null, e);
        }),
        (e = (e += (~e.indexOf("?") ? "&" : "?") + d + "=" + l(c)).replace(
          "?&",
          "?"
        )),
        ((s = document.createElement("script")).src = e),
        p.parentNode.insertBefore(s, p),
        function () {
          window[c] && g();
        }
      );
    };
    var i = 0;
    function n() {}
  },
  function (e, t, i) {
    "use strict";
    (function (e) {
      i.d(t, "a", function () {
        return k;
      });
      var n = i(0),
        o = i(11),
        s = i.n(o),
        r = i(9),
        a = i(7),
        c = i(39),
        d = i(19),
        u = i(28),
        l = i(2),
        p = i(22),
        g = i(12),
        f = i(31),
        h = i(18),
        b = i(4),
        v = i(43),
        m = i(8),
        S = i(3),
        y = i(20),
        O = i(36),
        w = i(33),
        P = i(45);
      const I = 25;
      class k {
        static get VERSION() {
          return r.a.version();
        }
        static get environment() {
          return r.a;
        }
        static get log() {
          return b.a;
        }
        static get database() {
          return l.a;
        }
        static get browser() {
          return s.a;
        }
        static get workerMessenger() {
          return (
            self.workerMessenger || (self.workerMessenger = new a.a(null)),
            self.workerMessenger
          );
        }
        static run() {
          self.addEventListener("activate", k.onServiceWorkerActivated),
            self.addEventListener("push", k.onPushReceived),
            self.addEventListener("notificationclose", k.onNotificationClosed),
            self.addEventListener("notificationclick", (e) =>
              e.waitUntil(k.onNotificationClicked(e))
            ),
            self.addEventListener("pushsubscriptionchange", (e) => {
              e.waitUntil(k.onPushSubscriptionChange(e));
            }),
            self.addEventListener("message", (e) => {
              const t = e.data;
              if (!t || !t.command) return;
              const i = t.payload;
              switch (t.command) {
                case a.b.SessionUpsert:
                  b.a.debug("[Service Worker] Received SessionUpsert", i),
                    k.debounceRefreshSession(e, i);
                  break;
                case a.b.SessionDeactivate:
                  b.a.debug("[Service Worker] Received SessionDeactivate", i),
                    k.debounceRefreshSession(e, i);
                  break;
                default:
                  return;
              }
            }),
            b.a.debug("Setting up message listeners."),
            k.workerMessenger.listen(),
            k.setupMessageListeners();
        }
        static getAppId() {
          return Object(n.a)(this, void 0, void 0, function* () {
            if (self.location.search) {
              const e = self.location.search.match(/appId=([0-9a-z-]+)&?/i);
              if (e && e.length > 1) {
                return e[1];
              }
            }
            const { appId: e } = yield l.a.getAppConfig();
            return e;
          });
        }
        static setupMessageListeners() {
          k.workerMessenger.on(a.b.WorkerVersion, (e) => {
            b.a.debug("[Service Worker] Received worker version message."),
              k.workerMessenger.broadcast(a.b.WorkerVersion, r.a.version());
          }),
            k.workerMessenger.on(a.b.Subscribe, (e) =>
              Object(n.a)(this, void 0, void 0, function* () {
                const t = e;
                b.a.debug("[Service Worker] Received subscribe message.");
                const i = new c.a(t),
                  n = yield i.subscriptionManager.subscribe(0),
                  o = yield i.subscriptionManager.registerSubscription(n);
                k.workerMessenger.broadcast(a.b.Subscribe, o.serialize());
              })
            ),
            k.workerMessenger.on(a.b.SubscribeNew, (e) =>
              Object(n.a)(this, void 0, void 0, function* () {
                const t = e;
                b.a.debug("[Service Worker] Received subscribe new message.");
                const i = new c.a(t),
                  n = yield i.subscriptionManager.subscribe(1),
                  o = yield i.subscriptionManager.registerSubscription(n);
                k.workerMessenger.broadcast(a.b.SubscribeNew, o.serialize());
              })
            ),
            k.workerMessenger.on(a.b.AmpSubscriptionState, (e) =>
              Object(n.a)(this, void 0, void 0, function* () {
                b.a.debug(
                  "[Service Worker] Received AMP subscription state message."
                );
                const e = yield self.registration.pushManager.getSubscription();
                if (e) {
                  const t = yield self.registration.pushManager.permissionState(
                      e.options
                    ),
                    { optedOut: i } = yield l.a.getSubscription(),
                    n = !!e && "granted" === t && !0 !== i;
                  yield k.workerMessenger.broadcast(
                    a.b.AmpSubscriptionState,
                    n
                  );
                } else yield k.workerMessenger.broadcast(a.b.AmpSubscriptionState, !1);
              })
            ),
            k.workerMessenger.on(a.b.AmpSubscribe, () =>
              Object(n.a)(this, void 0, void 0, function* () {
                b.a.debug("[Service Worker] Received AMP subscribe message.");
                const e = yield k.getAppId(),
                  t = yield v.a.getAppConfig(
                    { appId: e },
                    u.b.downloadServerAppConfig
                  ),
                  i = new c.a(t),
                  n = yield i.subscriptionManager.subscribe(0),
                  o = yield i.subscriptionManager.registerSubscription(n);
                yield l.a.put("Ids", { type: "appId", id: e }),
                  k.workerMessenger.broadcast(a.b.AmpSubscribe, o.deviceId);
              })
            ),
            k.workerMessenger.on(a.b.AmpUnsubscribe, () =>
              Object(n.a)(this, void 0, void 0, function* () {
                b.a.debug("[Service Worker] Received AMP unsubscribe message.");
                const e = yield k.getAppId(),
                  t = yield v.a.getAppConfig(
                    { appId: e },
                    u.b.downloadServerAppConfig
                  );
                yield new c.a(t).subscriptionManager.unsubscribe(1),
                  k.workerMessenger.broadcast(a.b.AmpUnsubscribe, null);
              })
            ),
            k.workerMessenger.on(a.b.AreYouVisibleResponse, (e) =>
              Object(n.a)(this, void 0, void 0, function* () {
                if (
                  (b.a.debug(
                    "[Service Worker] Received response for AreYouVisible",
                    e
                  ),
                  !self.clientsStatus)
                )
                  return;
                const t = e.timestamp;
                self.clientsStatus.timestamp === t &&
                  (self.clientsStatus.receivedResponsesCount++,
                  e.focused && (self.clientsStatus.hasAnyActiveSessions = !0));
              })
            ),
            k.workerMessenger.on(a.b.SetLogging, (e) =>
              Object(n.a)(this, void 0, void 0, function* () {
                e.shouldLog ? (self.shouldLog = !0) : (self.shouldLog = void 0);
              })
            );
        }
        static onPushReceived(e) {
          b.a.debug(
            `Called %conPushReceived(${JSON.stringify(e, null, 4)}):`,
            S.a.getConsoleStyle("code"),
            e
          ),
            e.waitUntil(
              k
                .parseOrFetchNotifications(e)
                .then((e) =>
                  Object(n.a)(this, void 0, void 0, function* () {
                    const t = [],
                      i = [],
                      n = yield k.getAppId();
                    for (const o of e) {
                      b.a.debug("Raw Notification from OneSignal:", o);
                      const e = k.buildStructuredNotificationObject(o),
                        s = {
                          notificationId: e.id,
                          appId: n,
                          url: e.url,
                          timestamp: new Date().getTime(),
                        };
                      i.push(l.a.put("NotificationReceived", s)),
                        t.push(
                          ((e) =>
                            k
                              .displayNotification(e)
                              .then(() =>
                                k.workerMessenger
                                  .broadcast(a.b.NotificationDisplayed, e)
                                  .catch((e) => b.a.error(e))
                              )
                              .then(() =>
                                k
                                  .executeWebhooks("notification.displayed", e)
                                  .then(() => k.sendConfirmedDelivery(e))
                                  .catch((e) => b.a.error(e))
                              )).bind(null, e)
                        );
                    }
                    return t.reduce((e, t) => e.then(t), Promise.resolve());
                  })
                )
                .catch((e) => {
                  b.a.debug("Failed to display a notification:", e),
                    k.UNSUBSCRIBED_FROM_NOTIFICATIONS &&
                      b.a.debug(
                        "Because we have just unsubscribed from notifications, we will not show anything."
                      );
                })
            );
        }
        static executeWebhooks(e, t) {
          return Object(n.a)(this, void 0, void 0, function* () {
            const i = yield l.a.get("Options", `webhooks.${e}`);
            if (!i) return null;
            const { deviceId: n } = yield l.a.getSubscription(),
              o = yield l.a.get("Options", "webhooks.cors"),
              s = {
                event: e,
                id: t.id,
                userId: n,
                action: t.action,
                buttons: t.buttons,
                heading: t.heading,
                content: t.content,
                url: t.url,
                icon: t.icon,
                data: t.data,
              },
              r = { method: "post", mode: "no-cors", body: JSON.stringify(s) };
            return (
              o &&
                ((r.mode = "cors"),
                (r.headers = {
                  "X-OneSignal-Event": e,
                  "Content-Type": "application/json",
                })),
              b.a.debug(
                `Executing ${e} webhook ${
                  o ? "with" : "without"
                } CORS %cPOST ${i}`,
                S.a.getConsoleStyle("code"),
                ":",
                s
              ),
              yield fetch(i, r)
            );
          });
        }
        static sendConfirmedDelivery(e) {
          return Object(n.a)(this, void 0, void 0, function* () {
            if (!e) return null;
            if ("y" !== e.rr) return null;
            const t = yield k.getAppId(),
              { deviceId: i } = yield l.a.getSubscription();
            if (!!(!t || !e.id)) return null;
            const n = {
              player_id: i,
              app_id: t,
              device_type: w.a.prototype.getDeliveryPlatform(),
            };
            return (
              b.a.debug(
                `Called %csendConfirmedDelivery(${JSON.stringify(e, null, 4)})`,
                S.a.getConsoleStyle("code")
              ),
              yield Object(P.a)(Math.floor(Math.random() * I * 1e3)),
              yield d.b.put(`notifications/${e.id}/report_received`, n)
            );
          });
        }
        static getActiveClients() {
          return Object(n.a)(this, void 0, void 0, function* () {
            const e = yield self.clients.matchAll({
                type: "window",
                includeUncontrolled: !0,
              }),
              t = [];
            for (const i of e) {
              const e = i;
              if (
                ((e.isSubdomainIframe = !1),
                i.frameType && "nested" === i.frameType)
              ) {
                if (
                  !S.a.contains(i.url, ".os.tc") &&
                  !S.a.contains(i.url, ".onesignal.com")
                )
                  continue;
                e.isSubdomainIframe = !0;
              }
              t.push(e);
            }
            return t;
          });
        }
        static updateSessionBasedOnHasActive(e, t, i) {
          return Object(n.a)(this, void 0, void 0, function* () {
            if (t)
              yield y.b.upsertSession(
                i.sessionThreshold,
                i.enableSessionDuration,
                i.deviceRecord,
                i.deviceId,
                i.sessionOrigin,
                i.outcomesConfig
              );
            else {
              const t = yield y.b.deactivateSession(
                i.sessionThreshold,
                i.enableSessionDuration,
                i.outcomesConfig
              );
              t && ((self.cancel = t.cancel), e.waitUntil(t.promise));
            }
          });
        }
        static refreshSession(e, t) {
          return Object(n.a)(this, void 0, void 0, function* () {
            if ((b.a.debug("[Service Worker] refreshSession"), t.isHttps)) {
              const i = yield self.clients.matchAll({
                type: "window",
                includeUncontrolled: !0,
              });
              if (t.isSafari)
                yield k.checkIfAnyClientsFocusedAndUpdateSession(e, i, t);
              else {
                const n = i.some((e) => e.focused);
                b.a.debug("[Service Worker] isHttps hasAnyActiveSessions", n),
                  yield k.updateSessionBasedOnHasActive(e, n, t);
              }
            } else {
              const i = yield k.getActiveClients();
              yield k.checkIfAnyClientsFocusedAndUpdateSession(e, i, t);
            }
          });
        }
        static checkIfAnyClientsFocusedAndUpdateSession(e, t, i) {
          return Object(n.a)(this, void 0, void 0, function* () {
            const o = new Date().getTime();
            self.clientsStatus = {
              timestamp: o,
              sentRequestsCount: 0,
              receivedResponsesCount: 0,
              hasAnyActiveSessions: !1,
            };
            const s = { timestamp: o };
            t.forEach((e) => {
              self.clientsStatus && self.clientsStatus.sentRequestsCount++,
                e.postMessage({ command: a.b.AreYouVisible, payload: s });
            });
            const r = Object(O.a)(
              () =>
                Object(n.a)(this, void 0, void 0, function* () {
                  self.clientsStatus &&
                    self.clientsStatus.timestamp === o &&
                    (b.a.debug(
                      "updateSessionBasedOnHasActive",
                      self.clientsStatus
                    ),
                    yield k.updateSessionBasedOnHasActive(
                      e,
                      self.clientsStatus.hasAnyActiveSessions,
                      i
                    ),
                    (self.clientsStatus = void 0));
                }),
              0.5
            );
            (self.cancel = r.cancel), e.waitUntil(r.promise);
          });
        }
        static debounceRefreshSession(e, t) {
          b.a.debug("[Service Worker] debounceRefreshSession", t),
            self.cancel && (self.cancel(), (self.cancel = void 0));
          const i = Object(O.a)(
            () =>
              Object(n.a)(this, void 0, void 0, function* () {
                yield k.refreshSession(e, t);
              }),
            1
          );
          (self.cancel = i.cancel), e.waitUntil(i.promise);
        }
        static buildStructuredNotificationObject(e) {
          const t = {
            id: e.custom.i,
            heading: e.title,
            content: e.alert,
            data: e.custom.a,
            url: e.custom.u,
            rr: e.custom.rr,
            icon: e.icon,
            image: e.image,
            tag: e.tag,
            badge: e.badge,
            vibrate: e.vibrate,
          };
          if (e.o) {
            t.buttons = [];
            for (const i of e.o)
              t.buttons.push({ action: i.i, title: i.n, icon: i.p, url: i.u });
          }
          return S.a.trimUndefined(t);
        }
        static ensureImageResourceHttps(e) {
          if (!e) return null;
          try {
            const t = new URL(e);
            return "localhost" === t.hostname ||
              -1 !== t.hostname.indexOf("192.168") ||
              "127.0.0.1" === t.hostname ||
              "https:" === t.protocol
              ? e
              : "i0.wp.com" === t.hostname ||
                "i1.wp.com" === t.hostname ||
                "i2.wp.com" === t.hostname ||
                "i3.wp.com" === t.hostname
              ? `https://${t.hostname}${t.pathname}`
              : `https://i0.wp.com/${t.host + t.pathname}`;
          } catch (e) {}
        }
        static ensureNotificationResourcesHttps(e) {
          if (
            e &&
            (e.icon && (e.icon = k.ensureImageResourceHttps(e.icon)),
            e.image && (e.image = k.ensureImageResourceHttps(e.image)),
            e.buttons && e.buttons.length > 0)
          )
            for (const t of e.buttons)
              t.icon && (t.icon = k.ensureImageResourceHttps(t.icon));
        }
        static displayNotification(e, t) {
          return Object(n.a)(this, void 0, void 0, function* () {
            b.a.debug(
              `Called %cdisplayNotification(${JSON.stringify(e, null, 4)}):`,
              S.a.getConsoleStyle("code"),
              e
            );
            const i = yield k._getTitle(),
              n = yield l.a.get("Options", "defaultIcon"),
              o = yield l.a.get("Options", "persistNotification"),
              s = yield k.getAppId();
            (e.heading = e.heading ? e.heading : i),
              (e.icon = e.icon ? e.icon : n || void 0);
            const r = {};
            (r.tag = e.tag || s),
              (r.persistNotification = !1 !== o),
              t || (t = {}),
              (e = Object.assign(Object.assign({}, e), t)),
              k.ensureNotificationResourcesHttps(e);
            const a = {
              body: e.content,
              icon: e.icon,
              image: e.image,
              data: e,
              actions: e.buttons,
              tag: r.tag,
              requireInteraction: r.persistNotification,
              renotify: !0,
              badge: e.badge,
              vibrate: e.vibrate,
            };
            return self.registration.showNotification(e.heading, a);
          });
        }
        static shouldOpenNotificationUrl(e) {
          return (
            "javascript:void(0);" !== e &&
            "do_not_open" !== e &&
            !S.a.contains(e, "_osp=do_not_open")
          );
        }
        static onNotificationClosed(e) {
          b.a.debug(
            `Called %conNotificationClosed(${JSON.stringify(e, null, 4)}):`,
            S.a.getConsoleStyle("code"),
            e
          );
          const t = e.notification.data;
          k.workerMessenger
            .broadcast(a.b.NotificationDismissed, t)
            .catch((e) => b.a.error(e)),
            e.waitUntil(k.executeWebhooks("notification.dismissed", t));
        }
        static getNotificationUrlToOpen(e) {
          return Object(n.a)(this, void 0, void 0, function* () {
            let t = location.origin;
            const { defaultNotificationUrl: i } = yield l.a.getAppState();
            if ((i && (t = i), e.action))
              for (const i of e.buttons)
                i.action === e.action && i.url && "" !== i.url && (t = i.url);
            else e.url && "" !== e.url && (t = e.url);
            return t;
          });
        }
        static onNotificationClicked(e) {
          return Object(n.a)(this, void 0, void 0, function* () {
            b.a.debug(
              `Called %conNotificationClicked(${JSON.stringify(e, null, 4)}):`,
              S.a.getConsoleStyle("code"),
              e
            ),
              e.notification.close();
            const t = e.notification.data;
            e.action && (t.action = e.action);
            let i = "exact",
              o = "navigate";
            const s = yield l.a.get("Options", "notificationClickHandlerMatch");
            s && (i = s);
            const r = yield this.database.get(
              "Options",
              "notificationClickHandlerAction"
            );
            r && (o = r);
            const c = yield k.getNotificationUrlToOpen(t),
              d = k.shouldOpenNotificationUrl(c),
              u = yield k.getAppId(),
              p = w.a.prototype.getDeliveryPlatform();
            let g;
            const f = {
              notificationId: t.id,
              appId: u,
              url: c,
              timestamp: new Date().getTime(),
            };
            b.a.info("NotificationClicked", f),
              (g = ((e) =>
                Object(n.a)(this, void 0, void 0, function* () {
                  try {
                    const t = yield l.a.getCurrentSession();
                    if (t && t.status === h.c.Active) return;
                    yield l.a.put("NotificationClicked", e),
                      t &&
                        ((t.notificationId = e.notificationId),
                        yield l.a.upsertSession(t));
                  } catch (e) {
                    b.a.error("Failed to save clicked notification.", e);
                  }
                }))(f));
            const { deviceId: v } = yield l.a.getSubscription(),
              m = k.sendConvertedAPIRequests(u, v, t, p),
              y = yield k.getActiveClients();
            let O = !1;
            for (const e of y) {
              let n = e.url;
              if (e.isSubdomainIframe) {
                const e = yield l.a.get("Options", "lastKnownHostUrl");
                (n = e), e || (n = yield l.a.get("Options", "defaultUrl"));
              }
              let s = "";
              try {
                s = new URL(n).origin;
              } catch (e) {
                b.a.error("Failed to get the HTTP site's actual origin:", e);
              }
              let r = null;
              try {
                r = new URL(c).origin;
              } catch (e) {}
              if (("exact" === i && n === c) || ("origin" === i && s === r)) {
                if (
                  (e.isSubdomainIframe && n === c) ||
                  (!e.isSubdomainIframe && e.url === c) ||
                  ("focus" === o && s === r)
                ) {
                  k.workerMessenger.unicast(a.b.NotificationClicked, t, e);
                  try {
                    e instanceof WindowClient && (yield e.focus());
                  } catch (t) {
                    b.a.error("Failed to focus:", e, t);
                  }
                } else if (e.isSubdomainIframe) {
                  try {
                    b.a.debug(
                      "Client is subdomain iFrame. Attempting to focus() client."
                    ),
                      e instanceof WindowClient && (yield e.focus());
                  } catch (t) {
                    b.a.error("Failed to focus:", e, t);
                  }
                  d
                    ? (b.a.debug(`Redirecting HTTP site to ${c}.`),
                      yield l.a.put("NotificationOpened", {
                        url: c,
                        data: t,
                        timestamp: Date.now(),
                      }),
                      k.workerMessenger.unicast(a.b.RedirectPage, c, e))
                    : b.a.debug("Not navigating because link is special.");
                } else if (e instanceof WindowClient && e.navigate) {
                  try {
                    b.a.debug(
                      "Client is standard HTTPS site. Attempting to focus() client."
                    ),
                      e instanceof WindowClient && (yield e.focus());
                  } catch (t) {
                    b.a.error("Failed to focus:", e, t);
                  }
                  try {
                    d
                      ? (b.a.debug(`Redirecting HTTPS site to (${c}).`),
                        yield l.a.put("NotificationOpened", {
                          url: c,
                          data: t,
                          timestamp: Date.now(),
                        }),
                        yield e.navigate(c))
                      : b.a.debug("Not navigating because link is special.");
                  } catch (t) {
                    b.a.error("Failed to navigate:", e, c, t);
                  }
                } else
                  yield l.a.put("NotificationOpened", {
                    url: c,
                    data: t,
                    timestamp: Date.now(),
                  }),
                    yield k.openUrl(c);
                O = !0;
                break;
              }
            }
            return (
              d &&
                !O &&
                (yield l.a.put("NotificationOpened", {
                  url: c,
                  data: t,
                  timestamp: Date.now(),
                }),
                yield k.openUrl(c)),
              g && (yield g),
              yield m
            );
          });
        }
        static sendConvertedAPIRequests(e, t, i, o) {
          return Object(n.a)(this, void 0, void 0, function* () {
            if (!i.id)
              return void console.error(
                "No notification id, skipping networks calls to report open!"
              );
            let n;
            e
              ? (n = d.b.put(`notifications/${i.id}`, {
                  app_id: e,
                  player_id: t,
                  opened: !0,
                  device_type: o,
                }))
              : console.error(
                  "No app Id, skipping OneSignal API call for notification open!"
                ),
              yield k.executeWebhooks("notification.clicked", i),
              n && (yield n);
          });
        }
        static openUrl(e) {
          return Object(n.a)(this, void 0, void 0, function* () {
            b.a.debug("Opening notification URL:", e);
            try {
              return yield self.clients.openWindow(e);
            } catch (t) {
              return b.a.warn(`Failed to open the URL '${e}':`, t), null;
            }
          });
        }
        static onServiceWorkerActivated(e) {
          b.a.info(
            `OneSignal Service Worker activated (version ${r.a.version()})`
          ),
            e.waitUntil(self.clients.claim());
        }
        static onPushSubscriptionChange(e) {
          return Object(n.a)(this, void 0, void 0, function* () {
            b.a.debug(
              `Called %conPushSubscriptionChange(${JSON.stringify(
                e,
                null,
                4
              )}):`,
              S.a.getConsoleStyle("code"),
              e
            );
            const t = yield k.getAppId();
            if (!t) return;
            const i = yield v.a.getAppConfig(
              { appId: t },
              u.b.downloadServerAppConfig
            );
            if (!i) return;
            const n = new c.a(i);
            let o, s;
            {
              let { deviceId: i } = yield l.a.getSubscription();
              if (!(o = !!i) && e.oldSubscription) {
                i = yield u.b.getUserIdFromSubscriptionIdentifier(
                  t,
                  f.a.prototype.getDeliveryPlatform(),
                  e.oldSubscription.endpoint
                );
                const n = yield l.a.getSubscription();
                (n.deviceId = i), yield l.a.setSubscription(n);
              }
              o = !!i;
            }
            const r = e.newSubscription;
            if (r) s = p.a.setFromW3cSubscription(r);
            else
              try {
                s = yield n.subscriptionManager.subscribe(1);
              } catch (e) {}
            if (o || !!s) {
              let e = null;
              "granted" !== Notification.permission
                ? (e = g.a.PermissionRevoked)
                : s || (e = g.a.PushSubscriptionRevoked),
                yield n.subscriptionManager.registerSubscription(s, e);
            } else yield l.a.remove("Ids", "userId"), yield l.a.remove("Ids", "registrationId");
          });
        }
        static _getTitle() {
          return new Promise((e) => {
            Promise.all([
              l.a.get("Options", "defaultTitle"),
              l.a.get("Options", "pageTitle"),
            ]).then(([t, i]) => {
              e(null !== t ? t : null != i ? i : "");
            });
          });
        }
        static parseOrFetchNotifications(e) {
          if (!e || !e.data)
            return Promise.reject("Missing event.data on push payload!");
          return k.isValidPushPayload(e.data)
            ? (b.a.debug("Received a valid encrypted push payload."),
              Promise.resolve([e.data.json()]))
            : Promise.reject(
                `Unexpected push message payload received: ${e.data}`
              );
        }
        static isValidPushPayload(e) {
          try {
            const t = e.json();
            return (
              !!(t && t.custom && t.custom.i && m.a.isValidUuid(t.custom.i)) ||
              (b.a.debug(
                "isValidPushPayload: Valid JSON but missing notification UUID:",
                t
              ),
              !1)
            );
          } catch (e) {
            return (
              b.a.debug("isValidPushPayload: Parsing to JSON failed with:", e),
              !1
            );
          }
        }
      }
      "undefined" == typeof self && void 0 !== e
        ? (e.OneSignalWorker = k)
        : (self.OneSignalWorker = k),
        "undefined" != typeof self && k.run();
    }.call(this, i(44)));
  },
  function (e, t) {
    e.exports = function () {
      throw new Error("define cannot be used indirect");
    };
  },
  function (e, t, i) {
    "use strict";
    i.r(t);
    var n = i(47);
    self.OneSignal = n.a;
  },
]);
//# sourceMappingURL=OneSignalSDKWorker.js.map
