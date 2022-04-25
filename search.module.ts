import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '@search/search.component';
import { SearchConfigComponent } from '@search/search-config/search-config.component';
import { SearchAmbienteComponent } from '@search/search-ambiente/search-ambiente.component';
import { MaterialModule } from '@material/material.module';
import { SearchService } from '@search/search.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { GraphModule } from '@graph/graph.module';
import { CopernicusModule } from '@copernicus/copernicus.module'

const components = [
  SearchAmbienteComponent,
  SearchComponent,
  SearchConfigComponent
]

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    GraphModule,
    CopernicusModule
  ],
  providers: [
    SearchService
  ]
})
export class SearchModule { }
