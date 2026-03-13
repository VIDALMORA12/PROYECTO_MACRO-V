import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Database } from '../../services/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit {
  constructor(private db: Database) {}

  async ngOnInit() {
    await this.db.initializeDatabase();
  }
}