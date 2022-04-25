import { Component, OnInit, Input } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { SearchService, DataGraphLine } from '@search/search.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import fileSaver from 'file-saver';
import { DateTime } from "luxon";
import moment from 'moment';
import _ from 'lodash';

export const APP_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    },
};
@Component({
  selector: 'app-search-config',
  templateUrl: './search-config.component.html',
  styleUrls: ['./search-config.component.scss'],
  providers: [
      {
        provide: MAT_DATE_FORMATS,
        useValue: APP_DATE_FORMATS
      },
      {
        provide: DateAdapter,
        useClass: MomentDateAdapter,
        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
      },
      {
        provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
        useValue: {
          useUtc: true
        }
      }
  ]
})
export class SearchConfigComponent implements OnInit {

  @Input() visible: boolean = false;
  @Input() pollution: string = '';

  public startDateDefault: string = DateTime.now().minus({ days: 7 }).toLocaleString(DateTime.DATE_SHORT);
  public endDateDefault: string = DateTime.now().toLocaleString(DateTime.DATE_SHORT);

  private _startDateSelected: string = '';
  private _endDateSelected: string = '';

  public format_history : string = '%d/%m/%Y %I:%M';
  public format_graph: string = '%d/%m/%Y';
  public format: string = ''

  public configuration: string = '';
  graph_visible: boolean = false
  graph_data_line!: DataGraphLine;

  public visible_graph: boolean = false;
  public width_graph: number | any = window.innerWidth * 0.6 - 40;
  public height_graph: number | any = 300;

  search_date = new FormGroup({
    start: new FormControl(this.startDateDefault),
    end: new FormControl(this.endDateDefault),
  });

  constructor(private searchSvc: SearchService,
              private http: HttpClient) {
    this.graph_data_line = this.searchSvc.empty_DataGraphLine;
  }

  ngOnInit(): void {

    this.startDateSelected = this.startDateDefault;
    this.endDateSelected = this.endDateDefault;
    this.searchSvc.update_range();

    this.searchSvc.map_moved.subscribe({
      next: (coords: Array<number>) => {
        this.visible_graph = false;
      },
      error: (err: any) => {
        console.error(err)
      }
    });

    this.search_date.valueChanges.subscribe(() => {
      this.startDateSelected = moment(this.search_date.controls['start'].value).format("DD/MM/YYYY");
      this.endDateSelected = moment(this.search_date.controls['end'].value).format("DD/MM/YYYY");
      this.searchSvc.update_range();
    });

    this.searchSvc.configuration_changed.subscribe((conf: string) => {
      this.configuration = conf;
    });

    this.searchSvc.graph_line_changed.subscribe((graph_data: DataGraphLine) => {
      this.visible_graph = true;
      this.format = graph_data.history ? this.format_history : this.format_graph;
      this.graph_data_line=graph_data
    });

  }

  /**
   *
   */
  public get startDateSelected(): string {
    return this._startDateSelected
  }

  public set startDateSelected(value: string) {
    this._startDateSelected = value;
    this.searchSvc.startDate = value;
  }

  public onDateChange(): void {}

  /**
   *
   */
  public get endDateSelected(): string {
    return this._endDateSelected;
  }

  public set endDateSelected(value: string) {
    this._endDateSelected = value;
    this.searchSvc.endDate = value;
  }

  /**
   *
   * @param type
   */
  public onExport(type: string) {

    let output: string = `${this.graph_data_line.url}&outputFormat=`
    output += type == 'CSV' ?
              'csv' :
              type == 'JSON' ?
              'application/json' :
              '';

    let respT: string = type == 'CSV' ?
              'text/csv' :
              type == 'JSON' ?
              'application/json' :
              '';

    this.downloadFile(output, respT).subscribe({
      next: (res: any) => {

        let t: string = type == 'CSV' ?
              'text/csv' :
              type == 'JSON' ?
              'text/json; charset=utf-8' :
              '';

        let ext: string = type == 'CSV' ?
              '.csv' :
              type == 'JSON' ?
              '.json' :
              '';

        let filename: string = _.replace(this.graph_data_line.title, ' ', '_') + ext;
        let blob: any = new Blob([res], { type: t });
        const url = window.URL.createObjectURL(blob);
        fileSaver.saveAs(blob, filename);


      },
      error: (error: any) => {
        console.error(error);
      }
    });

  }

  downloadFile(url: string, responseType: any): Observable<any>{
    return this.http.get(url, { responseType: responseType });
  }

  public closeGraph(): void {
    this.visible_graph = false;
  }

}
