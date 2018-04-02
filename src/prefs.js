// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-
// Adapted from lockkeys@vaina.lt and https://github.com/pop-os/gnome-shell-extension-pop-suspend-button

const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Settings = Me.imports.settings;

function init() {
}

/**
 * Builds the GTK widget which displays all of the application specific settings.
 * 
 * @returns {Gtk.Box} - The frame to display.
 */
function buildPrefsWidget() {
    settings = new Settings.SettingsManager();
    let frame = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL,
        border_width: 10, margin: 20});
    frame.add(createSwitch(settings.shouldShowIcon(), (b) => settings.setShowIcon(b), ("Enabled Icon"), ("Show an indicator icon when do not disturb is enabled.")));
    frame.add(createSwitch(settings.shouldMuteSound(), (b) => settings.setShouldMuteSound(b), ("Mute Sounds"), ("Mutes all sound when do not disturb is enabled.")));
    frame.add(createSwitch(settings.shouldHideNotificationDot(), (b) => settings.setShouldHideNotificationDot(b), ("Hide Notification Dot"), ("Hides the notification dot when do not disturb is enabled.")));
    
    frame.show_all();
    return frame;
}

/**
 * Creates a switch setting.
 * 
 * @param {boolean} active - The starting state of the switch. 
 * @param {(boolean) => ()} set - The setter function which is passed the value of the switch on state change.
 * @param {string} text - The label of the widget.
 * @param {string} tooltip - The description text to display on hover. 
 * @returns {Gtk.Box} - The widget containing the switch and label.
 */
function createSwitch(active, set, text, tooltip) {
    let box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    let label = new Gtk.Label({ label: text, xalign: 0, tooltip_text:tooltip });
    let widget = new Gtk.Switch({ active: active });
    widget.connect('notify::active', function(switch_widget) {
        set(switch_widget.active);
    });

    box.pack_start(label, true, true, 0);
    box.add(widget);
    return box;
}

