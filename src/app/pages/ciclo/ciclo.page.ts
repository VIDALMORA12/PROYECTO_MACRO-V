import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
<<<<<<< HEAD
=======
import * as echarts from 'echarts';
>>>>>>> origin/main

@Component({
  selector: 'app-ciclo',
  templateUrl: './ciclo.page.html',
  styleUrls: ['./ciclo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CicloPage implements OnInit {

<<<<<<< HEAD
  constructor() { }

  ngOnInit() {
=======
  echartInstance:any;
  ciclo=[

    {ciclo1:'mm'}
  ]

  constructor() { }

  ngOnInit() {
    this.inicializarEchart();
  }
  inicializarEchart() {
    this.echartInstance = echarts.init(document.getElementById('main'));
    this.echartInstance.setOption({
      title: {
        text: 'Presupuestos por Categoría',
        subtext: 'Fake Data',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: 'Presupuestos',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
            { value: 484, name: 'Union Ads' },
            { value: 300, name: 'Video Ads' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
>>>>>>> origin/main
  }

}
