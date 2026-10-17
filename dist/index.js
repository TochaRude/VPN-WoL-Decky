const manifest = {
  name: "VPN & Wake-on-LAN",
  author: "VPN-WoL",
  flags: ["root"],
  api_version: 1,
  publish: {
    tags: ["vpn", "wireguard", "wol", "wake-on-lan", "network", "root"],
    description:
      "Liest vorhandene VPN-Verbindungen (NetworkManager & WireGuard) zum Umschalten aus und weckt PCs per Wake-on-LAN über das VPN (inkl. FritzBox-Unterstützung).",
    image: "https://opengraph.githubassets.com/1/SteamDeckHomebrew/decky-plugin-template",
  },
};

const API_VERSION = 2;
if (!manifest?.name) {
  throw new Error("[@decky/api]: Failed to find plugin manifest.");
}
const internalAPIConnection =
  window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
  throw new Error(
    "[@decky/api]: Failed to connect to the loader as the loader API was not initialized."
  );
}
let api;
try {
  api = internalAPIConnection.connect(API_VERSION, manifest.name);
} catch {
  api = internalAPIConnection.connect(1, manifest.name);
  console.warn(
    `[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1.`
  );
}

const callable = api.callable;
const toaster = api.toaster;
const useQuickAccessVisible = api.useQuickAccessVisible;
const definePlugin = (fn) => (...args) => fn(...args);

// Backend API Callables
const getInitialState = callable("get_initial_state");
const setVpnState = callable("set_vpn_state");
const saveWolTarget = callable("save_wol_target");
const deleteWolTarget = callable("delete_wol_target");
const pingTarget = callable("ping_target");
const sendWol = callable("send_wol");

// Target Configuration Modal
const TargetModal = ({ closeModal, existingTarget, vpns, onSave, onDelete }) => {
  const [name, setName] = SP_REACT.useState(existingTarget?.name ?? "Gaming PC");
  const [mac, setMac] = SP_REACT.useState(existingTarget?.mac ?? "");
  const [ip, setIp] = SP_REACT.useState(existingTarget?.ip ?? "192.168.178.");
  const [broadcastIp, setBroadcastIp] = SP_REACT.useState(
    existingTarget?.broadcast_ip ?? ""
  );
  const [port, setPort] = SP_REACT.useState(String(existingTarget?.port ?? 9));
  const [vpnId, setVpnId] = SP_REACT.useState(existingTarget?.vpn_id ?? "");
  const [fritzboxTrigger, setFritzboxTrigger] = SP_REACT.useState(
    existingTarget?.fritzbox_trigger ?? true
  );
  const [errorMsg, setErrorMsg] = SP_REACT.useState("");
  const [saving, setSaving] = SP_REACT.useState(false);

  const vpnOptions = [
    { data: "", label: "Kein festes VPN (aktuelles Netzwerk nutzen)" },
    ...vpns.map((v) => ({
      data: v.id,
      label: `${v.name} (${v.backend})`,
    })),
  ];

  const handleSave = async () => {
    setErrorMsg("");
    if (!mac.trim()) {
      setErrorMsg("Bitte gib die MAC-Adresse deines PCs ein (z.B. AA:BB:CC:DD:EE:FF).");
      return;
    }
    setSaving(true);
    try {
      const res = await onSave({
        id: existingTarget?.id,
        name: name.trim() || "Mein PC",
        mac: mac.trim(),
        ip: ip.trim(),
        broadcast_ip: broadcastIp.trim(),
        port: parseInt(port, 10) || 9,
        vpn_id: vpnId,
        fritzbox_trigger: fritzboxTrigger,
      });
      if (res.success) {
        closeModal?.();
      } else {
        setErrorMsg(res.error || "Fehler beim Speichern des PC-Profils.");
      }
    } catch (e) {
      setErrorMsg(String(e?.message || e || "Unbekannter Fehler"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingTarget?.id || !onDelete) return;
    setSaving(true);
    try {
      await onDelete(existingTarget.id);
      closeModal?.();
    } finally {
      setSaving(false);
    }
  };

  return SP_JSX.jsx(DFL.ModalRoot, {
    onCancel: closeModal,
    closeModal: closeModal,
    children: SP_JSX.jsxs("div", {
      style: { display: "flex", flexDirection: "column", gap: "10px", padding: "4px" },
      children: [
        SP_JSX.jsx("h2", {
          style: { margin: "0 0 6px 0", fontSize: "18px", color: "#ffffff" },
          children: existingTarget
            ? `PC bearbeiten: ${existingTarget.name}`
            : "Neuen PC (Wake-on-LAN) anlegen",
        }),
        errorMsg
          ? SP_JSX.jsx("div", {
              style: {
                backgroundColor: "rgba(220, 53, 69, 0.25)",
                border: "1px solid #dc3545",
                borderRadius: "6px",
                padding: "8px 12px",
                color: "#ff858f",
                fontSize: "13px",
              },
              children: errorMsg,
            })
          : null,
        SP_JSX.jsx(DFL.TextField, {
          label: "Name des PCs",
          value: name,
          onChange: (e) => setName(e.target.value),
          description: "Anzeigename im Quick Access Menü (z.B. Gaming PC)",
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: "MAC-Adresse (Pflichtfeld)",
          value: mac,
          onChange: (e) => setMac(e.target.value),
          description: "Format: AA:BB:CC:DD:EE:FF oder AA-BB-CC-DD-EE-FF",
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: "Lokale IP-Adresse des PCs (Heimnetz / FritzBox)",
          value: ip,
          onChange: (e) => setIp(e.target.value),
          description:
            "Wird für Live-Ping-Status, direktes WireGuard-Unicast-WoL und Subnet-Broadcast (z.B. 192.168.178.20) genutzt",
        }),
        SP_JSX.jsx(DFL.DropdownItem, {
          label: "Zugehöriges VPN",
          description:
            "Wird bei 'VPN starten & PC wecken' automatisch vor dem Aufwecken verbunden",
          rgOptions: vpnOptions,
          selectedOption: vpnId,
          onChange: (opt) => setVpnId(String(opt.data ?? "")),
        }),
        SP_JSX.jsx(DFL.ToggleField, {
          label: "FritzBox Auto-Wake Trigger",
          description:
            "Sendet zusätzlich Ping- & TCP-Pakete an die PC-IP (weckt den PC auch über die FritzBox-Option 'Computer starten bei Zugriff')",
          checked: fritzboxTrigger,
          onChange: (val) => setFritzboxTrigger(val),
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: "Abweichende Broadcast-IP (Optional)",
          value: broadcastIp,
          onChange: (e) => setBroadcastIp(e.target.value),
          description:
            "Leer lassen für automatische Berechnung aus der PC-IP (z.B. 192.168.178.255)",
        }),
        SP_JSX.jsx(DFL.TextField, {
          label: "UDP-Port",
          value: port,
          mustBeNumeric: true,
          onChange: (e) => setPort(e.target.value),
          description:
            "Standard ist 9 (Plugin sendet zur Sicherheit auf Port 9, 7 und diesem Port)",
        }),
        SP_JSX.jsxs(DFL.Focusable, {
          style: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "10px",
            marginTop: "12px",
          },
          children: [
            existingTarget && onDelete
              ? SP_JSX.jsx(DFL.DialogButton, {
                  style: {
                    backgroundColor: "rgba(220, 53, 69, 0.35)",
                    color: "#ff9ea5",
                    flex: "1",
                  },
                  disabled: saving,
                  onClick: handleDelete,
                  children: "Löschen",
                })
              : null,
            SP_JSX.jsx(DFL.DialogButton, {
              style: { flex: "1" },
              disabled: saving,
              onClick: () => closeModal?.(),
              children: "Abbrechen",
            }),
            SP_JSX.jsx(DFL.DialogButton, {
              style: {
                backgroundColor: "#1a9fff",
                color: "#ffffff",
                fontWeight: 600,
                flex: "1.5",
              },
              disabled: saving,
              onClick: handleSave,
              children: saving ? "Speichere..." : "Speichern",
            }),
          ],
        }),
      ],
    }),
  });
};

const PluginIcon = () =>
  SP_JSX.jsxs("svg", {
    width: "1em",
    height: "1em",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    children: [
      SP_JSX.jsx("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }),
      SP_JSX.jsx("path", { d: "M12 8v4" }),
      SP_JSX.jsx("circle", { cx: "12", cy: "15", r: "1" }),
    ],
  });

const Content = () => {
  const isVisible = useQuickAccessVisible ? useQuickAccessVisible() : true;

  const [vpns, setVpns] = SP_REACT.useState([]);
  const [targets, setTargets] = SP_REACT.useState([]);
  const [pingStatuses, setPingStatuses] = SP_REACT.useState({});
  const [loading, setLoading] = SP_REACT.useState(true);
  const [switchingVpnId, setSwitchingVpnId] = SP_REACT.useState(null);
  const [wakingTargetIds, setWakingTargetIds] = SP_REACT.useState({});

  const mountedRef = SP_REACT.useRef(true);
  SP_REACT.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshState = SP_REACT.useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    try {
      const state = await getInitialState();
      if (!mountedRef.current) return;
      setVpns(state.vpns || []);
      setTargets(state.targets || []);
      setPingStatuses(state.ping_status || {});
    } catch (e) {
      console.error("[VPN-WoL] Failed to refresh state:", e);
    } finally {
      if (mountedRef.current && showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  SP_REACT.useEffect(() => {
    refreshState(true);
  }, [refreshState]);

  SP_REACT.useEffect(() => {
    if (!isVisible) return;
    refreshState(false);
    const interval = setInterval(() => {
      refreshState(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, refreshState]);

  const handleToggleVpn = async (vpn, enable) => {
    setSwitchingVpnId(vpn.id);
    try {
      const res = await setVpnState(vpn.id, enable);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: `VPN: ${vpn.name}`,
          body: enable ? "Verbindung hergestellt." : "Verbindung getrennt.",
        });
        setTimeout(() => {
          if (mountedRef.current) refreshState(false);
        }, 800);
      } else {
        toaster.toast({
          title: `VPN-Fehler (${vpn.name})`,
          body: res.error || "Konnte VPN-Status nicht ändern.",
        });
      }
    } catch (e) {
      toaster.toast({
        title: `VPN-Fehler (${vpn.name})`,
        body: String(e?.message || e),
      });
    } finally {
      if (mountedRef.current) {
        setSwitchingVpnId(null);
      }
    }
  };

  const watchHostWakeup = SP_REACT.useCallback(async (target) => {
    if (!target.ip) {
      setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
      return;
    }
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      if (!mountedRef.current) return;
      try {
        const p = await pingTarget(target.ip);
        if (!mountedRef.current) return;
        setPingStatuses((prev) => ({ ...prev, [target.id]: p }));
        if (p.online) {
          setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
          toaster.toast({
            title: `${target.name} ist online!`,
            body: `Antwort von ${target.ip}${
              p.latency_ms !== null ? ` (${p.latency_ms} ms)` : ""
            }`,
          });
          return;
        }
      } catch {
        // ignore transient ping errors while booting
      }
    }
    if (mountedRef.current) {
      setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
    }
  }, []);

  const handleWakeTarget = async (target) => {
    setWakingTargetIds((prev) => ({ ...prev, [target.id]: true }));
    try {
      const res = await sendWol(target.id, true);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: "Wake-on-LAN gesendet",
          body: res.message || `Magic Packet an ${target.name} gesendet.`,
        });
        watchHostWakeup(target);
      } else {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
        toaster.toast({
          title: "Wake-on-LAN fehlgeschlagen",
          body: res.error || "Unbekannter Fehler beim Senden.",
        });
      }
    } catch (e) {
      if (mountedRef.current) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
      }
      toaster.toast({
        title: "Wake-on-LAN Fehler",
        body: String(e?.message || e),
      });
    }
  };

  const openTargetModal = (existing) => {
    DFL.showModal(
      SP_JSX.jsx(TargetModal, {
        existingTarget: existing,
        vpns: vpns,
        onSave: async (targetData) => {
          const res = await saveWolTarget(targetData);
          if (res.success && mountedRef.current) {
            setTargets(res.targets || []);
            setTimeout(() => {
              if (mountedRef.current) refreshState(false);
            }, 300);
          }
          return { success: res.success, error: res.error };
        },
        onDelete: existing
          ? async (targetId) => {
              const res = await deleteWolTarget(targetId);
              if (mountedRef.current) {
                setTargets(res.targets || []);
              }
            }
          : undefined,
      })
    );
  };

  return SP_JSX.jsxs("div", {
    children: [
      SP_JSX.jsxs(DFL.PanelSection, {
        title: "VPN-Verbindungen",
        spinner: loading,
        children: [
          vpns.length === 0 && !loading
            ? SP_JSX.jsx(DFL.PanelSectionRow, {
                children: SP_JSX.jsx("div", {
                  style: { fontSize: "12px", color: "#969696", padding: "4px 0" },
                  children:
                    "Keine VPN-Profile in NetworkManager (nmcli) oder /etc/wireguard gefunden.",
                }),
              })
            : vpns.map((vpn) => {
                const isSwitching = switchingVpnId === vpn.id;
                const dotColor = isSwitching
                  ? "#f39c12"
                  : vpn.active
                  ? "#2ecc71"
                  : "#7f8c8d";
                const statusText = isSwitching
                  ? "Schalte um..."
                  : vpn.active
                  ? `Verbunden${vpn.ip ? ` • ${vpn.ip}` : ""}${
                      vpn.interface ? ` (${vpn.interface})` : ""
                    }`
                  : `Getrennt • ${
                      vpn.backend === "nmcli" ? "NetworkManager" : "wg-quick"
                    }`;

                return SP_JSX.jsx(
                  DFL.PanelSectionRow,
                  {
                    children: SP_JSX.jsx(DFL.ToggleField, {
                      label: SP_JSX.jsxs("div", {
                        style: { display: "flex", alignItems: "center", gap: "8px" },
                        children: [
                          SP_JSX.jsx("span", {
                            style: {
                              display: "inline-block",
                              width: "9px",
                              height: "9px",
                              borderRadius: "50%",
                              backgroundColor: dotColor,
                              boxShadow: vpn.active ? `0 0 6px ${dotColor}` : "none",
                            },
                          }),
                          SP_JSX.jsx("span", {
                            style: { fontWeight: 600 },
                            children: vpn.name,
                          }),
                        ],
                      }),
                      description: statusText,
                      checked: vpn.active,
                      disabled: isSwitching,
                      onChange: (checked) => handleToggleVpn(vpn, checked),
                    }),
                  },
                  vpn.id
                );
              }),
          SP_JSX.jsx(DFL.PanelSectionRow, {
            children: SP_JSX.jsx(DFL.ButtonItem, {
              layout: "below",
              onClick: () => refreshState(true),
              disabled: loading || switchingVpnId !== null,
              children: "Status aktualisieren",
            }),
          }),
        ],
      }),
      SP_JSX.jsxs(DFL.PanelSection, {
        title: "Wake-on-LAN (PCs)",
        children: [
          targets.length === 0
            ? SP_JSX.jsx(DFL.PanelSectionRow, {
                children: SP_JSX.jsx("div", {
                  style: { fontSize: "12px", color: "#969696", padding: "4px 0" },
                  children:
                    "Noch kein PC-Profil eingerichtet. Füge deinen PC hinzu, um ihn über das VPN aufzuwecken.",
                }),
              })
            : targets.map((target) => {
                const ping = pingStatuses[target.id];
                const isOnline = Boolean(ping?.online);
                const isWaking = Boolean(wakingTargetIds[target.id]);
                const linkedVpn = target.vpn_id
                  ? vpns.find((v) => v.id === target.vpn_id || v.name === target.vpn_id)
                  : undefined;
                const needsVpnActivation = Boolean(linkedVpn && !linkedVpn.active);

                const badgeColor = isOnline
                  ? "#2ecc71"
                  : isWaking
                  ? "#f39c12"
                  : "#95a5a6";
                const badgeText = isOnline
                  ? `Online${ping?.latency_ms != null ? ` (${ping.latency_ms} ms)` : ""}`
                  : isWaking
                  ? "Wecke auf..."
                  : target.ip
                  ? "Offline"
                  : "Bereit";

                return SP_JSX.jsx(
                  DFL.PanelSectionRow,
                  {
                    children: SP_JSX.jsxs("div", {
                      style: {
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                        border: isOnline
                          ? "1px solid rgba(46, 204, 113, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                      },
                      children: [
                        SP_JSX.jsxs("div", {
                          style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "4px",
                          },
                          children: [
                            SP_JSX.jsx("span", {
                              style: {
                                fontWeight: 700,
                                fontSize: "15px",
                                color: "#ffffff",
                              },
                              children: target.name,
                            }),
                            SP_JSX.jsxs("span", {
                              style: {
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: badgeColor,
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                padding: "2px 8px",
                                borderRadius: "10px",
                              },
                              children: [
                                SP_JSX.jsx("span", {
                                  style: {
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    backgroundColor: badgeColor,
                                  },
                                }),
                                badgeText,
                              ],
                            }),
                          ],
                        }),
                        SP_JSX.jsxs("div", {
                          style: {
                            fontSize: "11px",
                            color: "#b0b8c0",
                            marginBottom: "8px",
                            lineHeight: 1.4,
                          },
                          children: [
                            SP_JSX.jsxs("div", {
                              children: [
                                target.ip ? `IP: ${target.ip} • ` : "",
                                `MAC: ${target.mac}`,
                              ],
                            }),
                            linkedVpn
                              ? SP_JSX.jsxs("div", {
                                  style: {
                                    color: linkedVpn.active ? "#7bed9f" : "#eccc68",
                                  },
                                  children: [
                                    `VPN: ${linkedVpn.name} (`,
                                    linkedVpn.active
                                      ? "Verbunden"
                                      : "Wird automatisch gestartet",
                                    ")",
                                  ],
                                })
                              : null,
                          ],
                        }),
                        SP_JSX.jsxs(DFL.Focusable, {
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            gap: "8px",
                          },
                          children: [
                            SP_JSX.jsx(DFL.DialogButton, {
                              style: {
                                flex: "1",
                                padding: "8px 10px",
                                fontSize: "13px",
                                fontWeight: 600,
                                backgroundColor: needsVpnActivation
                                  ? "#2980b9"
                                  : "#1a9fff",
                                color: "#ffffff",
                              },
                              disabled: isWaking,
                              onClick: () => handleWakeTarget(target),
                              children: isWaking
                                ? "Sende WoL..."
                                : needsVpnActivation
                                ? "⚡ VPN starten & wecken"
                                : "⚡ PC wecken (WoL)",
                            }),
                            SP_JSX.jsx(DFL.DialogButton, {
                              style: {
                                width: "auto",
                                minWidth: "42px",
                                padding: "8px 12px",
                                fontSize: "13px",
                              },
                              onClick: () => openTargetModal(target),
                              children: "✎",
                            }),
                          ],
                        }),
                      ],
                    }),
                  },
                  target.id
                );
              }),
          SP_JSX.jsx(DFL.PanelSectionRow, {
            children: SP_JSX.jsx(DFL.ButtonItem, {
              layout: "below",
              onClick: () => openTargetModal(undefined),
              children: "+ Neuen PC hinzufügen",
            }),
          }),
        ],
      }),
    ],
  });
};

var index = definePlugin(() => {
  return {
    name: "VPN & Wake-on-LAN",
    titleView: SP_JSX.jsx("div", {
      className: DFL.staticClasses.Title,
      children: "VPN & Wake-on-LAN",
    }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(PluginIcon, {}),
  };
});

export { index as default };
