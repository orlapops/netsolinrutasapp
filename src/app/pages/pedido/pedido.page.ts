import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ProdsService } from '../../providers/prods/prods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})

export class PedidoPage implements OnInit {
  pedido: Array<any> = [];
  total_ped = 0;
  constructor(
    public navCtrl: NavController,
    private translate: TranslateProvider,
    public _prods: ProdsService,
    public route: ActivatedRoute,
    public router: Router,
    public _DomSanitizer: DomSanitizer,
    public _cliente: ClienteProvider,
    ) { }

  ngOnInit() {
    this.getPedido();    
  }

  deleteItem(item) {
    this._prods.borraritempedido(item)
      .then(() => {
        this.getPedido();
      })
      .catch(error => alert(JSON.stringify(error)));
  }

  getPedido() {
    this._prods.getPedido()
      .then(data => {
        console.log('getfavoritos data', data);
         this.pedido = data; 
         this.actualizar_totalped();
        });
  }
  total(item, i){
    console.log('en total item llega:', i, item, this.pedido);
    this.pedido[i].item.total = this.pedido[i].item.cantidad * this.pedido[i].item.precio;
    this.actualizar_totalped();
    this._prods.guardar_storage_pedido();

    // this.total_t = 0;
    // this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    // return this.total_t;
  }  
  actualizar_totalped(){
    this.total_ped = 0;
    for( let itemp of this.pedido ){
      this.total_ped += Number(itemp.item.total)
    ;
      console.log("SUMA")
      console.log (this.total_ped)
    }
  }

}


