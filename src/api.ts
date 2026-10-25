import { callable } from "@decky/api";
import {
  DeleteTargetResponse,
  InitialStateResponse,
  PingStatus,
  SaveTargetResponse,
  SendWolResponse,
  SetVpnResponse,
  ShutdownTargetResponse,
  VpnConnection,
  WolTarget,
} from "./types";

export const getInitialState = callable<[], InitialStateResponse>("get_initial_state");

export const getVpns = callable<[], VpnConnection[]>("get_vpns");

export const setVpnState = callable<[vpn_id: string, enable: boolean], SetVpnResponse>(
  "set_vpn_state"
);

export const getWolTargets = callable<[], WolTarget[]>("get_wol_targets");

export const saveWolTarget = callable<[target: Partial<WolTarget>], SaveTargetResponse>(
  "save_wol_target"
);

export const deleteWolTarget = callable<[target_id: string], DeleteTargetResponse>(
  "delete_wol_target"
);

export const pingTarget = callable<[ip: string], PingStatus>("ping_target");

export const pingAllTargets = callable<[], Record<string, PingStatus>>("ping_all_targets");

export const sendWol = callable<
  [target_id: string, auto_connect_vpn: boolean],
  SendWolResponse
>("send_wol");

export const shutdownTarget = callable<[target_id: string], ShutdownTargetResponse>(
  "shutdown_target"
);
