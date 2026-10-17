import { FC, useState } from "react";
import {
  DialogButton,
  DropdownItem,
  Focusable,
  ModalRoot,
  TextField,
  ToggleField,
} from "@decky/ui";
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
  const [name, setName] = useState<string>(existingTarget?.name ?? "Gaming PC");
  const [mac, setMac] = useState<string>(existingTarget?.mac ?? "");
  const [ip, setIp] = useState<string>(existingTarget?.ip ?? "192.168.178.");
  const [broadcastIp, setBroadcastIp] = useState<string>(
    existingTarget?.broadcast_ip ?? ""
  );
  const [port, setPort] = useState<string>(String(existingTarget?.port ?? 9));
  const [vpnId, setVpnId] = useState<string>(existingTarget?.vpn_id ?? "");
  const [fritzboxTrigger, setFritzboxTrigger] = useState<boolean>(
    existingTarget?.fritzbox_trigger ?? true
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

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
    } catch (e: any) {
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

  return (
    <ModalRoot onCancel={closeModal} closeModal={closeModal}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "4px" }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#ffffff" }}>
          {existingTarget ? `PC bearbeiten: ${existingTarget.name}` : "Neuen PC (Wake-on-LAN) anlegen"}
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
          label="Name des PCs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          description="Anzeigename im Quick Access Menü (z.B. Gaming PC)"
        />

        <TextField
          label="MAC-Adresse (Pflichtfeld)"
          value={mac}
          onChange={(e) => setMac(e.target.value)}
          description="Format: AA:BB:CC:DD:EE:FF oder AA-BB-CC-DD-EE-FF"
        />

        <TextField
          label="Lokale IP-Adresse des PCs (Heimnetz / FritzBox)"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          description="Wird für Live-Ping-Status, direktes WireGuard-Unicast-WoL und Subnet-Broadcast (z.B. 192.168.178.20) genutzt"
        />

        <DropdownItem
          label="Zugehöriges VPN"
          description="Wird bei 'VPN starten & PC wecken' automatisch vor dem Aufwecken verbunden"
          rgOptions={vpnOptions}
          selectedOption={vpnId}
          onChange={(opt) => setVpnId(String(opt.data ?? ""))}
        />

        <ToggleField
          label="FritzBox Auto-Wake Trigger"
          description="Sendet zusätzlich Ping- & TCP-Pakete an die PC-IP (weckt den PC auch über die FritzBox-Option 'Computer starten bei Zugriff')"
          checked={fritzboxTrigger}
          onChange={(val) => setFritzboxTrigger(val)}
        />

        <TextField
          label="Abweichende Broadcast-IP (Optional)"
          value={broadcastIp}
          onChange={(e) => setBroadcastIp(e.target.value)}
          description="Leer lassen für automatische Berechnung aus der PC-IP (z.B. 192.168.178.255)"
        />

        <TextField
          label="UDP-Port"
          value={port}
          mustBeNumeric={true}
          onChange={(e) => setPort(e.target.value)}
          description="Standard ist 9 (Plugin sendet zur Sicherheit auf Port 9, 7 und diesem Port)"
        />

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
              style={{
                backgroundColor: "rgba(220, 53, 69, 0.35)",
                color: "#ff9ea5",
                flex: "1",
              }}
              disabled={saving}
              onClick={handleDelete}
            >
              Löschen
            </DialogButton>
          )}

          <DialogButton
            style={{ flex: "1" }}
            disabled={saving}
            onClick={() => closeModal?.()}
          >
            Abbrechen
          </DialogButton>

          <DialogButton
            style={{
              backgroundColor: "#1a9fff",
              color: "#ffffff",
              fontWeight: 600,
              flex: "1.5",
            }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Speichere..." : "Speichern"}
          </DialogButton>
        </Focusable>
      </div>
    </ModalRoot>
  );
};
