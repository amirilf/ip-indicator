const { Gtk, Gio, GObject } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

function init() {}

function buildPrefsWidget() {
  const settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.ip-indicator");

  const mainGrid = new Gtk.Grid({
    margin_start: 24,
    margin_end: 24,
    margin_top: 24,
    margin_bottom: 24,
    column_spacing: 16,
    row_spacing: 16,
    visible: true,
  });

  let rowNum = 0;

  addSectionHeader(mainGrid, "Refresh Settings", rowNum++);

  const intervalLabel = createLabel("Refresh Interval (seconds):");
  mainGrid.attach(intervalLabel, 0, rowNum, 1, 1);

  const intervalInput = new Gtk.SpinButton({
    adjustment: new Gtk.Adjustment({
      lower: 0,
      upper: 3600,
      step_increment: 30,
      page_increment: 60,
    }),
    visible: true,
  });
  settings.bind("refresh-interval", intervalInput, "value", Gio.SettingsBindFlags.DEFAULT);
  mainGrid.attach(intervalInput, 1, rowNum, 1, 1);

  const intervalHint = createHintLabel("0 = disabled, values in multiples of 30");
  mainGrid.attach(intervalHint, 2, rowNum, 1, 1);
  rowNum++;

  addSectionHeader(mainGrid, "Display Settings", rowNum++);

  const positionLabel = createLabel("Panel Position:");
  mainGrid.attach(positionLabel, 0, rowNum, 1, 1);

  const positionDropdown = new Gtk.ComboBoxText({ visible: true });
  positionDropdown.append("left", "Left");
  positionDropdown.append("center", "Center");
  positionDropdown.append("right", "Right");
  settings.bind("panel-position", positionDropdown, "active-id", Gio.SettingsBindFlags.DEFAULT);
  mainGrid.attach(positionDropdown, 1, rowNum, 1, 1);
  rowNum++;

  return mainGrid;
}

function createLabel(text) {
  return new Gtk.Label({
    label: text,
    halign: Gtk.Align.START,
    visible: true,
  });
}

function createHintLabel(text) {
  return new Gtk.Label({
    label: text,
    halign: Gtk.Align.START,
    visible: true,
    sensitive: false,
    use_markup: true,
  });
}

function addSectionHeader(grid, title, row) {
  const header = new Gtk.Label({
    label: `<b>${title}</b>`,
    halign: Gtk.Align.START,
    use_markup: true,
    visible: true,
  });
  grid.attach(header, 0, row, 3, 1);
}
