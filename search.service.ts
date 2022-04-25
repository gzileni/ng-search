import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MapService } from '../map/map.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeoJSON } from 'ol/format';

import moment from 'moment';
import _ from 'lodash-es';

export interface DataGraphLine {
  label: string,
  dataset: Array<number> | any,
  title: string,
  subtitle: string,
  um: string,
  max: number,
  info: string,
  url: string,
  history: boolean
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  public coordinates: Array<number> = [];

  private _map_moved = new Subject<Array<number>>();
  public map_moved = this._map_moved.asObservable();

  private _range_changed = new Subject<string>();
  public range_changed = this._range_changed.asObservable();

  private _configuration_changed = new Subject<string>();
  public configuration_changed = this._configuration_changed.asObservable();

  private _graph_line_changed = new Subject<DataGraphLine>();
  public graph_line_changed = this._graph_line_changed.asObservable();

  private _loading = new Subject<boolean>();
  public loading = this._loading.asObservable();

  private _startDate: any = null;
  private _endDate: any = null;

  public dateISOStart: any = null;
  public dateISOEnd: any = null;

  public location: string | any = null;

  constructor(private mapSvc: MapService,
              private http: HttpClient) { }

  /** search */
  public search(location?: string | any): void {

    const l: string | any = location != null && location != undefined && location != '' ?
                            location :
                            this.location;

    if (l != '' && l != null && l != undefined) {
      const url: string = `/ambiente/geocode/${l}/${this.mapSvc.srCode}`;
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json; charset=UTF-8');

      this.http.get(url, { headers }).subscribe({
        next: (res: any) => {
          this._goTo(res);
        },
        error: (e: any) => {
          console.error(e)
        }
      })
    } else {
      this.coordinates = [];
      this._map_moved.next(this.coordinates);
    }

  }

  /**
   *
   * @param visible
   */
  public spinner(visible: boolean) {
    this._loading.next(visible);
  }

  /**
   *
   */
  public update_range(): void {
    this._range_changed.next(`${this.startDate} - ${this.endDate}`)
  }

  /**
   *
   * @param conf
   */
  public update_configuration(conf: string) {
    this._configuration_changed.next(conf);
  }

  /**
   *
   * @param data
   */
  public update_graph_line(data: DataGraphLine) {
    this._graph_line_changed.next(data)
  }

  public get empty_DataGraphLine(): DataGraphLine {
    return {
      label: '',
      dataset: [],
      title: '',
      subtitle: '',
      info: '',
      um: '',
      max: 0,
      url: '',
      history: false
    }
  }

  public get_filter(field?: string): string {
    const f: string = field != null && field != undefined ? field : 'ts';
    let filter: string = '&CQL_FILTER=(';
    filter += `${f} AFTER ${this.dateISOStart} `;
    filter += `AND ${f} BEFORE ${this.dateISOEnd} `
    return filter
  }

  /**
   *
   */
  public get startDate(): any {
    return this._startDate
  }

  /**
   *
   */
  public set startDate(value: any) {
    this._startDate = value;
    this.dateISOStart = moment.parseZone(value, ['DD/MM/YYYY']).utc().format();
  }

  /**
   *
   */
  public get endDate(): any {
    return this._endDate
  }

  /**
   *
   */
  public set endDate(value: any) {
    this._endDate = value
    this.dateISOEnd = moment.parseZone(value, ['DD/MM/YYYY']).format();
  }

  /**
   *
   * @param feature
   */
  public moveTo(feature: any): void {
    this._moveTo(feature.getGeometry())
  }

  /**
   *
   * @param feature
   */
  private _goTo(feature: any): void {

    let format: any = new GeoJSON();

    let geometries: Array<any> = _.map(format.readFeatures(feature), (f: any) => {
      return f.getGeometry()
    });

    const isNullIdx: number = _.findIndex(geometries, (g: any) => {
      return g == null
    });

    if (_.size(geometries) > 0 && isNullIdx == -1) {
      this._moveTo(geometries[0]);
    }
  }

  /**
   *
   * @param geometry
   */
  private _moveTo(geometry: any): void {
    const point = geometry;
    // const size: any = this.mapSvc.map.getSize();
    this.coordinates = point.getCoordinates();
    this.mapSvc.view.setCenter(this.coordinates);
    this.mapSvc.view.setZoom(12);
    this._map_moved.next(this.coordinates);
  }

}
