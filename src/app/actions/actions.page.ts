import { Component, OnInit, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ToastController, NavController, NavParams } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'page-actions',
  templateUrl: 'actions.page.html',
  styleUrls: ['actions.page.scss']
})
export class ActionsPage {

  ledAzul: boolean = false;
  piscandoLedAzul: boolean = false;
  peripheral: any = {};
  statusMessage: string;
  private device: { id: "", name: "" } = { id: "", name: "" };
  dadosCartao: any;

  constructor(private route: ActivatedRoute,
    private ble: BLE,
    private toastCtrl: ToastController,
    private ngZone: NgZone) {


    this.route.queryParams.subscribe(params => {
      this.device.id = params['id'];
      this.device.name = params['name'];
      this.setStatus('Connecting to ' + this.device.name || this.device.id);

      this.ble.connect(this.device.id).subscribe(
        peripheral => this.onConnected(peripheral),
        peripheral => this.onDeviceDisconnected(peripheral)
      );

    });



  }

  async msg(mensagem: string) {
    this.setStatus(mensagem);
    let toast = await this.toastCtrl.create({
      message: mensagem,
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  onConnected(peripheral) {
    this.ngZone.run(() => {
      this.setStatus('Conectado');
      this.peripheral = peripheral;
    });
    this.ble.startNotification(this.device.id,
      this.peripheral.services[0],
      this.peripheral.characteristics[0].characteristic).subscribe(data => {
        console.log("Dados lidos do Dispositivo: "+JSON.stringify(data));
        this.onChange(data);
      });
  }

  async onDeviceDisconnected(peripheral) {
    let toast = await this.toastCtrl.create({
      message: 'O dispositivo foi desconectado inesperadamente',
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  }

  // Disconnect peripheral when leaving the page
  ionViewWillLeave() {
    console.log('ionViewWillLeave disconnecting Bluetooth');
    this.ble.disconnect(this.peripheral.id).then(
      () => console.log('Disconnected ' + JSON.stringify(this.peripheral)),
      () => console.log('ERROR disconnecting ' + JSON.stringify(this.peripheral))
    );
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  piscarLedAzul() {
    if (this.piscandoLedAzul) {
      this.setStatus("piscando led azul");
      this.ble.write(this.device.id, this.peripheral.services[0], this.peripheral.characteristics[1].characteristic, this.str2ab("PL"));
    } else {
      this.setStatus("apagando led azul");
      this.ble.write(this.device.id, this.peripheral.services[0], this.peripheral.characteristics[1].characteristic, this.str2ab("L0"));
    }
  }

  alterarLedAzul() {
    if (this.ledAzul) {
      this.setStatus("acendendo led azul");
      this.ble.write(this.device.id, this.peripheral.services[0], this.peripheral.characteristics[1].characteristic, this.str2ab("L1"));
    } else {
      this.setStatus("apagando led azul");
      this.ble.write(this.device.id, this.peripheral.services[0], this.peripheral.characteristics[1].characteristic, this.str2ab("L0"));
    }

  }


  onChange(buffer: any) {
    this.ngZone.run(() => {
      this.dadosCartao = this.bytesToString(buffer);
      this.setStatus("Cartão: "+this.dadosCartao);
    });

  }

  private str2ab(str: string) {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
    }
    return array.buffer
  }

  private bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }


}