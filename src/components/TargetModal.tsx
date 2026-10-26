import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  DialogButton,
  DropdownItem,
  Focusable,
  ModalRoot,
  TextField,
  ToggleField,
} from "@decky/ui";
import { formatString, getTranslations } from "../i18n";
import { VpnConnection, WolTarget } from "../types";

export interface TargetModalProps {
  closeModal?: () => void;
  existingTarget?: WolTarget;
  vpns: VpnConnection[];
  onSave: (target: Partial<WolTarget>) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (targetId: string) => Promise<void>;
}

export const TargetModal: FC<TargetModalProps> = ({
  closeModal,
  existingTarget,
  vpns,
  onSave,
  onDelete,
}) => {
  const t = useMemo(() => getTranslations(), []);

  const [name, setName] = useState<string>(existingTarget?.name ?? "Gaming PC");
  const [mac, setMac] = useState<string>(existingTarget?.mac ?? "");
  const [ip, setIp] = useState<string>(existingTarget?.ip ?? "");
  const [broadcastIp, setBroadcastIp] = useState<string>(
    existingTarget?.broadcast_ip ?? ""
  );
  const [port, setPort] = useState<string>(String(existingTarget?.port ?? 9));
  const [vpnId, setVpnId] = useState<string>(existingTarget?.vpn_id ?? "");
  const [wakeTrigger, setWakeTrigger] = useState<boolean>(
    existingTarget?.wake_trigger ?? existingTarget?.fritzbox_trigger ?? true
  );
  const [routerPassword, setRouterPassword] = useState<string>(
    existingTarget?.router_password ?? ""
  );
  const [routerUser, setRouterUser] = useState<string>(
    existingTarget?.router_user ?? ""
  );
  const [routerIp, setRouterIp] = useState<string>(
    existingTarget?.router_ip ?? ""
  );
  const [sshEnabled, setSshEnabled] = useState<boolean>(
    existingTarget?.ssh_enabled ?? false
  );
  const [sshUser, setSshUser] = useState<string>(
    existingTarget?.ssh_user ?? ""
  );
  const [sshPassword, setSshPassword] = useState<string>(
    existingTarget?.ssh_password ?? ""
  );
  const [sshPort, setSshPort] = useState<string>(
    String(existingTarget?.ssh_port ?? 22)
  );
  const [sshOs, setSshOs] = useState<string>(
    existingTarget?.ssh_os ?? "windows"
  );
  const [sshAutoLogin, setSshAutoLogin] = useState<boolean>(
    existingTarget?.ssh_auto_login ?? false
  );
  const [sshPin, setSshPin] = useState<string>(
    existingTarget?.ssh_pin ?? ""
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = modalRef.current;
    if (!root) return;
    const inputs = root.querySelectorAll<HTMLInputElement>(".vpn-wol-password-field input");
    inputs.forEach((inp) => {
      try {
        inp.type = "password";
        inp.style.setProperty("-webkit-text-security", "disc", "important");
      } catch {
        // ignore
      }
    });
  }, [sshEnabled, sshOs, sshAutoLogin, routerPassword, sshPassword, sshPin]);

  const vpnOptions = [
    { data: "", label: t.fieldVpnNone },
    ...vpns.map((v) => ({
      data: v.id,
      label: `${v.name} (${v.backend})`,
    })),
  ];

  const handleSave = async () => {
    setErrorMsg("");
    if (!mac.trim()) {
      setErrorMsg(t.errMacRequired);
      return;
    }
    if (sshEnabled && sshOs === "windows" && sshAutoLogin && !sshPin.trim()) {
      setErrorMsg(t.errPinRequired);
      return;
    }
    setSaving(true);
    try {
      const res = await onSave({
        id: existingTarget?.id,
        name: name.trim() || "PC",
        mac: mac.trim(),
        ip: ip.trim(),
        broadcast_ip: broadcastIp.trim(),
        port: parseInt(port, 10) || 9,
        vpn_id: vpnId,
        wake_trigger: wakeTrigger,
        router_password: routerPassword,
        router_user: routerUser.trim(),
        router_ip: routerIp.trim(),
        ssh_enabled: sshEnabled,
        ssh_user: sshUser.trim(),
        ssh_password: sshPassword,
        ssh_port: parseInt(sshPort, 10) || 22,
        ssh_os: (sshOs as "windows" | "linux") || "windows",
        ssh_auto_login: sshOs === "windows" ? sshAutoLogin : false,
        ssh_pin: sshPin,
      });
      if (res.success) {
        closeModal?.();
      } else {
        setErrorMsg(res.error || t.errSaveFailed);
      }
    } catch (e: any) {
      setErrorMsg(String(e?.message || e || t.errSaveFailed));
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

  return (
    <ModalRoot onCancel={closeModal} closeModal={closeModal}>
      <div
        ref={modalRef}
        style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px" }}
      >
        <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#ffffff" }}>
          {existingTarget
            ? formatString(t.modalTitleEdit, { name: existingTarget.name })
            : t.modalTitleNew}
        </h2>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "rgba(220, 53, 69, 0.25)",
              border: "1px solid #dc3545",
              borderRadius: "6px",
              padding: "8px 12px",
              color: "#ff858f",
              fontSize: "13px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <TextField
          label={t.fieldPcNameLabel}
          value={name}
          onChange={(e) => setName(e.target.value)}
          description={t.fieldPcNameDesc}
        />

        <TextField
          label={t.fieldMacLabel}
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          description={t.fieldMacDesc}
        />

        <TextField
          label={t.fieldIpLabel}
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          description={t.fieldIpDesc}
        />

        <DropdownItem
          label={t.fieldVpnLabel}
          description={t.fieldVpnDesc}
          rgOptions={vpnOptions}
          selectedOption={vpnId}
          onChange={(opt) => setVpnId(String(opt.data ?? ""))}
        />

        <div className="vpn-wol-password-field">
          <TextField
            label={t.fieldRouterPasswordLabel}
            value={routerPassword}
            bIsPassword={true}
            {...({ type: "password" } as any)}
            onChange={(e) => setRouterPassword(e.target.value)}
            description={t.fieldRouterPasswordDesc}
          />
        </div>

        <TextField
          label={t.fieldRouterUserLabel}
          value={routerUser}
          onChange={(e) => setRouterUser(e.target.value)}
          description={t.fieldRouterUserDesc}
        />

        <TextField
          label={t.fieldRouterIpLabel}
          value={routerIp}
          onChange={(e) => setRouterIp(e.target.value)}
          description={t.fieldRouterIpDesc}
        />

        <ToggleField
          label={t.fieldWakeTriggerLabel}
          description={t.fieldWakeTriggerDesc}
          checked={wakeTrigger}
          onChange={(val) => setWakeTrigger(val)}
        />

        <TextField
          label={t.fieldBroadcastLabel}
          value={broadcastIp}
          onChange={(e) => setBroadcastIp(e.target.value)}
          description={t.fieldBroadcastDesc}
        />

        <TextField
          label={t.fieldPortLabel}
          value={port}
          mustBeNumeric={true}
          onChange={(e) => setPort(e.target.value)}
          description={t.fieldPortDesc}
        />

        <ToggleField
          label={t.fieldSshEnableLabel}
          description={t.fieldSshEnableDesc}
          checked={sshEnabled}
          onChange={(val) => setSshEnabled(val)}
        />

        {sshEnabled && (
          <>
            <TextField
              label={t.fieldSshUserLabel}
              value={sshUser}
              onChange={(e) => setSshUser(e.target.value)}
              description={t.fieldSshUserDesc}
            />

            <div className="vpn-wol-password-field">
              <TextField
                label={t.fieldSshPasswordLabel}
                value={sshPassword}
                bIsPassword={true}
                {...({ type: "password" } as any)}
                onChange={(e) => setSshPassword(e.target.value)}
                description={t.fieldSshPasswordDesc}
              />
            </div>

            <DropdownItem
              label={t.fieldSshOsLabel}
              description={t.fieldSshOsDesc}
              rgOptions={[
                { data: "windows", label: "Windows (shutdown /s /t 0)" },
                { data: "linux", label: "Linux (systemctl poweroff)" },
              ]}
              selectedOption={sshOs}
              onChange={(opt) => setSshOs(String(opt.data ?? "windows"))}
            />

            <TextField
              label={t.fieldSshPortLabel}
              value={sshPort}
              mustBeNumeric={true}
              onChange={(e) => setSshPort(e.target.value)}
              description={t.fieldSshPortDesc}
            />

            {sshOs === "windows" && (
              <>
                <ToggleField
                  label={t.fieldSshAutoLoginLabel}
                  description={t.fieldSshAutoLoginDesc}
                  checked={sshAutoLogin}
                  onChange={(val) => setSshAutoLogin(val)}
                />

                {sshAutoLogin && (
                  <div className="vpn-wol-password-field">
                    <TextField
                      label={t.fieldSshPinLabel}
                      value={sshPin}
                      bIsPassword={true}
                      {...({ type: "password" } as any)}
                      onChange={(e) => setSshPin(e.target.value)}
                      description={t.fieldSshPinDesc}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        <Focusable
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          {existingTarget && onDelete && (
            <DialogButton
              className="vpn-wol-btn vpn-wol-btn-danger"
              style={{
                flex: "1",
              }}
              disabled={saving}
              onClick={handleDelete}
            >
              {t.btnDelete}
            </DialogButton>
          )}

          <DialogButton
            className="vpn-wol-btn"
            style={{ flex: "1" }}
            disabled={saving}
            onClick={() => closeModal?.()}
          >
            {t.btnCancel}
          </DialogButton>

          <DialogButton
            className="vpn-wol-btn vpn-wol-btn-primary"
            style={{
              fontWeight: 600,
              flex: "1.5",
            }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? t.btnSaving : t.btnSave}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
