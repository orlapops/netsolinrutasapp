import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagePage } from './../modal/image/image.page';
import { environment } from '../../../environments/environment'
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { ProdsService } from '../../providers/prods/prods.service';
import { RecibosService } from '../../providers/recibos/recibos.service';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalActClientePage } from '../modal/modal-actcliente/modal-actcliente.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActividadesService } from '../../providers/actividades/actividades.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-visita-detail',
  templateUrl: './visita-detail.page.html',
  styleUrls: ['./visita-detail.page.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('300ms', [animate('600ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class VisitaDetailPage implements OnInit {
  visita: any;
  visitaID: any = this.route.snapshot.paramMap.get('id'); 
  visitaAct: any;
  agmStyles: any[] = environment.agmStyles;
  visitaSegment: string = 'details';
  estadoVisita: string = '';
  cargoCartera = false;
  buscar_item:string;
  buscar_itemped:string;
  q: any;
  productos_bus: any;
  searching: any = false;
  qped: any;
  productos_busped: any;
  searchingped: any = false;
  // imagenmuest: string;
  // linkimgprod: string;
  coords: any = { lat: 0, lng: 0 };
  cargoVisitaActual = false;
  listaactividades: any;
  imagenPreview: string;
  listafotos: any;

  constructor(
    public _parEmpre: ParEmpreService,
    public _cliente: ClienteProvider,
    public navCtrl: NavController,
    public asCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public geolocation: Geolocation,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _prods: ProdsService,
    public _recibos: RecibosService,
    public _actividad: ActividadesService,
    public route: ActivatedRoute,
    public _DomSanitizer: DomSanitizer,
    public router: Router,
    private camera: Camera
  ) {
    platform.ready().then(() => {
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      this.obtenerPosicion();
    });
    console.log('constructor detalle visita');
    console.log(this.visitaID);
    this.visita = this._visitas.getItem(this.visitaID);
    console.log('constructor detalle visita 2');
    // this._visitas.inicializarVisitaActual(this.visitaID);
    console.log('constructor detalle visita 3');
    this._visitas.getVisitaActual(this.visitaID).subscribe((datos: any) => {
      console.log('constructor detalle visita getVisitaActual datos:', datos);                
      this.visitaAct = datos;
      this.cargoVisitaActual = true;
      console.log('constructor detalle visita 4 this.visitaAct: ', this.visitaAct);
      this._actividad.getActividadesVisitaActual(this.visitaAct).subscribe((datosa: any) => {
        console.log('actividades de la visita: ', datosa);
        this.listaactividades = datosa;
        // console.log(this.listaactividades.id);
        // console.log(this.listaactividades.payload.doc);
        // console.log(this.listaactividades.payload.doc.data());
        // console.log(this.listaactividades.payload.doc.id);

      });
      this._actividad.getFotosVisitaActual(this.visitaAct).subscribe((datosa: any) => {
        console.log('Fotos de la visita: ', datosa);
        this.listafotos = datosa;
        // console.log(this.listaactividades.id);
        // console.log(this.listaactividades.payload.doc);
        // console.log(this.listaactividades.payload.doc.data());
        // console.log(this.listaactividades.payload.doc.id);

      });


      // if (datos) {
      //   console.log('constructor detalle visita getVisitaActual datos true:', datos);                
      //     this.visitaAct = datos;
      // } else {
      //   console.log('constructor detalle visita getVisitaActual datos false:', datos);                
      //   this.visitaAct = null;
      // }
    });
  }

  ngOnInit() {
    console.log('ngoniit visita detalle');
    console.log(this.visita);
    this._prods.cargar_storage_factura(this.visita.data.id_ruta, this.visita.id);
    this._prods.cargar_storage_pedido(this.visita.data.id_ruta, this.visita.id);
    this._recibos.cargar_storage_recibo(this.visita.data.id_ruta, this.visita.id);
    // this._visitas.traerimagenducha();
    
    // this._visitas.traerlinkimgProd().subscribe((datos: any) => {
    //   console.log('traerimagenducha datos:', datos);    
    //   this.imagenmuest = datos;   
    //   this.linkimgprod = datos;  
    //   // this.imagensanit = this._DomSanitizer.bypassSecurityTrustUrl(this.imagenmuest);
    //   // this.visitaAct = datos;
    //   // console.log('constructor detalle visita 4 this.visitaAct: ', this.visitaAct);
    // });
  }

  obtenerPosicion(): any {
    this.geolocation
      .getCurrentPosition()
      .then(res => {
        this.coords.lat = res.coords.latitude;
        this.coords.lng = res.coords.longitude;
        // this.loadMap();
      })
      .catch(error => {
        console.log(error.message);
        this.coords.lat = 4.625749001284896;
        this.coords.lng = -74.078441;
        // this.loadMap();
      });
  }

  async actualizarCliente() {
    const modal = await this.modalCtrl.create({
      component: ModalActClientePage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { coords: this.coords }
    });
    return await modal.present();
  }


  async presentImage(image: any) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      componentProps: { value: image }
    });
    return await modal.present();
  }


  registrarIngresoVisita() {
    // this.estadoVisita = 'A';
    // this._visitas.visita_activa.estado = 'A';
    const datactvisita = {
      fechahora_ingreso : Date(),
      estado : 'A'
    };
    this._visitas.actualizarVisita(this.visitaID, datactvisita);
  }

  cerrarVisita() {
    // this.estadoVisita = 'C';
    const datactvisita = {
      fechahora_cierre : Date(),
      estado : 'C'
    };
    this._visitas.actualizarVisita(this.visitaID, datactvisita);
  }
  actualizarGps(){

  }
  
  colorxEstado(estado) {
    if (estado === 'C') {
      return 'bg-red';
    } else {
      if (estado === 'A') {
        return 'bg-verde';
      } else {
        return 'bg-white';
    }
  }
  }

  range(n) {
    return new Array(n);
  }

  avgRating() {
    let average: number = 0;

    this.visita.reviews.forEach((val: any, key: any) => {
      average += val.rating;
    });

    return average / this.visita.reviews.length;
  }

  buscar_productos($event){

    this.q = $event.target.value;
    console.log('buscar_productos: ', this.q );
    this.searching = true;
    // this._visitas.buscarProducto(this.q).then(lbusq => {
    this._prods.buscarProducto(this.q).then(lbusq => {
      console.log('lo buscado por producto: ' , lbusq);
      this.productos_bus = lbusq;
      this.searching = false;
      console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_bus);

    });    
  }
    buscar_productosped($event){
      this.qped = $event.target.value;
      console.log('buscar_productos ped: ', this.qped );
      this.searchingped = true;
      // this._visitas.buscarProducto(this.q).then(lbusq => {
      this._prods.buscarProductoPed(this.qped).then(lbusq => {
        console.log('lo buscado por producto: ' , lbusq);
        this.productos_busped = lbusq;
        this.searchingped = false;
        console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_busped);
  
      });    
    //     if (this.q != '') {
  //       this.startAt.next(this.q);
  //       this.endAt.next(this.q + "\uf8ff");
  //     }
  //     else {
  //       this.items = this.all_items;
  //     }
  }
  
  tomafoto(){
      console.log('en tomafoto camara1');
      const optionscam: CameraOptions = {
        quality: 40,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };
      this.camera.getPicture(optionscam).then((imageData) => {
        console.log('en mostrar camara2');
        console.log('en mostrar camara2 imageData:',imageData);
        this.imagenPreview = 'data:image/jpeg;base64,' + imageData;
        console.log('this.imagenPreview:', this.imagenPreview);
        // this._visitas.cargar_imagenb_firebase('1' , this.imagenPreview);
        this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa.datosgen.cod_tercer, 
          this.visitaID, this.imagenPreview);
       }, (err) => {
        // Handle error
        console.log('Error en camara', JSON.stringify(err));
        const nomarch='imagenp.jpg';
        // tslint:disable-next-line:max-line-length
        const imgprueba = "Qk0qAQAAAAAAAHYAAAAoAAAAEQAAAA8AAAABAAQAAAAAALQAAAATCwAAEwsAAAAAAAAAAAAAAAAAAAAAgAAAgAAAAICAAIAAAACAAIAAgIAAAICAgADAwMAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////AP//////////8AkJCf+Hd3d3d3d38AkJCf8AAAAAAAAH8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8OAA4AAA4H8AkJCf8P7+8P/w8H8AkJCf8OAA4AAA4H8AkJCf8P7+/v7+8H8AkJCf8AAAAAAAAI8AkJCf//////////8AkJCf//////////8AkJCQ=="      
        console.log('Error en camara imgprueba:', imgprueba);
        this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa.datosgen.cod_tercer, 
          this.visitaID, imgprueba);

       });
       console.log('en mostrar camara4');
  }
  public eliminarFoto(ifoto){
    console.log('En eliminar foto ', ifoto);

  }
}
