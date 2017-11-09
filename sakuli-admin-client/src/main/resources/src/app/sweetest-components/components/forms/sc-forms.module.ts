import {NgModule} from "@angular/core";
import {PreventRoutingGuardService} from "./prevent-routing-guard.service";
import {InplaceFileEditorComponent} from "./inplace-file-editor.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ScEditorComponent} from "./editor/sc-editor.component";
import {ScIconModule} from "../presentation/icon/sc-icon.module";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ScIconModule,
    CommonModule
  ],
  providers: [
    PreventRoutingGuardService
  ],
  declarations: [
    InplaceFileEditorComponent,
    ScEditorComponent
  ],
  exports: [
    InplaceFileEditorComponent,
    ScEditorComponent
  ]
})
export class ScFormsModule {}
