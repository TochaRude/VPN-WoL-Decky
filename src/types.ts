export interface VpnConnection {
  id: string;
  name: string;
  uuid: string;
  backend: "nmcli" | "wg-quick";
  type: "wireguard" | "vpn";
  interface: string;
  active: boolean;
  state: "connected" | "connecting" | "disconnected";
  ip: string;
  broadcast: string;
}

export interface WolTarget {
  id: string;
  name: string;
  mac: string;
  ip: string;
  broadcast_ip: string;
  port: number;
  vpn_id: string;
  wake_trigger: boolean;
  fritzbox_trigger?: boolean;
  router_ip?: string;
  router_user?: string;
  router_password?: string;
}

export interface PingStatus {
  online: boolean;
  latency_ms: number | null;
}

export interface SetVpnResponse {
  success: boolean;
  message?: string;
  error?: string;
  vpns: VpnConnection[];
}

export interface SaveTargetResponse {
  success: boolean;
  target?: WolTarget;
  targets: WolTarget[];
  error?: string;
}

export interface DeleteTargetResponse {
  success: boolean;
  targets: WolTarget[];
}

export interface SendWolResponse {
  success: boolean;
  message?: string;
  error?: string;
  vpn_activated?: boolean;
  endpoints?: string[];
  vpns?: VpnConnection[];
}

export interface InitialStateResponse {
  vpns: VpnConnection[];
  targets: WolTarget[];
  ping_status: Record<string, PingStatus>;
}
