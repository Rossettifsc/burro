import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';
import type { BluetoothMessage } from '../types/game';
import { validateMessage } from './gameEngine';

// Gere UUIDs próprios para o projeto. O mesmo conjunto deve existir em todos os celulares.
export const SERVICE_UUID = '7d8a0001-7b12-4f6a-9c2d-00805f9b34fb';
export const CHARACTERISTIC_UUID = '7d8a0002-7b12-4f6a-9c2d-00805f9b34fb';

export async function initializeBluetooth(): Promise<void> {
  await BleClient.initialize();
}

export async function requestBluetoothPermissions(): Promise<void> {
  // O plugin solicita as permissões durante initialize/scan/connect conforme Android/iOS.
  // Esta função existe para centralizar o fluxo da aplicação.
  await initializeBluetooth();
}

export async function scanNearbyDevices(timeoutMs = 8000): Promise<any[]> {
  const devices: any[] = [];
  await BleClient.requestLEScan(
    { services: [SERVICE_UUID] },
    (result) => {
      if (!devices.some((device) => device.deviceId === result.device.deviceId)) {
        devices.push(result.device);
      }
    },
  );
  await new Promise((resolve) => setTimeout(resolve, timeoutMs));
  await BleClient.stopLEScan();
  return devices;
}

export async function connectToDevice(deviceId: string): Promise<void> {
  await BleClient.connect(deviceId);
}

export async function sendMessage<T>(deviceId: string, message: BluetoothMessage<T>): Promise<void> {
  const serialized = JSON.stringify(message);
  await BleClient.write(deviceId, SERVICE_UUID, CHARACTERISTIC_UUID, textToDataView(serialized));
}

export async function listenMessages<T>(
  deviceId: string,
  callback: (message: BluetoothMessage<T>) => void,
): Promise<void> {
  await BleClient.startNotifications(deviceId, SERVICE_UUID, CHARACTERISTIC_UUID, (value) => {
    try {
      const parsed = JSON.parse(dataViewToText(value));
      if (validateMessage(parsed)) callback(parsed as BluetoothMessage<T>);
    } catch {
      console.warn('Mensagem Bluetooth ignorada: JSON inválido.');
    }
  });
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  await BleClient.disconnect(deviceId);
}