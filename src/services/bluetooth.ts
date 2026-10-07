import { BluetoothLowEnergy } from '@capgo/capacitor-bluetooth-low-energy';
import type { BluetoothMessage } from '../types/game';

export const SERVICE_UUID = '7d8a0001-7b12-4f6a-9c2d-00805f9b34fb';
export const MESSAGE_CHARACTERISTIC_UUID =
  '7d8a0002-7b12-4f6a-9c2d-00805f9b34fb';

export interface NearbyBluetoothDevice {
  deviceId: string;
  name: string | null;
  serviceUuids: string[];
}

const characteristicProperties = {
  read: true,
  write: true,
  writeWithoutResponse: true,
  notify: true,
  broadcast: false,
  indicate: false,
  authenticatedSignedWrites: false,
  extendedProperties: false,
};

function textToBytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function bytesToText(bytes: number[]): string {
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export async function initializeCentral(): Promise<void> {
  await BluetoothLowEnergy.initialize({
    mode: 'central',
  });

  await requestBluetoothPermissions();
}

export async function initializePeripheral(): Promise<void> {
  await BluetoothLowEnergy.initialize({
    mode: 'peripheral',
  });

  await requestBluetoothPermissions();
}

export async function requestBluetoothPermissions(): Promise<void> {
  const permissions = await BluetoothLowEnergy.requestPermissions();

  if (permissions.bluetooth !== 'granted') {
    throw new Error('Permita o acesso ao Bluetooth para continuar.');
  }

  const { enabled } = await BluetoothLowEnergy.isEnabled();

  if (!enabled) {
    throw new Error('Ative o Bluetooth nas configurações rápidas do Android.');
  }
}

export async function startHostAdvertising(
  gameName: string,
): Promise<void> {
  await initializePeripheral();

  await BluetoothLowEnergy.addGattService({
    service: SERVICE_UUID,
    characteristics: [
      {
        uuid: MESSAGE_CHARACTERISTIC_UUID,
        properties: characteristicProperties,
        value: [0],
      },
    ],
  });

  await BluetoothLowEnergy.startAdvertising({
    name: gameName,
    services: [SERVICE_UUID],
    includeName: true,
    includeTxPowerLevel: true,
  });
}

export async function stopHostAdvertising(): Promise<void> {
  await BluetoothLowEnergy.stopAdvertising();
}

export async function scanForRooms(
  onDeviceFound: (device: NearbyBluetoothDevice) => void,
): Promise<void> {
  await initializeCentral();

  await BluetoothLowEnergy.addListener(
    'deviceScanned',
    (event) => {
      const device = event.device;

      if (device.serviceUuids?.includes(SERVICE_UUID)) {
        onDeviceFound(device);
      }
    },
  );

  await BluetoothLowEnergy.startScan({
    services: [SERVICE_UUID],
    timeout: 10000,
    allowDuplicates: false,
  });
}

export async function stopScanning(): Promise<void> {
  await BluetoothLowEnergy.stopScan();
}

export async function connectToHost(deviceId: string): Promise<void> {
  await BluetoothLowEnergy.connect({
    deviceId,
  });

  await BluetoothLowEnergy.discoverServices({
    deviceId,
  });
}

export async function sendMessageToHost<T>(
  deviceId: string,
  message: BluetoothMessage<T>,
): Promise<void> {
  const bytes = textToBytes(JSON.stringify(message));

  await BluetoothLowEnergy.writeCharacteristic({
    deviceId,
    service: SERVICE_UUID,
    characteristic: MESSAGE_CHARACTERISTIC_UUID,
    value: bytes,
    type: 'withResponse',
  });
}

export async function listenToHostMessages(
  deviceId: string,
  onMessage: (message: BluetoothMessage) => void,
): Promise<void> {
  await BluetoothLowEnergy.addListener(
    'characteristicChanged',
    (event) => {
      if (
        event.deviceId !== deviceId ||
        event.service !== SERVICE_UUID ||
        event.characteristic !== MESSAGE_CHARACTERISTIC_UUID
      ) {
        return;
      }

      try {
        const message = JSON.parse(bytesToText(event.value));
        onMessage(message);
      } catch {
        console.warn('Mensagem Bluetooth inválida.');
      }
    },
  );

  await BluetoothLowEnergy.startCharacteristicNotifications({
    deviceId,
    service: SERVICE_UUID,
    characteristic: MESSAGE_CHARACTERISTIC_UUID,
  });
}

export async function listenToHostRequests(
  onRequest: (
    centralDeviceId: string,
    message: BluetoothMessage,
  ) => void,
): Promise<void> {
  await BluetoothLowEnergy.addListener(
    'gattCharacteristicWriteRequest',
    (event) => {
      if (
        event.service !== SERVICE_UUID ||
        event.characteristic !== MESSAGE_CHARACTERISTIC_UUID
      ) {
        return;
      }

      try {
        const message = JSON.parse(bytesToText(event.value));

        onRequest(event.deviceId, message);
      } catch {
        console.warn('Solicitação Bluetooth inválida.');
      }
    },
  );
}

export async function notifyPlayers<T>(
  message: BluetoothMessage<T>,
  deviceId?: string,
): Promise<void> {
  const bytes = textToBytes(JSON.stringify(message));

  await BluetoothLowEnergy.notifyGattCharacteristicChanged({
    service: SERVICE_UUID,
    characteristic: MESSAGE_CHARACTERISTIC_UUID,
    value: bytes,
    deviceId,
  });
}

export async function disconnectFromHost(
  deviceId: string,
): Promise<void> {
  await BluetoothLowEnergy.disconnect({
    deviceId,
  });
}
