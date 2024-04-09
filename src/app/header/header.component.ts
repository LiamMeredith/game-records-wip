import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "@auth0/auth0-angular";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  @Input() public user!: User;
  @Input() public authenticated = false;
  @Output() public logout = new EventEmitter<void>();
  @Output() public signIn = new EventEmitter<void>();
}
