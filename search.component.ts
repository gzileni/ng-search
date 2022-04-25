import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MapService } from '@map/map.service';
import { SearchService } from '@search/search.service';
import { SearchAmbienteService } from './search-ambiente/search-ambiente.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  search = new FormControl('');
  isConfiguration: boolean = false;
  search_response_range: string = '';
  search_response_pollution: string = '';
  search_response_station: string = '';
  configuration: string = '';
  loading: boolean = false;

  constructor(private searchSvc: SearchService,
              private searchAmb: SearchAmbienteService,
              private mapSvc: MapService) { }

  ngOnInit(): void {

    this.searchSvc.loading.subscribe((res: boolean) => {
      this.loading = res;
    });

    this.search.valueChanges.subscribe(() => {
      this.searchSvc.location = this.search.value;
    });

    this.searchAmb.pollution_changed.subscribe((pollution: string) => {
      this.search_response_pollution = pollution;
    });

    this.searchAmb.station_changed.subscribe((station: string) => {
      if (station != '') {
        this.search_response_station = station;
      }
    });

    this.searchSvc.range_changed.subscribe((res: string) => {
      this.search_response_range = res;
    });

    this.mapSvc.clicked.subscribe((res: any) => {
      this.mapSvc.getFeatureFromMap(res.pixel).then((feature: any) => this.searchSvc.moveTo(feature))
    })

  }

  /**
   *
   * @param event
   */
  public onSearch(event: any) {
    this.searchSvc.search(this.search.value)
  }

  /**
   *
   * @param event
   */
  public onConfiguration(event: string): void {
    this.isConfiguration = !this.isConfiguration;
    this.configuration = event;
    this.searchSvc.update_configuration(event);
  }

  public get isLayerFoto(): boolean {
    return this.mapSvc.is_layer_foto
  }

  /**
   *
   */
  public addLayerFoto(): void {
    this.mapSvc.add_layer_foto();
  }


}
