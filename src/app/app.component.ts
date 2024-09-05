import { Component, OnInit } from '@angular/core';
import { LineItemService } from './line-item/line-item.service';
import { LineItem } from './line-item/line-item';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CategoryComponent } from './category/category.component';
import { Money } from 'ts-money';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CategoryComponent, CurrencyPipe, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  incomes: LineItem[] = [];
  funds: LineItem[] = [];
  monthlies: LineItem[] = [];
  planned: LineItem[] = [];

  incomeSum = 0;
  fundsSum = 0;
  monthliesSum = 0;
  plannedSum = 0;
  difference = 0;

  differenceBackgroundColor = '';
  differenceFontColor = '';

  readonly incomesKey = 'incomes';
  readonly fundsKey = 'funds';
  readonly monthliesKey = 'monthlies';
  readonly plannedKey = 'plannedKey';

  constructor(private lineItemService: LineItemService) {}

  ngOnInit() {
    this.incomes = this.lineItemService.getLineItems(this.incomesKey) ?? [];
    this.funds = this.lineItemService.getLineItems(this.fundsKey) ?? [];
    this.monthlies = this.lineItemService.getLineItems(this.monthliesKey) ?? [];
    this.planned = this.lineItemService.getLineItems(this.plannedKey) ?? [];
    this.updateDifference();
  }

  updateDifference() {
    this.incomeSum = this.generateSum(this.incomes);
    this.fundsSum = this.generateSum(this.funds);
    this.monthliesSum = this.generateSum(this.monthlies);
    this.plannedSum = this.generateSum(this.planned);
    let moneyCalc = new Money(0, 'USD');
    moneyCalc = moneyCalc.add(Money.fromDecimal(this.incomeSum, 'USD'));
    moneyCalc = moneyCalc.subtract(Money.fromDecimal(this.fundsSum, 'USD'));
    moneyCalc = moneyCalc.subtract(Money.fromDecimal(this.monthliesSum, 'USD'));
    moneyCalc = moneyCalc.subtract(Money.fromDecimal(this.plannedSum, 'USD'));
    this.difference = moneyCalc.amount / 100;

    if (this.difference == 0) {
      this.differenceBackgroundColor = 'green';
      this.differenceFontColor = 'white';
    } else if (this.difference < 0) {
      this.differenceBackgroundColor = 'red';
      this.differenceFontColor = 'white';
    } else {
      this.differenceBackgroundColor = 'yellow';
      this.differenceFontColor = 'black';
    }
  }

  saveIncomes() {
    this.saveLineItems(this.incomesKey, this.incomes);
  }

  saveFunds() {
    this.saveLineItems(this.fundsKey, this.funds);
  }

  saveMonthlies() {
    this.saveLineItems(this.monthliesKey, this.monthlies, 'paymentDay');
  }

  savePlanned() {
    this.saveLineItems(this.plannedKey, this.planned, 'paymentMonth');
  }

  deleteIncome(id : number) {
    this.deleteLineItem(id, this.incomesKey, this.incomes);
  }

  deleteFund(id : number) {
    this.deleteLineItem(id, this.fundsKey, this.funds);
  }

  deleteMonthly(id : number) {
    this.deleteLineItem(id, this.monthliesKey, this.monthlies);
  }

  deletePlanned(id : number) {
    this.deleteLineItem(id, this.plannedKey, this.planned);
  }

  addLineItem(key : string, array : LineItem[], options? : keyof LineItem) {
    const newLineItem = this.createNewLineItem(options)
    array.push(newLineItem);
    if (options !== undefined) {
      this.sortLineItems(array, options as keyof LineItem);
    }
    this.lineItemService.saveLineItems(key, array);
    this.updateDifference();
  }

  private createNewLineItem(options?: keyof LineItem) {
    const randomDecimal = Math.random() * (10000 - 1) + 1;
    const randomId = Math.floor(Math.random() * (1000000 - 1 + 1)) + 1;
    const name = "New Line Item";
    const amount = parseFloat(randomDecimal.toFixed(2));

    const result = {} as LineItem;
    result.id = randomId;
    result.name = name;
    result.amount = amount;
    result.paymentDay = options == 'paymentDay' ?
      this.randomInt(28) : undefined;
    result.paymentMonth = options == 'paymentMonth' ?
      this.randomInt(12) : undefined;
    
    return result;
  }

  private randomInt(max: number): number {
    return Math.floor(Math.random() * (max - 1 + 1)) + 1;
  }

  private saveLineItems(key : string, array : LineItem[], sortProperty?: keyof LineItem) {
    if (sortProperty !== undefined) {
      array = this.sortLineItems(array, sortProperty);
    }
    this.lineItemService.saveLineItems(key, array);
    this.updateDifference();
  }

  private deleteLineItem(id : number, key : string, array : LineItem[]) {
    const toDelete = array.findIndex(i => i.id === id);
    array.splice(toDelete, 1);

    this.lineItemService.saveLineItems(key, array);
    this.updateDifference();
  }

  private generateSum(lineItems: LineItem[]): number {
    let moneyCalc = new Money(0, 'USD');
    lineItems.forEach(li => {
      moneyCalc = moneyCalc.add(Money.fromDecimal(li.amount, 'USD'));
    });
    return moneyCalc.amount / 100;
  }

  private sortLineItems<LineItem>(array: LineItem[], property: keyof LineItem): LineItem[] {
    // Check if the property exists on the objects in the array
    if (array.length === 0 || !property) {
      return array;
    }
  
    // Sort the array based on the property
    return array.slice().sort((a, b) => {
      // Handle sorting for properties that may be numbers or strings
      if (a[property] < b[property]) {
        return -1;
      }
      if (a[property] > b[property]) {
        return 1;
      }
      return 0;
    });
  }
}
