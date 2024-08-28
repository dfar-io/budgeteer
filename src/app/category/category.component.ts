import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LineItem } from '../line-item/line-item';
import { LineItemComponent } from '../line-item/line-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [LineItemComponent, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  @Input() title!: string
  @Input() lineItems!: LineItem[]
  @Input() emptyMessage!: string
  @Input() difference!: number
  @Output() add = new EventEmitter();
  @Output() save = new EventEmitter();
  @Output() delete = new EventEmitter<number>();

  isVisible! : boolean
  toggleIcon = 'keyboard_arrow_right';

  public ngOnInit(): void {
    console.log(this.difference);
    if (!this.title) {
      throw (new Error("The required input [title] was not provided"));
    }
    if (!this.lineItems) {
      throw (new Error("The required input [lineItems] was not provided"));
    }
    if (!this.emptyMessage) {
      throw (new Error("The required input [emptyMessage] was not provided"));
    }
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.toggleIcon = this.isVisible ? 'keyboard_arrow_down' : 'keyboard_arrow_right';
    console.log(this.toggleIcon);
  }

  onAdd() {
    this.add.emit();
  }

  onSave() {
    this.save.emit();
  }

  onDelete(lineItemId : number) {
    this.delete.emit(lineItemId);
  }
}
