import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';

import * as echarts from 'echarts';


@Component({
  selector: 'app-ciclo',
  templateUrl: './ciclo.page.html',
  styleUrls: ['./ciclo.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule]
})
export class CicloPage implements OnInit {

  // 1. Definimos las propiedades con valores iniciales o permitiendo null/undefined
  public id_ciclo?: number;
  public descripcion: string = '';
  public periodicidad: string = '';
  public echartInstance: any;
  public ciclo = [
    { ciclo1: 'mm' }
  ];

  // 2. El constructor
  constructor(private route: ActivatedRoute) {
    // Aquí inyectamos servicios, no datos del modelo
  }

  ngOnInit(): void {
    // 3. Si vienes de otra página, aquí recuperas los datos
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id_ciclo = Number(id);
    }
    this.inicializarEchart();
  }

  // En TypeScript/Angular no solemos usar Getters y Setters tan verbosos 
  // a menos que haya lógica especial, pero si los necesitas, déjalos así:
  getIdCiclo(): number | undefined {
    return this.id_ciclo;
  }

  setDescripcion(desc: string): void {
    this.descripcion = desc;
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
  }

}

