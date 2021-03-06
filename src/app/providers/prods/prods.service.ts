import { Component, OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { NetsolinApp } from "../../shared/global";
import { ParEmpreService } from "../par-empre.service";
import { AngularFirestore } from "@angular/fire/firestore";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from "@angular/common/http";
import { ItemFact } from "../../interfaces/interfaces.generales";
import { Platform } from "@ionic/angular";
// Plugin storage
import { Storage } from "@ionic/storage";
import { VisitasProvider } from "../visitas/visitas.service";
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';


@Injectable({
  providedIn: "root"
})
export class ProdsService implements OnInit {
  private prods: any;
  cargoInventarioNetsolin = false;
  cargoInventarioNetsolinPed = false;
  inventario: Array<any> = [];
  inventarioPed: Array<any> = [];
  facturaCounter: number = 0;
  factura: Array<any> = [];
  itemFact: ItemFact;
  pedidoCounter: number = 0;
  pedido: Array<any> = [];
  itemPedido: ItemFact;

  constructor(
    public _parempre: ParEmpreService,
    private fbDb: AngularFirestore,
    private platform: Platform,
    private storage: Storage,
    private afStorage: AngularFireStorage,
    private http: HttpClient,
    public _visitas: VisitasProvider
  ) {}
  ngOnInit() {
    console.log("ngoniit prod service visita");
    console.log(this._visitas);
  }
  // Carga Inventario de la bodega para facturar en Netsolin
  cargaInventarioNetsolin() {
    return new Promise((resolve, reject) => {
      if (this.cargoInventarioNetsolin) {
        console.log(
          "resolve true cargo inventario netsolin por ya estar inciada"
        );
        resolve(true);
      }
      //  NetsolinApp.objenvrest.filtro = this.bodega;
      NetsolinApp.objenvrest.filtro = this._parempre.usuario.bod_factura;
      // console.log(" cargaInventarioNetsolin 1");
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=INVXBODAPP";
      // console.log("cargaInventarioNetsolin url", url);
      // console.log(
      //   "cargaInventarioNetsolin NetsolinApp.objenvrest",
      //   NetsolinApp.objenvrest
      // );
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        // console.log(" cargaInventarioNetsolin data:", data);
        if (data.error) {
          console.error(" cargaInventarioNetsolin ", data.error);
          this.cargoInventarioNetsolin = false;
          this.inventario = null;
          resolve(false);
        } else {
          // console.log("Datos traer cargaInventarioNetsolin ", data.inventario);
          this.cargoInventarioNetsolin = true;
          // this.menerror_usuar="";
          this.inventario = data.inventario;
          //Actualizar link imagen solo para que actualice en Netsolin el link se comentarea cuando no
          // this.actLinkimg();
          resolve(true);
        }
        // console.log(" cargaInventarioNetsolin 4");
      });
    });
  }

  // Carga Inventario de la bodega para pedido en Netsolin
  cargaInventarioNetsolinPedido() {
    return new Promise((resolve, reject) => {
      if (this.cargoInventarioNetsolinPed) {
        // console.log(
        //   "resolve true cargo cargaInventarioNetsolinPedido netsolin por ya estar inciada"
        // );
        resolve(true);
      }
      NetsolinApp.objenvrest.filtro = this._parempre.usuario.bod_pedido;
      // console.log(" cargaInventarioNetsolinPedido 1");
      let url =
        this._parempre.URL_SERVICIOS +
        "netsolin_servirestgo.csvc?VRCod_obj=INVXBODAPP";
      // console.log("cargaInventarioNetsolinPedido url", url);
      // console.log(
      //   "cargaInventarioNetsolinPedido NetsolinApp.objenvrest",
      //   NetsolinApp.objenvrest
      // );
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        // console.log(" cargaInventarioNetsolinPedido data:", data);
        if (data.error) {
          console.error(" cargaInventarioNetsolinPedido ", data.error);
          this.cargoInventarioNetsolinPed = false;
          this.inventarioPed = null;
          resolve(false);
        } else {
          // console.log(
          //   "Datos traer cargaInventarioNetsolinPedido ",
          //   data.inventario
          // );
          this.cargoInventarioNetsolinPed = true;
          // this.menerror_usuar="";
          this.inventarioPed = data.inventario;
          resolve(true);
        }
        // console.log(" cargaInventarioNetsolinPedido 4");
      });
    });
  }

    // Actualiza url firestorage en Netsolin, para cuando se traiga sea màs rapido
    actualizaimagenProductoNetsolin(referencia, linkimg) {
      return new Promise((resolve, reject) => {
        let paramgrab = {
          cod_ref: referencia,
          link_img: linkimg
        };
        NetsolinApp.objenvrest.filtro = referencia;
        NetsolinApp.objenvrest.parametros = paramgrab;
        // console.log(" actualizaimagenProductoNetsolin 1");
        let url =
          this._parempre.URL_SERVICIOS +
          "netsolin_servirestgo.csvc?VRCod_obj=APPACTLINKIMG";
        // console.log("actualizaimagenProductoNetsolin url", url);
        // console.log(
        //   "actualizaimagenProductoNetsolin NetsolinApp.objenvrest",
        //   NetsolinApp.objenvrest
        // );
        this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
          // console.log(" actualizaimagenProductoNetsolin data:", data);
          if (data.error) {
            console.error(" actualizaimagenProductoNetsolin ", data.error);
            this.cargoInventarioNetsolinPed = false;
            this.inventarioPed = null;
            resolve(false);
          } else {
            // console.log("Datos traer actualizaimagenProductoNetsolin ",data);
            resolve(true);
          }
          // console.log(" actualizaimagenProductoNetsolin 4");
        });
      });
    }
  
  //actualizar link imagen verifica si en firestorage imagenes producto existe y actualiza el lin
  actLinkimg(){
    for (let i = 0; i < this.inventario.length; i++) {  
      let lcodref = this.inventario[i].cod_refinv;
      let larchivo = '/imagenes/' + lcodref.trim() + '.jpg';
      const ref = this.afStorage.ref(larchivo);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
      // console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
      this.inventario[i].link_imgfb = '';
      ref.getDownloadURL().subscribe((url: any) =>  {
        this.inventario[i].link_imgfb = url;
        //actualizar en netsolin
        this.actualizaimagenProductoNetsolin(this.inventario[i].cod_refinv, url);
          // console.log('En actLinkimg suscribe url:' + larchivo, url);        
      });
    }
  }

  //guardar el inventario factura en firebase
  public guardarInvdFB(id, inventario) {
    // console.log("guardarInvdFB id:", id, inventario);
    return this.fbDb
      .collection("inventario")
      .doc(id)
      .set(inventario);
  }

  //guardar el inventario pedido en firebase
  public guardarInvdFBpedido(id, inventario) {
    // console.log("guardarInvdFBpedido id:", id, inventario);
    return this.fbDb
      .collection("inven_ped")
      .doc(id)
      .set(inventario);
  }

  //Obtiene inventario bodega factura de firebase
  public getInvdFB(inventarId: string) {
    // console.log("en getInvdFB");
    return this.fbDb
      .collection("inventario")
      .doc(inventarId)
      .valueChanges();
  }

  //Obtiene inventario bodega factura de firebase
  public getInvdFBpedido(inventarId: string) {
    // console.log("en getInvdFBpedido");
    return this.fbDb
      .collection("inven_ped")
      .doc(inventarId)
      .valueChanges();
  }

  //cargar de firebase el inventario factura suscribirse para que quede actualizado
  cargaInventariodFB(bodega) {
    this.getInvdFB(bodega).subscribe((datos: any) => {
      // console.log("En cargaInventariodFB 1 datos:", datos);
      if (datos) {
        // console.log(
        //   "obtuvo inventario de firebase inventario antes:",
        //   this.inventario
        // );
        // console.log("obtuvo inventario de firebase actual datos:", datos);
        this.inventario = datos.inventario;
        // console.log(
        //   "obtuvo inventario de firebase inventario despues:",
        //   this.inventario
        // );
      }
    });
  }

  //cargar de firebase el inventario pedido suscribirse para que quede actualizado
  cargaInventariodFBpedido(bodega) {
    this.getInvdFB(bodega).subscribe((datos: any) => {
      // console.log("En cargaInventariodFBpedido 1 datos:", datos);
      if (datos) {
        // console.log(
        //   "obtuvo inventario de firebase cargaInventariodFBpedido antes:",
        //   this.inventarioPed
        // );
        // console.log(
        //   "obtuvo inventario de firebase cargaInventariodFBpedido actual datos:",
        //   datos
        // );
        this.inventarioPed = datos.inventario;
        // console.log(
        //   "obtuvo inventario de firebase inventario cargaInventariodFBpedido despues:",
        //   this.inventarioPed
        // );
      }
    });
  }

  buscarProducto(searchKey: string) {
    // console.log("buscarProducto searchKey:", searchKey);
    let key: string = searchKey.toUpperCase();
    // console.log("buscarProducto key:", key);
    // console.log(this.inventario);
    return Promise.resolve(
      this.inventario.filter(
        (item: any) =>
          item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ||
          item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1
      )
    );
  }

  buscarProductoPed(searchKey: string) {
    // console.log("buscarProductoPed searchKey:", searchKey);
    let key: string = searchKey.toUpperCase();
    // console.log("buscarProductoPed key:", key);
    // console.log(this.inventarioPed);
    return Promise.resolve(
      this.inventarioPed.filter(
        (item: any) =>
          item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ||
          item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1
      )
    );
  }

  getProd(id) {
    for (let i = 0; i < this.inventario.length; i++) {
      if (this.inventario[i].cod_refinv === id) {
        return this.inventario[i];
      }
    }
    return null;
  }

  getProdPed(id) {
    for (let i = 0; i < this.inventarioPed.length; i++) {
      if (this.inventarioPed[i].cod_refinv === id) {
        return this.inventarioPed[i];
      }
    }
    return null;
  }

  //adiciona un item a factura
  addfactura(item, cantidad) {
    console.log("add item factura item llega:", item);
    let exist = false;

    if (this.factura && this.factura.length > 0) {
      this.factura.forEach((val, i) => {
        if (val.item.cod_ref === item.cod_refinv) {
          val.item.cantidad = cantidad;
          val.item.total = val.item.precio * cantidad;
          exist = true;
        }
      });
    }

    if (!exist) {
      this.facturaCounter = this.facturaCounter + 1;
      const itemAdi = {
        cod_ref: item.cod_refinv,
        nombre: item.nombre,
        precio: item.precio_ven,
        cantidad: cantidad,
        link_imgfb: item.link_imgfb,
        por_iva: item.por_iva,
        total: item.precio_ven * cantidad
      };
      // console.log("Item a adicionar:", itemAdi);
      this.factura.push({ id: this.facturaCounter, item: itemAdi });
    }
    // console.log("Factura lista :", this.factura);
    this.guardar_storage_factura();
    return Promise.resolve();
  }
  //adiciona un item a pedido
  addpedido(item, cantidad) {
    // console.log("add item pedido item llega:", item);
    this.pedidoCounter = this.pedidoCounter + 1;
    let exist = false;

    if (this.pedido && this.pedido.length > 0) {
      this.pedido.forEach((val, i) => {
        if (val.item.cod_ref === item.cod_refinv) {
          val.item.cantidad = cantidad;
          val.item.total = val.item.precio * cantidad;
          exist = true;
        }
      });
    }

    if (!exist) {
      const itemAdi = {
        cod_ref: item.cod_refinv,
        nombre: item.nombre,
        precio: item.precio_ven,
        cantidad: cantidad,
        link_imgfb: item.link_imgfb,
        por_iva: item.por_iva,
        total: item.precio_ven * cantidad
      };
      // console.log("Item a adicionar pedido:", itemAdi);
      this.pedido.push({ id: this.pedidoCounter, item: itemAdi });
    }
    // console.log("Pedido lista :", this.pedido);
    this.guardar_storage_pedido();
    return Promise.resolve();
  }
  getFactura() {
    return Promise.resolve(this.factura);
  }

  getPedido() {
    return Promise.resolve(this.pedido);
  }

  //saca un elemento de la factura
  borraritemfactura(item) {
    let index = this.factura.indexOf(item);
    if (index > -1) {
      this.factura.splice(index, 1);
    }
    this.facturaCounter = this.facturaCounter - 1;
    this.guardar_storage_factura();
    return Promise.resolve();
  }

  //saca un elemento de la pedido
  borraritempedido(item) {
    let index = this.pedido.indexOf(item);
    if (index > -1) {
      this.pedido.splice(index, 1);
    }
    this.pedidoCounter = this.pedidoCounter - 1;
    this.guardar_storage_pedido();
    return Promise.resolve();
  }

  getitemFactura(id) {
    for (let i = 0; i < this.factura.length; i++) {
      if (this.factura[i].item.cod_ref === id) {
        return this.factura[i].item;
      }
    }
    return null;
  }

  getitemPedido(id) {
    for (let i = 0; i < this.pedido.length; i++) {
      if (this.pedido[i].item.cod_ref === id) {
        return this.pedido[i].item;
      }
    }
    return null;
  }

  public guardar_storage_factura() {
    // console.log("ngoniit prod service visita");
    // console.log(this._visitas.visita_activa);
    let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    let idifact = idruta.toString() + idvisiact.toString();
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set("itemfac" + idifact, this.factura);
    } else {
      // computadora
      localStorage.setItem("itemfac" + idifact, JSON.stringify(this.factura));
    }
  }

  public guardar_storage_pedido() {
    let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    let idiped = idruta.toString() + idvisiact.toString();
    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set("itemped" + idiped, this.pedido);
    } else {
      // computadora
      localStorage.setItem("itemped" + idiped, JSON.stringify(this.pedido));
    }
  }

  cargar_storage_factura(idruta, idvisiact) {
    // console.log("cargar_storage_factura 1", this._visitas);
    // // let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    // console.log("cargar_storage_factura 2", idruta);
    // // let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    // console.log("cargar_storage_factura 3", idvisiact);
    let idifact = idruta.toString() + idvisiact;
    // console.log("cargar_storage_factura 4", idifact);
    this.factura = [];
    let promesa = new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready().then(() => {
          this.storage.get("itemfac" + idifact).then(items => {
            if (items) {
              this.factura = items;
            }
            resolve();
          });
        });
      } else {
        // computadora
        // console.log("carga del storage factura 0 ");
        if (localStorage.getItem("itemfac" + idifact)) {
          //Existe items en el localstorage
          // console.log("carga del storage factura 1");
          this.factura = JSON.parse(localStorage.getItem("itemfac" + idifact));
          // console.log("carga del storage factura 2: ", this.factura);
        }
        resolve();
      }
    });
    return promesa;
  }
  cargar_storage_pedido(idruta, idvisiact) {
    // console.log("cargar_storage_pedido 1", this._visitas);
    // // let idruta = this._visitas.visita_activa.datosgen.id_ruta;
    // console.log("cargar_storage_pedido 2", idruta);
    // // let idvisiact = this._visitas.visita_activa.datosgen.id_visita;
    // console.log("cargar_storage_pedido 3", idvisiact);
    let idiped = idruta.toString() + idvisiact;
    // console.log("cargar_storage_pedido 4", idiped);
    this.pedido = [];
    let promesa = new Promise((resolve, reject) => {
      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready().then(() => {
          this.storage.get("itemped" + idiped).then(items => {
            if (items) {
              this.pedido = items;
            }
            resolve();
          });
        });
      } else {
        // computadora
        // console.log("carga del storage pedido 0 ");
        if (localStorage.getItem("itemped" + idiped)) {
          //Existe items en el localstorage
          // console.log("carga del storage pedido 1");
          this.pedido = JSON.parse(localStorage.getItem("itemped" + idiped));
          // console.log("carga del storage pedido 2: ", this.pedido);
        }
        resolve();
      }
    });
    return promesa;
  }
}
//   traerimagenducha(){
//     console.log('En traer imagenes ducha prueba 0114');
//     let larchivo = `/imagenes/0114.jpg`;
//     const ref = this.afStorage.ref(larchivo);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL.length);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref.getDownloadURL());
//     ref.getDownloadURL().subscribe((data: any) =>  {
//         console.log('En traer imagenes ducha suscribe data:' + larchivo, data);        
//     });
//     larchivo = `/imagenes/noexis0114.jpg`;
//    const  ref1 = this.afStorage.ref(larchivo);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1.getDownloadURL.length);
//     console.log('En traer imagenes ducha prueba ref:' + larchivo, ref1.getDownloadURL());
//     ref1.getDownloadURL().subscribe((data: any) =>  {
//         console.log('En traer imagenes ducha suscribe data no existe:' + larchivo, data);        
//     });
//     // this.profileUrl = ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);
//     return ref.getDownloadURL();
//     // console.log('En traer imagenes ducha prueba profileUrl:',  this.profileUrl);

// }
