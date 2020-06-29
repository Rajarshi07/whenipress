var PendingKeyboardEvent = require('./PendingKeyboardEvent')
var PluginsManager = require('./PluginsManager')
var filter = require('lodash/filter')

class PendingKeyboardEventManager {

    constructor() {
        this.registeredEvents = []
        this.modifiers = []
        this.pluginsManager = new PluginsManager(this)
    }

    register(...keys) {
        let keysWithModifiers = [...this.modifiers, ...keys]
        var event = new PendingKeyboardEvent(this, ...keysWithModifiers)
        this.registeredEvents.push(event)
        this.pluginsManager.handle('bindingRegistered', keysWithModifiers)
        return event
    }

    group(keys, handler) {
        this.modifiers = typeof keys === 'string' ? [keys] : keys
        handler()
        this.modifiers = []
    }

    use(...plugins) {
        this.pluginsManager.add(...plugins)
        this.pluginsManager.handleSpecific(plugins, 'mounted')
    }

    pluginWithOptions(plugin, options) {
        return {...plugin, options: {...plugin.options, ...options}}
    }

    flushPlugins() {
        this.pluginsManager = new PluginsManager(this)
    }

    bindings() {
        return this.registeredEvents.map(event => event.keysToWatch)
    }

    stopAll() {
        this.registeredEvents.forEach(event => event.stop())
        this.registeredEvents = []
        this.pluginsManager.handle('allBindingsStopped')
    }

    _childStopped(child) {
        this.registeredEvents = filter(this.registeredEvents, event => event !== child)
        this.pluginsManager.handle('bindingStopped', child.keysToWatch)
    }

}

module.exports = PendingKeyboardEventManager