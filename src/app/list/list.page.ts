import { Component, OnInit, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { ToastController, NavController } from '@ionic/angular';
import { ActionsPage } from '../actions/actions.page';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'page-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage {

  devices: any[] = [];
  statusMessage: string;

  constructor(
    public navCtrl: NavController,
    public router: Router,
    private toastCtrl: ToastController,
    private ble: BLE,
    private ngZone: NgZone) {
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.scan();
  }

  scan() {
    this.setStatus('Pesquisando Dispositivos Bluetooth LE');
    this.devices = [];  // clear list

    this.ble.scan([], 5).subscribe(
      device => this.onDeviceDiscovered(device),
      error => this.scanError(error)
    );

    setTimeout(this.setStatus.bind(this), 5000, 'Pesquisa finalizada');
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      let exists = this.devices.filter(d => d.id == device.id);
      if (exists.length == 0 || this.devices.length == 0) {
        this.devices.push(device);
      }
    });
  }

  // If location permission is denied, you'll end up here
  async scanError(error) {
    this.setStatus('Error ' + error);
    let toast = await this.toastCtrl.create({
      message: 'Falha ao pesquisar Dispositivos Bluetooth LE',
      position: 'middle',
      duration: 5000
    });
    toast.present();
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

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  deviceSelected(device) {
    console.log(JSON.stringify(device) + ' selected');
    this.router.navigate(['/list/actions'], { queryParams: { id: device.id, name: device.name } });
  }
}
