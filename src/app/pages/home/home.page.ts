import { Component, OnInit,ViewChild, ElementRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  @ViewChild('pieCanvas') private pieCanvas!: ElementRef;
  pieChart: any;

  constructor() { }

  ngOnInit() {
  }
  ionViewDidEnter() {
    this.createPieChart();
  }

  createPieChart() {
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Ciclo 1', 'Ciclo 2', 'Ciclo 3', 'Ciclo 4', 'Ciclo 5', 'Ciclo 6', 
                 'Ciclo 7', 'Ciclo 8', 'Ciclo 9', 'Ciclo 10', 'Ciclo 11', 'Ciclo 12'],
        datasets: [{
          label: 'Ciclos',
          data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Valores iguales para que se vea simétrico
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'CICLOS', font: { size: 20 } }
        }
      }
    });
  }

}
