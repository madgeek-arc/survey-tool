import { Injectable } from "@angular/core";
import * as all from "./icons";
import { Icon } from "./icons";

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  private registry = new Map<string, Icon>();

  constructor() {
  }

  public registerIcons(icons: any[]): void {
    icons.forEach((icon: Icon) => this.registry.set(icon.name, icon));
  }

  public getIcon(iconName: string): Icon | undefined {
    return this.registry.get(iconName);
  }

  public getAll(): Icon[] {
    let icons: Icon[] = [];
    for (let key in all) {
      icons.push(all[key]);
    }
    return icons;
  }
}
