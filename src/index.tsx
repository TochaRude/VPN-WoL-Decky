import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ButtonItem,
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ToggleField,
  showModal,
  staticClasses,
} from "@decky/ui";
import { definePlugin, toaster, useQuickAccessVisible } from "@decky/api";
import {
  deleteWolTarget,
  getInitialState,
  pingTarget,
  saveWolTarget,
  sendWol,
  setVpnState,
} from "./api";
import { formatString, getTranslations } from "./i18n";
import { PingStatus, VpnConnection, WolTarget } from "./types";
import { TargetModal } from "./components/TargetModal";

const PluginIcon: FC = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <circle cx="12" cy="15" r="1" />
  </svg>
);

const Content: FC = () => {
  const t = useMemo(() => getTranslations(), []);
  const isVisible = useQuickAccessVisible ? useQuickAccessVisible() : true;

  const [vpns, setVpns] = useState<VpnConnection[]>([]);
  const [targets, setTargets] = useState<WolTarget[]>([]);
  const [pingStatuses, setPingStatuses] = useState<Record<string, PingStatus>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [switchingVpnId, setSwitchingVpnId] = useState<string | null>(null);
  const [wakingTargetIds, setWakingTargetIds] = useState<Record<string, boolean>>({});

  const mountedRef = useRef<boolean>(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshState = useCallback(async (showSpinner = false) => {
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

  useEffect(() => {
    refreshState(true);
  }, [refreshState]);

  // Poll status every 5s while the Quick Access Menu is visible
  useEffect(() => {
    if (!isVisible) return;
    refreshState(false);
    const interval = setInterval(() => {
      refreshState(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible, refreshState]);

  const handleToggleVpn = async (vpn: VpnConnection, enable: boolean) => {
    setSwitchingVpnId(vpn.id);
    try {
      const res = await setVpnState(vpn.id, enable);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: `VPN: ${vpn.name}`,
          body: enable ? t.toastVpnConnected : t.toastVpnDisconnected,
        });
        setTimeout(() => {
          if (mountedRef.current) refreshState(false);
        }, 800);
      } else {
        toaster.toast({
          title: `${t.toastVpnErrorTitle} (${vpn.name})`,
          body: res.error || "Error",
        });
      }
    } catch (e: any) {
      toaster.toast({
        title: `${t.toastVpnErrorTitle} (${vpn.name})`,
        body: String(e?.message || e),
      });
    } finally {
      if (mountedRef.current) {
        setSwitchingVpnId(null);
      }
    }
  };

  const watchHostWakeup = useCallback(
    async (target: WolTarget) => {
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
              title: formatString(t.toastPcOnlineTitle, { name: target.name }),
              body: `${formatString(t.toastPcOnlineBody, { ip: target.ip })}${
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
    },
    [t]
  );

  const handleWakeTarget = async (target: WolTarget) => {
    setWakingTargetIds((prev) => ({ ...prev, [target.id]: true }));
    try {
      const res = await sendWol(target.id, true);
      if (mountedRef.current && res.vpns) {
        setVpns(res.vpns);
      }
      if (res.success) {
        toaster.toast({
          title: t.toastWolSentTitle,
          body: formatString(t.toastWolSentBody, { name: target.name }),
        });
        watchHostWakeup(target);
      } else {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
        toaster.toast({
          title: t.toastWolFailedTitle,
          body: res.error || "Error",
        });
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setWakingTargetIds((prev) => ({ ...prev, [target.id]: false }));
      }
      toaster.toast({
        title: t.toastWolFailedTitle,
        body: String(e?.message || e),
      });
    }
  };

  const openTargetModal = (existing?: WolTarget) => {
    showModal(
      <TargetModal
        existingTarget={existing}
        vpns={vpns}
        onSave={async (targetData) => {
          const res = await saveWolTarget(targetData);
          if (res.success && mountedRef.current) {
            setTargets(res.targets || []);
            setTimeout(() => {
              if (mountedRef.current) refreshState(false);
            }, 300);
          }
          return { success: res.success, error: res.error };
        }}
        onDelete={
          existing
            ? async (targetId) => {
                const res = await deleteWolTarget(targetId);
                if (mountedRef.current) {
                  setTargets(res.targets || []);
                }
              }
            : undefined
        }
      />
    );
  };

  return (
    <div>
      {/* 1. VPN Section */}
      <PanelSection title={t.vpnSectionTitle} spinner={loading}>
        {vpns.length === 0 && !loading ? (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", color: "#969696", padding: "4px 0" }}>
              {t.noVpnsFound}
            </div>
          </PanelSectionRow>
        ) : (
          vpns.map((vpn) => {
            const isSwitching = switchingVpnId === vpn.id;
            const dotColor = isSwitching
              ? "#f39c12"
              : vpn.active
              ? "#2ecc71"
              : "#7f8c8d";
            const statusText = isSwitching
              ? t.statusSwitching
              : vpn.active
              ? `${t.statusConnected}${vpn.ip ? ` • ${vpn.ip}` : ""}${
                  vpn.interface ? ` (${vpn.interface})` : ""
                }`
              : `${t.statusDisconnected} • ${
                  vpn.backend === "nmcli" ? "NetworkManager" : "wg-quick"
                }`;

            return (
              <PanelSectionRow key={vpn.id}>
                <ToggleField
                  label={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: dotColor,
                          boxShadow: vpn.active ? `0 0 6px ${dotColor}` : "none",
                        }}
                      />
                      <span style={{ fontWeight: 600 }}>{vpn.name}</span>
                    </div>
                  }
                  description={statusText}
                  checked={vpn.active}
                  disabled={isSwitching}
                  onChange={(checked) => handleToggleVpn(vpn, checked)}
                />
              </PanelSectionRow>
            );
          })
        )}

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => refreshState(true)}
            disabled={loading || switchingVpnId !== null}
          >
            {t.refreshStatus}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* 2. Wake-on-LAN Section */}
      <PanelSection title={t.wolSectionTitle}>
        {targets.length === 0 ? (
          <PanelSectionRow>
            <div style={{ fontSize: "12px", color: "#969696", padding: "4px 0" }}>
              {t.noTargetsConfigured}
            </div>
          </PanelSectionRow>
        ) : (
          targets.map((target) => {
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
              ? `${t.badgeOnline}${ping?.latency_ms != null ? ` (${ping.latency_ms} ms)` : ""}`
              : isWaking
              ? t.badgeWaking
              : target.ip
              ? t.badgeOffline
              : t.badgeReady;

            return (
              <PanelSectionRow key={target.id}>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "8px",
                    boxSizing: "border-box",
                    border: isOnline
                      ? "1px solid rgba(46, 204, 113, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  {/* Header: Name + Status Badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#ffffff" }}>
                      {target.name}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: badgeColor,
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: badgeColor,
                        }}
                      />
                      {badgeText}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div style={{ fontSize: "11px", color: "#b0b8c0", marginBottom: "8px", lineHeight: 1.4 }}>
                    <div>
                      {target.ip ? `IP: ${target.ip} • ` : ""}
                      MAC: {target.mac}
                    </div>
                    {linkedVpn && (
                      <div style={{ color: linkedVpn.active ? "#7bed9f" : "#eccc68" }}>
                        VPN: {linkedVpn.name} (
                        {linkedVpn.active ? t.statusConnected : t.vpnAutoStartHint})
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <Focusable
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                    }}
                  >
                    <DialogButton
                      style={{
                        flex: "1",
                        padding: "8px 10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        backgroundColor: needsVpnActivation
                          ? "#2980b9"
                          : "#1a9fff",
                        color: "#ffffff",
                      }}
                      disabled={isWaking}
                      onClick={() => handleWakeTarget(target)}
                    >
                      {isWaking
                        ? t.btnSendingWol
                        : needsVpnActivation
                        ? t.btnStartVpnAndWake
                        : t.btnWakePc}
                    </DialogButton>

                    <DialogButton
                      style={{
                        width: "auto",
                        minWidth: "42px",
                        padding: "8px 12px",
                        fontSize: "13px",
                      }}
                      onClick={() => openTargetModal(target)}
                    >
                      ✎
                    </DialogButton>
                  </Focusable>
                </div>
              </PanelSectionRow>
            );
          })
        )}

        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => openTargetModal(undefined)}>
            {t.btnAddPc}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </div>
  );
};

export default definePlugin(() => {
  return {
    name: "VPN & Wake-on-LAN",
    titleView: <div className={staticClasses.Title}>VPN & Wake-on-LAN</div>,
    content: <Content />,
    icon: <PluginIcon />,
  };
});
