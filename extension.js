const { GObject, St, Gio, GLib, Clutter } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Fetcher = Me.imports.js.fetcher;
const Names = Me.imports.js.names;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, "IP Indicator", false);

      this.settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.ip-indicator");
      this.fetcher = new Fetcher.IpFetcher();
      this.publicIP = "...";
      this.localIP = null;
      this.countryCode = null;
      this.refreshTimer = null;

      this.createUI();
      this.createPopupMenu();
      this.connectSettingsSignals();

      this.updateIPInfo();
      this.startRefreshTimer();
    }

    createUI() {
      const container = new St.BoxLayout({
        style_class: "panel-status-menu-box",
        y_align: Clutter.ActorAlign.CENTER,
      });

      this.flagIcon = new St.Icon({
        style_class: "system-status-icon",
        icon_size: 16,
      });

      this.ipText = new St.Label({
        text: "...",
        y_align: Clutter.ActorAlign.CENTER,
        style: "padding-top: 3px; margin-left: 4px;",
      });

      container.add_child(this.flagIcon);
      container.add_child(this.ipText);
      this.add_child(container);
    }

    createPopupMenu() {
      this.publicIPItem = new PopupMenu.PopupMenuItem("Public IP : Loading...", { reactive: false });
      this.localIPItem = new PopupMenu.PopupMenuItem("Local IP  : Loading...", { reactive: false });
      this.countryItem = new PopupMenu.PopupMenuItem("Country   : Loading...", { reactive: false });

      this.menu.addMenuItem(this.publicIPItem);
      this.menu.addMenuItem(this.localIPItem);
      this.menu.addMenuItem(this.countryItem);
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const updateBtn = new PopupMenu.PopupMenuItem("Update Now");
      updateBtn.connect("activate", () => this.updateIPInfo());
      this.menu.addMenuItem(updateBtn);
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      const settingsBtn = new PopupMenu.PopupMenuItem("Settings");
      settingsBtn.connect("activate", () => {
        imports.misc.util.spawn(["gnome-extensions", "prefs", Me.metadata.uuid]);
      });
      this.menu.addMenuItem(settingsBtn);
    }

    connectSettingsSignals() {
      this.refreshIntervalSignal = this.settings.connect("changed::refresh-interval", () => {
        this.startRefreshTimer();
      });

      this.positionSignal = this.settings.connect("changed::panel-position", () => {
        this.changePosition();
      });
    }

    changePosition() {
      const position = this.settings.get_string("panel-position");
      const parent = this.container.get_parent();

      if (parent) parent.remove_actor(this.container);

      const boxes = {
        left: Main.panel._leftBox,
        center: Main.panel._centerBox,
        right: Main.panel._rightBox,
      };

      const targetBox = boxes[position];
      if (!targetBox) return;

      if (position === "left") {
        targetBox.insert_child_at_index(this.container, 0);
      } else if (position === "right") {
        const numChildren = targetBox.get_n_children();
        targetBox.insert_child_at_index(this.container, Math.max(0, numChildren - 5));
      } else {
        targetBox.add_actor(this.container);
      }
    }

    async updateIPInfo() {
      this.stopRefreshTimer();

      try {
        const result = await this.fetcher.fetchPublicIP();
        this.publicIP = result.ip;
        this.countryCode = result.country;
      } catch (err) {
        log(`[IP Indicator] Failed: ${err.message}`);
        this.publicIP = "Error";
        this.countryCode = null;
      }

      this.localIP = this.fetcher.fetchLocalIP();
      this.refreshDisplay();
      this.startRefreshTimer();
    }

    refreshDisplay() {
      this.ipText.text = this.publicIP;

      const flagPath = this.countryCode ? `${Me.path}/icon/flags/${this.countryCode}.png` : `${Me.path}/icon/error.png`;
      const flagFile = Gio.File.new_for_path(flagPath);
      const iconPath = this.countryCode && flagFile.query_exists(null) ? flagPath : `${Me.path}/icon/error.png`;

      this.flagIcon.gicon = Gio.icon_new_for_string(iconPath);

      const countryName = Names.getCountryName(this.countryCode);

      this.publicIPItem.label.text = `Public IP : ${this.publicIP}`;
      this.localIPItem.label.text = `Local IP  : ${this.localIP || "N/A"}`;
      this.countryItem.label.text = `Country   : ${countryName}`;
    }

    startRefreshTimer() {
      this.stopRefreshTimer();

      const interval = this.settings.get_int("refresh-interval");
      if (interval === 0) return;

      this.refreshTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, interval, () => {
        this.updateIPInfo();
        return GLib.SOURCE_REMOVE;
      });
    }

    stopRefreshTimer() {
      if (this.refreshTimer) {
        GLib.Source.remove(this.refreshTimer);
        this.refreshTimer = null;
      }
    }

    destroy() {
      this.stopRefreshTimer();

      if (this.refreshIntervalSignal) this.settings.disconnect(this.refreshIntervalSignal);
      if (this.positionSignal) this.settings.disconnect(this.positionSignal);

      if (this.fetcher) this.fetcher.destroy();

      super.destroy();
    }
  }
);

let indicator;

function init() {}

function enable() {
  const settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.ip-indicator");
  const position = settings.get_string("panel-position");

  indicator = new Indicator();

  const index = position === "right" ? -1 : 0;
  Main.panel.addToStatusArea("ip-indicator", indicator, index, position);
}

function disable() {
  if (indicator) {
    indicator.destroy();
    indicator = null;
  }
}
