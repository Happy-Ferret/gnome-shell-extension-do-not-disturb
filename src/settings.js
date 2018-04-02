const Gio = imports.gi.Gio;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/**
 * A class which handles all interactions with the settings.
 */
var SettingsManager = new Lang.Class({
	Name: 'SettingsManager',

	/**
	 * Represents a settings repository, where settings can be modified and read.
	 * @constructor
	 */
	_init(){
		this._appSettings = _getSettings();
		this._notificationSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });
		this._soundSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.sound' });
	},

	/**
	 * Enable or disable do not disturb mode (hide banners and mute sounds if enabled).
	 * 
	 * @param  {boolean} enabled - True if do not disturb should be enabled, false otherwise.
	 */
	setDoNotDisturb(enabled){
		this._soundSettings.set_boolean('event-sounds', !enabled);
		this._notificationSettings.set_boolean('show-banners', !enabled);
	},

	/**
	 * Determines if do not disturb is enabled or not.
	 * 
	 * @returns {boolean} - True if do not disturb is enabled, false otherwise.
	 */
	isDoNotDisturb(){
		return !this._notificationSettings.get_boolean('show-banners');
	},

	/**
	 * Calls a function when the status of the do not disturb setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the do not disturb setting is changed.
	 */
	onDoNotDisturbChanged(fn){
		this._notificationSettings.connect('changed::show-banners', fn);
	},

	/**
	 * Enable or disable the icon in the system panel when do not disturb mode is enabled.
	 * 
	 * @param  {boolean} showIcon - True if the icon should be shown, false otherwise.
	 */
	setShowIcon(showIcon){
		this._appSettings.set_boolean('show-icon', showIcon);
	},

	/**
	 * Determines if the icon should be shown or not.
	 * 
	 * @returns {boolean} - True if the icon should be shown when do not disturb is enabled, false otherwise.
	 */
	shouldShowIcon(){
		return this._appSettings.get_boolean('show-icon');
	},

	/**
	 * Calls a function when the status of the show icon setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the show icon setting is changed.
	 */
	onShowIconChanged(fn){
		this._appSettings.connect('changed::show-icon', fn);
	},

	/**
	 * Determines if the sound should be muted when do not disturb is enabled. 
	 * 
	 * @returns {boolean} - True if the sound should be muted when do not disturb is enabled, false otherwise.
	 */
	shouldMuteSound(){
		return this._appSettings.get_boolean('mute-sounds');
	},

	/**
	 * Enable or disable the muting of sound when do not disturb mode is enabled.
	 * 
	 * @param  {boolean} muteSound - True if the sound should be muted when do not disturb is enabled, false otherwise.
	 */
	setShouldMuteSound(muteSound){
		this._appSettings.set_boolean('mute-sounds', muteSound);
	},

	/**
	 * Calls a function when the status of the mute sounds setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the mute sounds setting is changed.
	 */
	onMuteSoundChanged(fn){
		this._appSettings.connect('changed::mute-sounds', fn);
	},

	/**
	 * Determines if the notification dot should be hidden when do not disturb is enabled. 
	 * 
	 * @returns {boolean} - True if the notification dot should be hidden when do not disturb is enabled, false otherwise.
	 */
	shouldHideNotificationDot(){
		return this._appSettings.get_boolean('hide-dot');
	},

	/**
	 * Enable or disable the hiding of the notification dot when do not disturb mode is enabled.
	 * 
	 * @param  {boolean} hideDot - True if the notification dot should be hidden when do not disturb is enabled, false otherwise.
	 */
	setShouldHideNotificationDot(hideDot){
		this._appSettings.set_boolean('hide-dot', hideDot);
	},

	/**
	 * Calls a function when the status of the hide notification dot setting has changed.
	 * 
	 * @param {() => ()} fn - The function to call when the hide notification dot setting is changed.
	 */
	onHideNotificationDotChanged(fn){
		this._appSettings.connect('changed::hide-dot', fn);
	},

	/**
	 * Mutes all sounds.
	 */
	muteAllSounds(){
		var [res, stdout, stderr, status] = GLib.spawn_sync(
	        null,
	        ["amixer", "-q", "-D", "pulse", "sset", "Master", "mute"],
	        null,
	        GLib.SpawnFlags.SEARCH_PATH,
	        null,
	        null);
	},

	/**
	 * Unmutes all sounds.
	 */
	unmuteAllSounds(){
		var [res, stdout, stderr, status] = GLib.spawn_sync(
	        null,
	        ["amixer", "-q", "-D", "pulse", "sset", "Master", "unmute"],
	        null,
	        GLib.SpawnFlags.SEARCH_PATH,
	        null,
	        null);	
	},
});

/**
 * A helper function to get the application specific settings. Adapted
 * from the System76 Pop Suspend Button extension: https://github.com/pop-os/gnome-shell-extension-pop-suspend-button
 * 
 * @returns {Gio.Settings} - The application specific settings object.
 */
function _getSettings() {
    let schemaName = 'org.gnome.shell.extensions.kylecorry31-do-not-disturb';
    let schemaDir = Me.dir.get_child('schemas').get_path();

    // Extension installed in .local
    if (GLib.file_test(schemaDir + '/gschemas.compiled', GLib.FileTest.EXISTS)) {
        let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir,
                                  Gio.SettingsSchemaSource.get_default(),
                                  false);
        let schema = schemaSource.lookup(schemaName, false);

        return new Gio.Settings({ settings_schema: schema });
    }
    // Extension installed system-wide
    else {
        if (Gio.Settings.list_schemas().indexOf(schemaName) == -1)
            throw "Schema \"%s\" not found.".format(schemaName);
        return new Gio.Settings({ schema: schemaName });
    }
}