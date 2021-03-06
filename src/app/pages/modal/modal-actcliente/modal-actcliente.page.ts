import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { VisitasProvider } from '../../../providers/visitas/visitas.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ClienteProvider } from '../../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { ImagePage } from '../../modal/image/image.page';
import { environment } from '../../../../environments/environment'
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var google:any;

@Component({
  selector: 'app-modal-actcliente',
  templateUrl: './modal-actcliente.page.html',
  styleUrls: ['./modal-actcliente.page.scss'],
})
export class ModalActClientePage implements OnInit {
  @Input() coords: any;
  address: string;
  description: string = '';
  foto: any = '';
  imagenPreview: string;
  agmStyles: any[] = environment.agmStyles;
  private photo: string = 'assets/img/logo.png';
  private userId: string;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  title = 'app';

  constructor(private modalCtrl: ModalController,
    public _visitas: VisitasProvider,
    public _clientes: ClienteProvider,
    public geolocation: Geolocation,
    private actionSheetCtrl: ActionSheetController,
    private storage: AngularFireStorage,
    public _DomSanitizer: DomSanitizer,
    private camera: Camera) { }
  

  ngOnInit() {
    console.log('ngOnInit ModalActClientePage this._visitas.visita_activa: ', this._visitas.visita_activa);
    console.log('ngOnInit ModalActClientePage _clientes.clienteActual:', this._clientes.clienteActual);
    console.log('ngOnInit ModalActClientePage _visitas.direc_actual:', this._visitas.direc_actual);

    // this.coords.lat = this.navParams.get('lat');
    // this.coords.lng = this.navParams.get('lng');

    this.getAddress(this.coords).then(results=>{
      console.log('ngoninit nueva visita modal');
      console.log(results);
      this.address = results[0]['formatted_address'];      
    },errStatus=>{
      //Aqui codigo manejo error
    })

  }
  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'demo126';
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => this.downloadURL = fileRef.getDownloadURL() )
     )
    .subscribe()
  // }    
  //   // get notified when the download URL is available
  //   this.downloadURL = task.downloadURL();
  }
  uploadFile1(event) {
    const file = event.target.files[0];
    const filePath = 'imagenes/archvio1.pdf';
    const ref = this.storage.ref(filePath);
    console.log('uploadFile file:', file);
    console.log('uploadFile filePath:', filePath);
    console.log('uploadFile ref:', ref);
    const task = ref.putString(file)
    .then(() => {
      const llinkkret = ref.getDownloadURL();
      console.log('subio arch llinkkret: ', llinkkret)
  });
  }
 
  mostrar_camara(){
    console.log('en mostrar camara1');
    const optionscam: CameraOptions = {
      quality: 60,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this.camera.getPicture(optionscam).then((imageData) => {
      console.log('en mostrar camara2');
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      console.log('en mostrar camara2 imageData:',imageData);
      this.imagenPreview = 'data:image/jpeg;base64,' + imageData;
      console.log('this.imagenPreview:', this.imagenPreview);
      // this._visitas.cargar_imagenb_firebase('1' , this.imagenPreview);
      this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa.datosgen.cod_tercer, 
        this._visitas.visita_activa.datosgen.id_dir,
        0, 0, this.imagenPreview);
     }, (err) => {
      // Handle error
      console.log('Error en camara', JSON.stringify(err));
      const nomarch='imagenp.jpg';
      // tslint:disable-next-line:max-line-length
      const imgprueba = "Qk0qAQAAAAAAAHYAAAAoAAAAEQAAAA8AAAABAAQAAAAAALQAAAATCwAAEwsAAAAAAAAAAAAAAAAAAAAAgAAAgAAAAICAAIAAAACAAIAAgIAAAICAgADAwMAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AP//////////8AkJCf+Hd3d3d3d38AkJCf8AAAAAAAAH8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8AAAAAAAAI8AkJCf//////////8AkJCf//////////8AkJCQ=="      
      console.log('Error en camara imgprueba:', imgprueba);
      // this._visitas.cargar_imagenb_firebase('1' , imgprueba);
      // this._clientes.actualizaimagenClientefirebase('1037651402', imgprueba);
      this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa.datosgen.cod_tercer, 
        this._visitas.visita_activa.datosgen.id_dir,
        0, 0, imgprueba);
     });
     console.log('en mostrar camara4');

  }

  actualiza_ubicaciongps(){
    this._clientes.actualizaimagenClientefirebase(this._visitas.visita_activa.datosgen.cod_tercer, 
      this._visitas.visita_activa.datosgen.id_dir,
      this.coords.lng, this.coords.lat, '');
  }

  getAddress(coords):any{
    var geocoder = new google.maps.Geocoder();

    return new Promise(function(resolve,reject){
      geocoder.geocode({'location':coords},function(results,status){
        //llamado asincronicamente
        if(status == google.maps.GeocoderStatus.OK){
          resolve(results);
        } else {
          reject(status);
        }
      })
    });
  }

  cerrarModal(){
    this.modalCtrl.dismiss();
  }
  

  sacarFoto(){

  }
guardarNuevaVisita(){

}
}
